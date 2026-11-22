import { describe, it, expect, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import Vue3CoolSelect, {
  CoolSelect,
  CoolSelectPlugin,
  EventEmitter,
  Vue3CoolSelect as NamedExport
} from '../../src/index'
import { MENU_POSITIONS } from '../../src/constants'

const itemsDefault = ['JS', 'PHP', 'CSS', 'HTML']
const itemsCollection = [
  { val: 1, text: 'Text 1' },
  { val: 22, text: 'Text 2' },
  { val: '333', text: 'Text 3' }
]
const collectionProps = { itemValue: 'val', itemText: 'text' }

// the menu at the bottom is the default visible one
const bottomMenu = wrapper => wrapper.find('.IZ-select__menu--at-bottom')
const bottomItems = wrapper => bottomMenu(wrapper).findAll('.IZ-select__item')
const input = wrapper => wrapper.find('.IZ-select__input input')
const lastEmitted = (wrapper, event) => {
  const calls = wrapper.emitted(event)

  return calls[calls.length - 1][0]
}

async function search (wrapper, text) {
  input(wrapper).element.value = text
  await input(wrapper).trigger('input')
}

describe('exports and plugin', () => {
  it('exports the component under all names', () => {
    expect(Vue3CoolSelect.name).toBe('Vue3CoolSelect')
    expect(NamedExport).toBe(Vue3CoolSelect)
    expect(CoolSelect).toBe(Vue3CoolSelect)
    expect(typeof EventEmitter).toBe('function')
  })

  it('installs the plugin', () => {
    const app = createApp({ render: () => null })

    app.use(CoolSelectPlugin, { text: { noData: 'Nothing' } })

    expect(app.config.globalProperties.$coolSelect.options.text.noData).toBe('Nothing')
    expect(app.component('Vue3CoolSelect')).toBe(Vue3CoolSelect)
    expect(app.component('CoolSelect')).toBe(Vue3CoolSelect)
  })

  it('uses plugin options for the "no data" text', () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: [] },
      global: { plugins: [[CoolSelectPlugin, { text: { noData: 'Nothing' } }]] }
    })

    expect(wrapper.find('.IZ-select__no-data').text()).toBe('Nothing')
  })

  it('works without the plugin', () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: [] } })

    expect(wrapper.find('.IZ-select__no-data').text()).toBe('No data available')
  })
})

describe('rendering', () => {
  it('renders the component', () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    expect(wrapper.find('.IZ-select').exists()).toBe(true)
    expect(input(wrapper).exists()).toBe(true)
    expect(wrapper.findAll('.IZ-select__menu')).toHaveLength(2)
    expect(bottomItems(wrapper).map(i => i.text())).toEqual(itemsDefault)
  })

  it('accepts items as a JSON string', () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: JSON.stringify(itemsDefault) } })

    expect(bottomItems(wrapper)).toHaveLength(itemsDefault.length)
  })

  it('renders placeholder, size, error and successful states', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: {
        items: itemsDefault,
        placeholder: 'Select',
        size: 'lg',
        errorMessage: 'Required',
        successful: true,
        inputForTextClass: 'my-class',
        inputElCustomAttributes: { 'data-test': 'x' }
      }
    })

    expect(input(wrapper).attributes('placeholder')).toBe('Select')
    expect(input(wrapper).attributes('data-test')).toBe('x')
    expect(input(wrapper).classes()).toContain('my-class')
    expect(wrapper.classes()).toContain('IZ-select--lg')
    expect(wrapper.find('.IZ-select__input').classes()).toContain('IZ-select__input--has-error')
    expect(wrapper.find('.IZ-select__input').classes()).toContain('IZ-select__input--successful')
    expect(wrapper.find('.IZ-select__error').text()).toBe('Required')
  })

  it('renders slots', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsCollection, modelValue: 22, ...collectionProps },
      slots: {
        item: ({ item }) => h('b', { class: 'custom-item' }, item.text + '!'),
        selection: ({ item }) => h('i', { class: 'custom-selection' }, item.text),
        'input-before': () => h('span', { class: 'before' }),
        'input-after': () => h('span', { class: 'after' }),
        'input-start': () => h('span', { class: 'start' }),
        'input-end': () => h('span', { class: 'end' }),
        'before-items-fixed': () => h('span', { class: 'before-fixed' }),
        'after-items-fixed': () => h('span', { class: 'after-fixed' })
      }
    })

    expect(bottomMenu(wrapper).findAll('.custom-item').map(i => i.text()))
      .toEqual(['Text 1!', 'Text 2!', 'Text 3!'])
    expect(wrapper.find('.custom-selection').text()).toBe('Text 2')
    // the text is displayed by the slot, not by the input
    expect(input(wrapper).element.value).toBe('')

    for (const cls of ['before', 'after', 'start', 'end', 'before-fixed', 'after-fixed']) {
      expect(wrapper.find('.' + cls).exists()).toBe(true)
    }
  })

  it('renders "no-data" and "error" slots', () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: [], errorMessage: 'Bad' },
      slots: {
        'no-data': () => 'Empty!',
        error: ({ errorMessage }) => h('u', errorMessage + '?')
      }
    })

    expect(wrapper.find('.IZ-select__no-data').text()).toBe('Empty!')
    expect(wrapper.find('.IZ-select__error u').text()).toBe('Bad?')
  })
})

describe('v-model', () => {
  it('shows the initial value without emitting', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, modelValue: 'PHP' }
    })

    await nextTick()

    expect(input(wrapper).element.value).toBe('PHP')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(bottomItems(wrapper)[1].classes()).toContain('IZ-select__item--selected')
  })

  it('emits nothing on mount when there is no value', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('selects an item by click', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await wrapper.trigger('mousedown')
    expect(wrapper.vm.hasMenu).toBe(true)

    await bottomItems(wrapper)[2].trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['CSS']])
    expect(wrapper.emitted('select')).toEqual([['CSS']])
    expect(input(wrapper).element.value).toBe('CSS')
    expect(wrapper.vm.hasMenu).toBe(false)
  })

  it('works with itemValue and itemText', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsCollection, modelValue: '333', ...collectionProps }
    })

    expect(input(wrapper).element.value).toBe('Text 3')
    expect(bottomItems(wrapper).map(i => i.text())).toEqual(['Text 1', 'Text 2', 'Text 3'])

    await bottomItems(wrapper)[0].trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([[1]])
    expect(wrapper.emitted('select')).toEqual([[itemsCollection[0]]])
  })

  it('returns the whole object without itemValue', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsCollection, itemText: 'text' }
    })

    await bottomItems(wrapper)[1].trigger('click')
    await nextTick()

    expect(lastEmitted(wrapper, 'update:modelValue')).toBe(itemsCollection[1])
  })

  it('accepts an object as value', () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsCollection, modelValue: { val: 22, text: 'Text 2' }, ...collectionProps }
    })

    expect(wrapper.vm.selectedItem).toBe(itemsCollection[1])
  })

  it('reacts to value changes from the parent', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, modelValue: 'JS' }
    })

    await wrapper.setProps({ modelValue: 'HTML' })

    expect(input(wrapper).element.value).toBe('HTML')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.setProps({ modelValue: null })

    expect(input(wrapper).element.value).toBe('')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('selects the item when items are loaded after the value', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: [], modelValue: 22, ...collectionProps }
    })

    expect(wrapper.vm.selectedItem).toBe(null)

    await wrapper.setProps({ items: itemsCollection })

    expect(input(wrapper).element.value).toBe('Text 2')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('works in a parent with v-model', async () => {
    const wrapper = mount({
      components: { Vue3CoolSelect },
      data: () => ({ selected: null, items: itemsDefault }),
      template: '<Vue3CoolSelect v-model="selected" :items="items" />'
    })

    await wrapper.findAll('.IZ-select__menu--at-bottom .IZ-select__item')[3].trigger('click')
    await nextTick()

    expect(wrapper.vm.selected).toBe('HTML')
  })

  it('works in a parent with v-model, objects as values and non-reactive items', async () => {
    const wrapper = mount({
      components: { Vue3CoolSelect },
      data: () => ({ selected: null }),
      created () {
        this.items = itemsCollection
      },
      template: '<Vue3CoolSelect v-model="selected" :items="items" item-text="text" />'
    })

    await wrapper.findAll('.IZ-select__menu--at-bottom .IZ-select__item')[1].trigger('click')
    await nextTick()
    await nextTick()

    expect(wrapper.vm.selected).toEqual(itemsCollection[1])
    expect(wrapper.find('input').element.value).toBe('Text 2')
  })
})

describe('search', () => {
  it('filters items and emits events', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, modelValue: 'JS' } })

    await search(wrapper, 'p')

    expect(bottomItems(wrapper).map(i => i.text())).toEqual(['PHP'])
    expect(wrapper.emitted('search')).toEqual([['p']])
    expect(wrapper.emitted('update:searchText')).toEqual([['p']])
    expect(lastEmitted(wrapper, 'change-displayed-items')).toEqual(['PHP'])
    // typing resets the selected item
    expect(lastEmitted(wrapper, 'update:modelValue')).toBe(null)
  })

  it('shows "no data" when nothing is found', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await search(wrapper, 'zzz')

    expect(bottomItems(wrapper)).toHaveLength(0)
    expect(bottomMenu(wrapper).find('.IZ-select__no-data').exists()).toBe(true)
  })

  it('does not filter with disableFilteringBySearch', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, disableFilteringBySearch: true }
    })

    await search(wrapper, 'p')

    expect(bottomItems(wrapper)).toHaveLength(itemsDefault.length)
    expect(wrapper.emitted('search')).toEqual([['p']])
  })

  it('uses a custom filter', async () => {
    const filter = vi.fn((item, queryText, itemText) => itemText.startsWith(queryText))
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, filter } })

    await search(wrapper, 'H')

    expect(filter).toHaveBeenCalledWith('HTML', 'H', 'HTML')
    expect(bottomItems(wrapper).map(i => i.text())).toEqual(['HTML'])
  })

  it('syncs with the searchText prop', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, searchText: 'c' } })

    expect(bottomItems(wrapper).map(i => i.text())).toEqual(['CSS'])

    await wrapper.setProps({ searchText: 'j' })

    expect(input(wrapper).element.value).toBe('j')
    expect(bottomItems(wrapper).map(i => i.text())).toEqual(['JS'])
  })

  it('sets search through the event emitter and unsubscribes on unmount', async () => {
    const eventEmitter = new EventEmitter()
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, eventEmitter } })

    eventEmitter.emit('set-search', 'ht')
    await nextTick()

    expect(bottomItems(wrapper).map(i => i.text())).toEqual(['HTML'])

    expect(wrapper.emitted('update:searchText')).toEqual([['ht']])

    const vm = wrapper.vm

    wrapper.unmount()
    eventEmitter.emit('set-search', 'x')

    expect(vm.searchData).toBe('ht')
  })

  it('resets search on blur', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await wrapper.trigger('mousedown')
    await search(wrapper, 'p')
    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.vm.searchData).toBe('')
    expect(wrapper.emitted('blur')).toHaveLength(1)

    await wrapper.setProps({ resetSearchOnBlur: false })
    await wrapper.trigger('mousedown')
    await search(wrapper, 'p')
    await wrapper.trigger('keydown', { key: 'Escape' })

    expect(wrapper.vm.searchData).toBe('p')
  })

  it('removes the selection by backspace on an empty input', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, modelValue: 'JS' },
      slots: { selection: ({ item }) => h('i', item) }
    })

    await input(wrapper).trigger('keydown', { key: 'Backspace' })

    expect(lastEmitted(wrapper, 'update:modelValue')).toBe(null)
    expect(wrapper.emitted('keydown')).toHaveLength(1)
  })
})

describe('focus, blur and menu', () => {
  it('opens on click and closes on click outside', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault },
      attachTo: document.body
    })

    expect(wrapper.vm.hasMenu).toBe(false)

    await wrapper.trigger('mousedown')

    expect(wrapper.vm.focused).toBe(true)
    expect(wrapper.vm.hasMenu).toBe(true)
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(document.activeElement).toBe(input(wrapper).element)
    expect(bottomMenu(wrapper).element.style.visibility).toBe('visible')

    // a click inside does not blur
    input(wrapper).element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(wrapper.vm.focused).toBe(true)

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()

    expect(wrapper.vm.focused).toBe(false)
    expect(wrapper.vm.hasMenu).toBe(false)
    expect(wrapper.emitted('blur')).toHaveLength(1)
    expect(bottomMenu(wrapper).element.style.visibility).toBe('hidden')

    wrapper.unmount()
  })

  it('focuses when the input gets focus (tab)', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await input(wrapper).trigger('focus')

    expect(wrapper.vm.focused).toBe(true)
    expect(wrapper.vm.hasMenu).toBe(true)

    await wrapper.trigger('keydown', { key: 'Tab' })

    expect(wrapper.vm.focused).toBe(false)
  })

  it('does not open when disabled or readonly', async () => {
    for (const prop of ['disabled', 'readonly']) {
      const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, [prop]: true } })

      await wrapper.trigger('mousedown')
      await wrapper.trigger('keydown', { key: 'ArrowDown' })
      await search(wrapper, 'p')

      expect(wrapper.vm.focused).toBe(false)
      expect(wrapper.vm.hasMenu).toBe(false)
      expect(wrapper.emitted('search')).toBeUndefined()
      expect(wrapper.find('.IZ-select__input').classes()).toContain('IZ-select__input--' + prop)
    }
  })

  it('does not show the menu while loading', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, loading: true } })

    await wrapper.trigger('mousedown')
    expect(wrapper.vm.hasMenu).toBe(false)

    await wrapper.setProps({ loading: false })
    expect(wrapper.vm.hasMenu).toBe(true)
  })

  it('disables the input with disableSearch', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, disableSearch: true } })

    expect(input(wrapper).element.disabled).toBe(true)
    expect(wrapper.attributes('tabindex')).toBe('0')

    await wrapper.trigger('focus')

    expect(wrapper.vm.hasMenu).toBe(true)
    expect(bottomMenu(wrapper).classes()).toContain('IZ-select__menu--disable-search')
  })

  it('selects the text on focus with selectTextOnFocus', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, modelValue: 'HTML', selectTextOnFocus: true },
      attachTo: document.body
    })

    await wrapper.trigger('mousedown')
    vi.runAllTimers()

    const el = input(wrapper).element

    expect(el.selectionStart).toBe(0)
    expect(el.selectionEnd).toBe(4)

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('uses the default menu position', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, menuDefaultPosition: MENU_POSITIONS.TOP }
    })

    await wrapper.trigger('mousedown')

    expect(wrapper.find('.IZ-select__menu--at-top').element.style.visibility).toBe('visible')
    expect(bottomMenu(wrapper).element.style.visibility).toBe('hidden')
  })

  it('moves the menu to the top when there is no space below', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    bottomMenu(wrapper).element.getBoundingClientRect = () => ({ top: 500, bottom: window.innerHeight + 100 })

    await wrapper.trigger('mousedown')
    await nextTick()
    await nextTick()

    expect(wrapper.vm.menuCurrentPosition).toBe(MENU_POSITIONS.TOP)
  })

  it('removes window listeners on unmount', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    expect(add.mock.calls.map(c => c[0]).sort()).toEqual(['mousedown', 'resize', 'scroll'])

    wrapper.unmount()

    expect(remove.mock.calls.map(c => c[0]).sort()).toEqual(['mousedown', 'resize', 'scroll'])

    add.mockRestore()
    remove.mockRestore()
  })
})

describe('keyboard', () => {
  it('highlights by arrows and selects by enter', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await wrapper.trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.vm.hasMenu).toBe(true)
    expect(bottomItems(wrapper)[0].classes()).toContain('IZ-select__item--selected')
    // only highlighted, not selected yet
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['PHP']])
    expect(wrapper.emitted('select')).toEqual([['PHP']])
    expect(wrapper.vm.hasMenu).toBe(false)
  })

  it('jumps to the opposite side', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await wrapper.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.vm.selectedItemByArrows).toBe('HTML')

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.vm.selectedItemByArrows).toBe('JS')
  })

  it('starts from the selected item', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, modelValue: 'PHP' } })

    await wrapper.trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.vm.selectedItemByArrows).toBe('CSS')
  })

  it('selects instantly without arrowsDisableInstantSelection', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, arrowsDisableInstantSelection: false }
    })

    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['JS'], ['PHP']])
    expect(wrapper.emitted('select')).toEqual([['JS'], ['PHP']])
  })

  it('selects the first found item by enter', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await wrapper.trigger('mousedown')
    await search(wrapper, 'c')
    await wrapper.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toEqual([['CSS']])
    expect(wrapper.vm.searchData).toBe('')
  })

  it('does not select the first item by enter with disableFirstItemSelectOnEnter', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: itemsDefault, disableFirstItemSelectOnEnter: true }
    })

    await wrapper.trigger('mousedown')
    await wrapper.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.vm.hasMenu).toBe(false)
  })

  it('keeps the current selection when enter only toggles the menu', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault, modelValue: 'CSS' } })

    await wrapper.trigger('mousedown')
    await wrapper.trigger('keydown', { key: 'Enter' })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.vm.hasMenu).toBe(false)

    await wrapper.trigger('keydown', { key: 'Enter' })
    expect(wrapper.vm.hasMenu).toBe(true)
  })

  it('emits keydown and keyup, except for special keys on keydown', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: itemsDefault } })

    await input(wrapper).trigger('keydown', { key: 'a' })
    await input(wrapper).trigger('keydown', { key: 'Enter' })
    await input(wrapper).trigger('keyup', { key: 'a' })

    expect(wrapper.emitted('keydown')).toHaveLength(1)
    expect(wrapper.emitted('keyup')).toHaveLength(1)
  })
})

describe('scroll', () => {
  const manyItems = Array.from({ length: 100 }, (_, i) => 'Item ' + i)
  const visibleCount = wrapper => bottomItems(wrapper).filter(i => i.element.style.display !== 'none').length

  it('limits displayed items and shows more on scroll', async () => {
    const wrapper = mount(Vue3CoolSelect, {
      props: { items: manyItems, scrollItemsLimit: 10, scrollItemsLimitAddAfterScroll: 5 }
    })

    expect(bottomItems(wrapper)).toHaveLength(100)
    expect(visibleCount(wrapper)).toBe(10)

    await bottomMenu(wrapper).find('.IZ-select__menu-items').trigger('scroll')

    expect(wrapper.emitted('scroll')).toHaveLength(1)
    expect(visibleCount(wrapper)).toBe(15)
  })

  it('shows items up to the one reached by arrows', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { items: manyItems, scrollItemsLimit: 10 } })

    // "up" from the start jumps to the last item
    await wrapper.trigger('keydown', { key: 'ArrowUp' })

    expect(visibleCount(wrapper)).toBe(100)
  })
})

describe('simpleInput', () => {
  it('works as a plain input without a menu', async () => {
    const wrapper = mount(Vue3CoolSelect, { props: { simpleInput: true, modelValue: 'abc' } })

    expect(wrapper.find('.IZ-select__menu').exists()).toBe(false)
    expect(input(wrapper).element.value).toBe('abc')

    input(wrapper).element.value = 'abcd'
    await input(wrapper).trigger('input')

    expect(wrapper.emitted('update:modelValue')).toEqual([['abcd']])

    await wrapper.trigger('mousedown')
    expect(wrapper.vm.hasMenu).toBe(false)
  })
})
