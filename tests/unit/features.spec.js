import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import Vue3CoolSelect from '../../src/index'

const languages = ['JS', 'PHP', 'CSS', 'HTML']
const users = [
  { id: 1, name: 'Anna', code: 'A1' },
  { id: 2, name: 'Boris', code: 'B2', blocked: true },
  { id: 3, name: 'Clara', code: 'C3' }
]
const grouped = [
  { name: 'Frontend', children: [{ id: 1, name: 'JS' }, { id: 2, name: 'CSS' }] },
  { name: 'Backend', children: [{ id: 3, name: 'PHP' }] },
  { id: 4, name: 'SQL' }
]

async function mountSelect (options) {
  const wrapper = mount(Vue3CoolSelect, options)

  wrapper.vm.menuRendered = true
  await nextTick()

  return wrapper
}

const input = wrapper => wrapper.find('.IZ-select__input input:not([type=hidden])')
const items = wrapper => wrapper.findAll('.IZ-select__item:not(.IZ-select__create)')
const chips = wrapper => wrapper.findAll('.IZ-select__chip')
const lastEmitted = (wrapper, event) => {
  const calls = wrapper.emitted(event)

  return calls[calls.length - 1][0]
}

async function search (wrapper, text) {
  input(wrapper).element.value = text
  await input(wrapper).trigger('input')
}

// resolves pending promises (answers of mocked requests)
const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('keeping the selection', () => {
  it('keeps the selected item when it leaves the items', async () => {
    const wrapper = await mountSelect({
      props: { items: users, modelValue: 3, itemValue: 'id', itemText: 'name' }
    })

    await wrapper.setProps({ items: users.slice(0, 2) })

    expect(input(wrapper).element.value).toBe('Clara')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('shows "selected-item" for a value which is not in items', async () => {
    const wrapper = await mountSelect({
      props: {
        items: [],
        modelValue: 7,
        selectedItem: { id: 7, name: 'Saved' },
        itemValue: 'id',
        itemText: 'name'
      }
    })

    expect(input(wrapper).element.value).toBe('Saved')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('keeps an unknown value in v-model without showing it', async () => {
    const wrapper = await mountSelect({
      props: { items: users, modelValue: 99, itemValue: 'id', itemText: 'name' }
    })

    expect(input(wrapper).element.value).toBe('')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // the item arrives later
    await wrapper.setProps({ items: users.concat([{ id: 99, name: 'Late' }]) })

    expect(input(wrapper).element.value).toBe('Late')
  })

  it('keeps the selection while typing with clear-on-search="false"', async () => {
    const wrapper = await mountSelect({
      props: { items: languages, modelValue: 'JS', clearOnSearch: false }
    })

    await search(wrapper, 'p')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toEqual([['PHP']])
  })
})

describe('clearable', () => {
  it('removes the selection by the clear button', async () => {
    const wrapper = await mountSelect({ props: { items: languages, modelValue: 'PHP', clearable: true } })

    expect(wrapper.find('.IZ-select__clear').exists()).toBe(true)

    await wrapper.find('.IZ-select__clear').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.find('.IZ-select__clear').exists()).toBe(false)
  })

  it('has no clear button without a value, when disabled or without the prop', async () => {
    const empty = await mountSelect({ props: { items: languages, clearable: true } })
    const disabled = await mountSelect({ props: { items: languages, modelValue: 'JS', clearable: true, disabled: true } })
    const plain = await mountSelect({ props: { items: languages, modelValue: 'JS' } })

    for (const wrapper of [empty, disabled, plain]) {
      expect(wrapper.find('.IZ-select__clear').exists()).toBe(false)
    }
  })
})

describe('multiple', () => {
  it('shows the values of v-model as chips', async () => {
    const wrapper = await mountSelect({
      props: { items: users, modelValue: [3, 1], multiple: true, itemValue: 'id', itemText: 'name' }
    })

    expect(chips(wrapper).map(c => c.find('.IZ-select__chip-text').text())).toEqual(['Clara', 'Anna'])
    expect(input(wrapper).element.value).toBe('')
    expect(items(wrapper).filter(i => i.classes().includes('IZ-select__item--selected')).map(i => i.text()))
      .toEqual(['Anna', 'Clara'])
    expect(wrapper.classes()).toContain('IZ-select--multiple')
  })

  it('adds and removes items by click and keeps the menu open', async () => {
    const wrapper = await mountSelect({ props: { items: languages, modelValue: [], multiple: true } })

    await wrapper.trigger('mousedown')
    await items(wrapper)[1].trigger('click')
    await wrapper.setProps({ modelValue: lastEmitted(wrapper, 'update:modelValue') })
    await items(wrapper)[3].trigger('click')
    await wrapper.setProps({ modelValue: lastEmitted(wrapper, 'update:modelValue') })

    expect(wrapper.props('modelValue')).toEqual(['PHP', 'HTML'])
    expect(wrapper.vm.hasMenu).toBe(true)

    // a click on a selected item removes it
    await items(wrapper)[1].trigger('click')

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual(['HTML'])
    expect(wrapper.emitted('remove')).toEqual([['PHP']])
  })

  it('removes a chip by its button and the last chip by backspace', async () => {
    const wrapper = await mountSelect({
      props: { items: languages, modelValue: ['JS', 'PHP', 'CSS'], multiple: true }
    })

    await chips(wrapper)[0].find('.IZ-select__chip-remove').trigger('click')
    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual(['PHP', 'CSS'])

    await wrapper.setProps({ modelValue: ['PHP', 'CSS'] })
    await input(wrapper).trigger('keydown', { key: 'Backspace' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual(['PHP'])
  })

  it('does not clear the selection while typing and selects by enter', async () => {
    const wrapper = await mountSelect({ props: { items: languages, modelValue: ['JS'], multiple: true } })

    await search(wrapper, 'ht')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual(['JS', 'HTML'])
    expect(wrapper.vm.searchData).toBe('')
  })

  it('reacts to an array changed in place and to close-on-select', async () => {
    const model = ['JS']
    const wrapper = mount({
      components: { Vue3CoolSelect },
      data: () => ({ model, items: languages }),
      template: '<Vue3CoolSelect v-model="model" :items="items" multiple close-on-select />'
    })

    wrapper.vm.model.push('CSS')
    await nextTick()

    expect(wrapper.findAll('.IZ-select__chip')).toHaveLength(2)

    await wrapper.find('.IZ-select').trigger('mousedown')
    await wrapper.findAll('.IZ-select__item')[1].trigger('click')

    expect(wrapper.vm.model).toEqual(['JS', 'CSS', 'PHP'])
    expect(wrapper.find('.IZ-select__menu').element.style.visibility).toBe('hidden')
  })

  it('clears everything and keeps unknown values when items are added', async () => {
    const wrapper = await mountSelect({
      props: { items: languages, modelValue: ['JS', 'GONE'], multiple: true, clearable: true }
    })

    expect(chips(wrapper)).toHaveLength(1)

    await wrapper.trigger('mousedown')
    await items(wrapper)[2].trigger('click')

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual(['GONE', 'JS', 'CSS'])

    await wrapper.find('.IZ-select__clear').trigger('click')

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual([])
  })

  it('renders the "chip" slot', async () => {
    const wrapper = await mountSelect({
      props: { items: languages, modelValue: ['CSS'], multiple: true },
      slots: { chip: ({ item, remove }) => h('b', { class: 'my-chip', onClick: remove }, item + '!') }
    })

    expect(wrapper.find('.my-chip').text()).toBe('CSS!')

    await wrapper.find('.my-chip').trigger('click')

    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual([])
  })
})

describe('taggable', () => {
  it('creates a value from the typed text by enter', async () => {
    const wrapper = await mountSelect({
      props: { items: languages, modelValue: [], multiple: true, taggable: true }
    })

    await search(wrapper, ' Rust ')

    expect(wrapper.find('.IZ-select__create').text()).toBe('Add "Rust"')

    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('create')).toEqual([['Rust']])
    expect(lastEmitted(wrapper, 'update:modelValue')).toEqual(['Rust'])

    await wrapper.setProps({ modelValue: ['Rust'] })

    expect(chips(wrapper)[0].find('.IZ-select__chip-text').text()).toBe('Rust')
  })

  it('selects the existing item instead of creating a duplicate', async () => {
    const wrapper = await mountSelect({ props: { items: languages, taggable: true } })

    await search(wrapper, 'php')

    expect(wrapper.find('.IZ-select__create').exists()).toBe(false)

    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('create')).toBeUndefined()
    expect(lastEmitted(wrapper, 'update:modelValue')).toBe('PHP')
  })

  it('creates by a click on the create row and shows an unknown value of v-model', async () => {
    const wrapper = await mountSelect({ props: { items: languages, modelValue: 'Go', taggable: true } })

    expect(input(wrapper).element.value).toBe('Go')

    await search(wrapper, 'Zig')
    await wrapper.find('.IZ-select__create').trigger('click')

    expect(lastEmitted(wrapper, 'update:modelValue')).toBe('Zig')
    expect(wrapper.vm.hasMenu).toBe(false)
  })
})

describe('groups, disabled items and composed text', () => {
  it('renders groups with their items', async () => {
    const wrapper = await mountSelect({
      props: { items: grouped, itemChildren: 'children', itemValue: 'id', itemText: 'name' }
    })

    expect(wrapper.findAll('.IZ-select__group').map(g => g.text())).toEqual(['Frontend', 'Backend'])
    expect(items(wrapper).map(i => i.text())).toEqual(['JS', 'CSS', 'PHP', 'SQL'])
    expect(items(wrapper).map(i => i.classes().includes('IZ-select__item--child'))).toEqual([true, true, true, false])

    await items(wrapper)[2].trigger('click')

    expect(lastEmitted(wrapper, 'update:modelValue')).toBe(3)
  })

  it('hides groups without found items', async () => {
    const wrapper = await mountSelect({
      props: { items: grouped, itemChildren: 'children', itemValue: 'id', itemText: 'name' }
    })

    await search(wrapper, 'p')

    expect(wrapper.findAll('.IZ-select__group').map(g => g.text())).toEqual(['Backend'])
    expect(items(wrapper).map(i => i.text())).toEqual(['PHP'])
  })

  it('skips groups with arrows', async () => {
    const wrapper = await mountSelect({
      props: { items: grouped, itemChildren: 'children', itemValue: 'id', itemText: 'name' }
    })

    for (let i = 0; i < 3; i++) await wrapper.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toBe(3)
  })

  it('does not select disabled items', async () => {
    const wrapper = await mountSelect({
      props: { items: users, itemValue: 'id', itemText: 'name', itemDisabled: 'blocked' }
    })

    expect(items(wrapper)[1].classes()).toContain('IZ-select__item--disabled')
    expect(items(wrapper)[1].attributes('aria-disabled')).toBe('true')

    await items(wrapper)[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // arrows jump over the item
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toBe(3)
  })

  it('accepts a function for item-disabled and skips a disabled first item on enter', async () => {
    const wrapper = await mountSelect({
      props: { items: users, itemValue: 'id', itemText: 'name', itemDisabled: item => item.id === 1 }
    })

    await wrapper.trigger('mousedown')
    await wrapper.trigger('keydown', { key: 'Enter' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toBe(2)
  })

  it('composes the text from several properties or by a function', async () => {
    const fromArray = await mountSelect({
      props: { items: users, modelValue: 1, itemValue: 'id', itemText: ['code', 'name'] }
    })
    const fromFunction = await mountSelect({
      props: { items: users, modelValue: 3, itemValue: 'id', itemText: item => item.name.toUpperCase(), textSeparator: ' / ' }
    })

    expect(items(fromArray).map(i => i.text())).toEqual(['A1 - Anna', 'B2 - Boris', 'C3 - Clara'])
    expect(input(fromArray).element.value).toBe('A1 - Anna')
    expect(input(fromFunction).element.value).toBe('CLARA')

    await search(fromArray, 'b2 - b')

    expect(items(fromArray).map(i => i.text())).toEqual(['B2 - Boris'])
  })
})

describe('form inputs', () => {
  it('renders hidden inputs with the value', async () => {
    const single = await mountSelect({
      props: { items: users, modelValue: 3, itemValue: 'id', itemText: 'name', name: 'user_id', id: 'user' }
    })
    const hidden = wrapper => wrapper.findAll('input[type=hidden]').map(i => [i.attributes('name'), i.element.value])

    expect(hidden(single)).toEqual([['user_id', '3']])
    expect(input(single).attributes('id')).toBe('user')

    await single.setProps({ modelValue: null })
    expect(hidden(single)).toEqual([['user_id', '']])

    const multiple = await mountSelect({
      props: { items: languages, modelValue: ['JS', 'CSS'], multiple: true, name: 'langs' }
    })

    expect(hidden(multiple)).toEqual([['langs[]', 'JS'], ['langs[]', 'CSS']])
  })

  it('is required only while nothing is selected', async () => {
    const wrapper = await mountSelect({ props: { items: languages, required: true } })

    expect(input(wrapper).element.required).toBe(true)

    await wrapper.setProps({ modelValue: 'JS' })

    expect(input(wrapper).element.required).toBe(false)
  })
})

describe('menu-to', () => {
  it('renders the menu in the target and works from there', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: languages, menuTo: 'body' },
      attachTo: document.body
    })

    expect(document.body.querySelector('.IZ-select__menu')).toBe(null)

    await wrapper.trigger('mousedown')

    const menu = document.body.querySelector('.IZ-select__menu')

    expect(menu.parentElement).toBe(document.body)
    expect(wrapper.element.contains(menu)).toBe(false)
    expect(menu.classList.contains('IZ-select__menu--detached')).toBe(true)

    await nextTick()
    expect(menu.style.position).toBe('fixed')

    // a click inside the menu is not a click outside
    menu.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(wrapper.vm.focused).toBe(true)

    menu.querySelectorAll('.IZ-select__item')[2].click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['CSS']])

    wrapper.unmount()
    expect(document.body.querySelector('.IZ-select__menu')).toBe(null)
  })
})

describe('events and accessibility', () => {
  it('emits open and close', async () => {
    const wrapper = await mountSelect({ props: { items: languages } })

    await wrapper.trigger('mousedown')
    expect(wrapper.emitted('open')).toHaveLength(1)

    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('renders the menu only after the first opening', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: languages } })

    expect(wrapper.find('.IZ-select__menu').exists()).toBe(false)

    await wrapper.trigger('mousedown')

    expect(wrapper.find('.IZ-select__menu').exists()).toBe(true)
  })

  it('sets aria attributes', async () => {
    const wrapper = await mountSelect({ props: { items: languages, modelValue: 'PHP' } })

    expect(input(wrapper).attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.IZ-select__menu-items').attributes('role')).toBe('listbox')
    expect(items(wrapper).map(i => i.attributes('aria-selected'))).toEqual(['false', 'true', 'false', 'false'])

    await wrapper.trigger('keydown', { key: 'ArrowDown' })

    expect(input(wrapper).attributes('aria-expanded')).toBe('true')
    expect(input(wrapper).attributes('aria-activedescendant')).toBe(items(wrapper)[2].attributes('id'))
    expect(input(wrapper).attributes('aria-controls')).toBe(wrapper.find('.IZ-select__menu').attributes('id'))
  })

  it('uses home and end only when search is disabled', async () => {
    const wrapper = await mountSelect({ props: { items: languages, disableSearch: true } })

    await wrapper.trigger('focus')
    await wrapper.trigger('keydown', { key: 'End' })
    expect(wrapper.vm.selectedItemByArrows).toBe('HTML')

    await wrapper.trigger('keydown', { key: 'Home' })
    expect(wrapper.vm.selectedItemByArrows).toBe('JS')
  })
})

describe('remote search', () => {
  const pages = {
    '': [[{ id: 1, text: 'One' }, { id: 2, text: 'Two' }], [{ id: 3, text: 'Three' }]],
    tw: [[{ id: 2, text: 'Two' }]]
  }
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn(url => {
      const params = new URL(url, 'http://localhost').searchParams
      const list = pages[params.get('q')] || [[]]
      const page = Number(params.get('page'))

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: list[page - 1] || [], pagination: { more: page < list.length } })
      })
    })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const remoteProps = { searchUrl: '/api/search', itemValue: 'id', itemText: 'text', searchDelay: 50 }

  it('loads the first page when the menu opens', async () => {
    const wrapper = await mountSelect({ props: { ...remoteProps, searchParams: { group: 5 } } })

    expect(fetchMock).not.toHaveBeenCalled()

    await wrapper.trigger('mousedown')

    expect(wrapper.find('.IZ-select__loading').exists()).toBe(true)
    expect(wrapper.find('.IZ-select__spinner').exists()).toBe(true)

    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/search?q=&page=1&group=5')
    expect(items(wrapper).map(i => i.text())).toEqual(['One', 'Two'])
    expect(wrapper.find('.IZ-select__loading').exists()).toBe(false)

    // opening again does not repeat the request
    await wrapper.trigger('keydown', { key: 'Escape' })
    await wrapper.trigger('mousedown')
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('searches with a delay and sends only the last text', async () => {
    vi.useFakeTimers()

    const wrapper = await mountSelect({ props: remoteProps })

    await search(wrapper, 't')
    await vi.advanceTimersByTimeAsync(20)
    await search(wrapper, 'tw')

    expect(fetchMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(60)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/search?q=tw&page=1')
    expect(items(wrapper).map(i => i.text())).toEqual(['Two'])
  })

  it('loads the next page on scroll', async () => {
    const wrapper = await mountSelect({ props: remoteProps })

    await wrapper.trigger('mousedown')
    await flush()
    await wrapper.find('.IZ-select__menu-items').trigger('scroll')

    expect(wrapper.find('.IZ-select__loading--more').exists()).toBe(true)

    await flush()

    expect(wrapper.emitted('load-more')).toEqual([[2]])
    expect(items(wrapper).map(i => i.text())).toEqual(['One', 'Two', 'Three'])

    // there are no more pages
    await wrapper.find('.IZ-select__menu-items').trigger('scroll')
    await flush()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('keeps the selected item after another search', async () => {
    vi.useFakeTimers()

    const wrapper = await mountSelect({
      props: { ...remoteProps, modelValue: 9, selectedItem: { id: 9, text: 'Saved' }, clearOnSearch: false }
    })

    expect(input(wrapper).element.value).toBe('Saved')

    await search(wrapper, 'tw')
    await vi.advanceTimersByTimeAsync(60)
    await items(wrapper)[0].trigger('click')
    await wrapper.setProps({ modelValue: 2 })

    await search(wrapper, 'zzz')
    await vi.advanceTimersByTimeAsync(60)
    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(items(wrapper)).toHaveLength(0)
    expect(input(wrapper).element.value).toBe('Two')
  })

  it('waits for min-search-length', async () => {
    vi.useFakeTimers()

    const wrapper = await mountSelect({ props: { ...remoteProps, minSearchLength: 2 } })

    await wrapper.trigger('mousedown')
    await vi.advanceTimersByTimeAsync(60)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(wrapper.find('.IZ-select__no-data').text()).toBe('Type to search')

    await search(wrapper, 'tw')
    await vi.advanceTimersByTimeAsync(60)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('uses "search-request" and reloads when the parameters change', async () => {
    const searchRequest = vi.fn((text, page, params) => Promise.resolve({
      results: [{ id: params.group, text: 'Group ' + params.group }],
      more: false
    }))
    const wrapper = await mountSelect({
      props: { searchRequest, searchParams: { group: 1 }, itemValue: 'id', itemText: 'text' }
    })

    await wrapper.trigger('mousedown')
    await flush()

    expect(searchRequest.mock.calls[0].slice(0, 3)).toEqual(['', 1, { group: 1 }])
    expect(items(wrapper).map(i => i.text())).toEqual(['Group 1'])
    expect(fetchMock).not.toHaveBeenCalled()

    await wrapper.setProps({ searchParams: { group: 2 } })
    await flush()

    expect(items(wrapper).map(i => i.text())).toEqual(['Group 2'])
  })

  it('reports a failed request', async () => {
    fetchMock.mockImplementation(() => Promise.resolve({ ok: false, status: 500 }))

    const wrapper = await mountSelect({ props: remoteProps })

    await wrapper.trigger('mousedown')
    await flush()

    expect(wrapper.emitted('search-error')).toHaveLength(1)
    expect(wrapper.find('.IZ-select__no-data').exists()).toBe(true)
    expect(wrapper.find('.IZ-select__loading').exists()).toBe(false)
  })

  it('ignores the answer of an older request', async () => {
    const resolvers = []
    const searchRequest = vi.fn(text => new Promise(resolve => resolvers.push(() => resolve([{ id: text, text }]))))
    const wrapper = await mountSelect({
      props: { searchRequest, searchDelay: 0, itemValue: 'id', itemText: 'text' }
    })

    await search(wrapper, 'a')
    await flush()
    await search(wrapper, 'ab')
    await flush()

    // the first request answers last
    resolvers[1]()
    await flush()
    resolvers[0]()
    await flush()

    expect(items(wrapper).map(i => i.text())).toEqual(['ab'])
  })
})
