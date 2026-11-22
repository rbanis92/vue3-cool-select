<template>
  <div
    ref="selectRef"
    :tabindex="disableSearch ? 0 : -1"
    :class="{
      'IZ-select': true,
      'IZ-select--with-value': hasValue || inputValue,
      'IZ-select--multiple': multiple,
      'IZ-select--open': hasMenu,
      ...(size === SIZES.DEFAULT
        ? null
        : ({ ['IZ-select--' + size]: true })
      )
    }"
    @keydown.up="onSelectByArrow"
    @keydown.down="onSelectByArrow"
    @keydown.home="onHomeEnd"
    @keydown.end="onHomeEnd"
    @keydown.enter="onEnter"
    @keydown.tab.esc="setBlured"
    @mousedown="onClick"
    @focus="setFocused()"
  >
    <div class="IZ-select__input-wrap">
      <slot name="input-before" />

      <div
        ref="inputRef"
        :class="{
          'IZ-select__input': true,
          'IZ-select__input--focused': focused,
          'IZ-select__input--has-menu': hasMenu,
          'IZ-select__input--has-error': hasError,
          'IZ-select__input--successful': successful,
          'IZ-select__input--selection-slot': showSelectionSlot,
          'IZ-select__input--disabled': disabled,
          'IZ-select__input--readonly': readonly
        }"
        :style="inputStyles"
      >
        <slot name="input-start" />

        <slot
          v-if="showSelectionSlot"
          :item="selectedItem"
          name="selection"
        />

        <template v-if="multiple && !simpleInput">
          <span
            v-for="(item, i) in selectedItems"
            :key="'IZ-chip-' + i"
            class="IZ-select__chip"
          >
            <slot
              :item="item"
              :remove="() => removeItem(item)"
              name="chip"
            >
              <span class="IZ-select__chip-text">{{ getItemText(item) }}</span>
              <button
                v-if="!disabled && !readonly"
                type="button"
                tabindex="-1"
                class="IZ-select__chip-remove"
                :aria-label="texts.remove + ' ' + getItemText(item)"
                @mousedown.prevent.stop
                @click.stop="removeItem(item)"
              >
                &times;
              </button>
            </slot>
          </span>
        </template>

        <input
          v-if="simpleInput"
          ref="inputForTextRef"
          v-bind="{
            value: modelValue,
            placeholder,
            class: inputForTextClass,
            disabled,
            readonly,
            id,
            name,
            required,
            tabindex: 0,
            type: 'text',
            autocomplete: 'new-password',
            ...inputElCustomAttributes,
            style: inputForTextStyles
          }"
          @keyup="onSearchKeyUp"
          @keydown="onSearchKeyDown"
          @input="onSimpleInput"
          @mousedown="onClick"
          @focus="setFocused(true)"
        >
        <input
          v-else
          ref="inputForTextRef"
          v-bind="{
            value: inputValue,
            placeholder: multiple && hasValue ? null : placeholder,
            class: inputForTextClass,
            disabled: disableSearch || disabled,
            readonly,
            id,
            required: required && !hasValue,
            tabindex: disableSearch ? -1 : 0,
            type: 'text',
            role: 'combobox',
            autocomplete: 'new-password',
            'aria-autocomplete': 'list',
            'aria-expanded': hasMenu ? 'true' : 'false',
            'aria-controls': menuRendered ? menuId : null,
            'aria-activedescendant': hasMenu && arrowsIndex !== null ? menuId + '-item-' + arrowsIndex : null,
            ...inputElCustomAttributes,
            style: inputForTextStyles
          }"
          @keyup="onSearchKeyUp"
          @keydown="onSearchKeyDown"
          @input="onSearch"
          @mousedown="onClick"
          @focus="setFocused(true)"
        >

        <span
          v-if="remoteLoading"
          class="IZ-select__spinner"
          aria-hidden="true"
        />

        <button
          v-if="showClear"
          type="button"
          tabindex="-1"
          class="IZ-select__clear"
          :aria-label="texts.clear"
          @mousedown.prevent.stop
          @click.stop="clearSelection"
        >
          <slot name="clear-icon">
            &times;
          </slot>
        </button>

        <slot name="input-end" />
      </div>

      <slot name="input-after" />
    </div>

    <template v-if="name && !simpleInput">
      <input
        v-for="(value, i) in formValues"
        :key="'IZ-form-value-' + i"
        type="hidden"
        :name="multiple && name.slice(-2) !== '[]' ? name + '[]' : name"
        :value="value"
        :disabled="disabled"
      >
    </template>

    <!-- rendered when the menu is opened for the first time -->
    <Teleport
      v-if="!simpleInput && menuRendered"
      :to="menuTo || 'body'"
      :disabled="!menuTo"
    >
      <div
        :id="menuId"
        ref="menuRef"
        :style="{
          'pointer-events': hasMenu ? 'auto' : 'none',
          visibility: hasMenu ? 'visible' : 'hidden',
          opacity: +hasMenu,
          ...menuPositionStyles
        }"
        :class="{
          [`IZ-select__menu IZ-select__menu--at-${menuCurrentPosition}`]: true,
          'IZ-select__menu--disable-search': disableSearch,
          'IZ-select__menu--detached': !!menuTo,
          'IZ-select__menu--multiple': multiple,
          ...(size === SIZES.DEFAULT
            ? null
            : ({ ['IZ-select__menu--' + size]: true })
          )
        }"
        @mousedown="onMenuMouseDown"
      >
        <slot name="before-items-fixed" />

        <div
          ref="menuItemsRef"
          :style="{ 'max-height': menuItemsMaxHeight }"
          class="IZ-select__menu-items"
          role="listbox"
          :aria-multiselectable="multiple ? 'true' : null"
          @scroll="onScroll"
        >
          <slot name="before-items">
            <div class="IZ-select__menu-space" />
          </slot>

          <div
            v-if="canCreate"
            class="IZ-select__item IZ-select__create"
            @click="createFromSearch"
          >
            <slot
              :search="searchData"
              name="create"
            >
              <span>{{ texts.create }} "{{ searchData.trim() }}"</span>
            </slot>
          </div>

          <template
            v-for="row in visibleRows"
            :key="(row.type === 'group' ? 'IZ-group-' : 'IZ-item-') + row.index"
          >
            <div
              v-if="row.type === 'group'"
              class="IZ-select__group"
              role="presentation"
            >
              <slot
                :group="row.raw"
                name="group"
              >
                {{ row.text }}
              </slot>
            </div>
            <div
              v-else
              :id="menuId + '-item-' + row.index"
              :data-index="row.index"
              role="option"
              :aria-selected="isReallySelected(row.raw) ? 'true' : 'false'"
              :aria-disabled="row.disabled ? 'true' : null"
              :class="{
                'IZ-select__item': true,
                'IZ-select__item--selected': isReallySelected(row.raw),
                'IZ-select__item--highlighted': row.raw === selectedItemByArrows,
                'IZ-select__item--disabled': row.disabled,
                'IZ-select__item--child': !!row.group
              }"
              @click="onClickSelectItem(row.raw)"
            >
              <slot
                :item="row.raw"
                name="item"
              >
                <span>
                  {{ row.text }}
                </span>
              </slot>
            </div>
          </template>

          <div
            v-if="remoteLoading && !itemsComputed.length"
            class="IZ-select__loading"
          >
            <slot name="loading">
              {{ texts.loading }}
            </slot>
          </div>
          <div
            v-else-if="!itemsComputed.length && !loading && !canCreate"
            class="IZ-select__no-data"
          >
            <slot name="no-data">
              {{ remoteTooShort ? texts.typeToSearch : texts.noData }}
            </slot>
          </div>

          <div
            v-if="remoteLoadingMore"
            class="IZ-select__loading IZ-select__loading--more"
          >
            <slot name="loading-more">
              {{ texts.loadingMore }}
            </slot>
          </div>

          <slot name="after-items">
            <div class="IZ-select__menu-space" />
          </slot>
        </div>

        <slot name="after-items-fixed" />

        <div style="position: absolute; top: 0; left: 0; right: 0;">
          <slot name="before-items-fixed-absolute" />
        </div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0;">
          <slot name="after-items-fixed-absolute" />
        </div>
      </div>
    </Teleport>

    <transition name="IZ-select-fade">
      <div
        v-show="errorMessage"
        class="IZ-select__error"
      >
        <slot
          :error-message="errorMessage"
          name="error"
        >
          {{ errorMessage }}
        </slot>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch
} from 'vue'
import { getOffsetSum, scrollIfNeeded } from './helpers'
import props from './props'
import { SIZES, MENU_POSITIONS, DEFAULT_OPTIONS } from './constants'
import { createItemAccessors, useItems } from './composables/useItems'
import { useSelection } from './composables/useSelection'
import { useRemoteSearch } from './composables/useRemoteSearch'
import { useMenuPosition } from './composables/useMenuPosition'

let uid = 0

export default defineComponent({
  name: 'Vue3CoolSelect',
  props,
  emits: [
    'update:modelValue',
    'update:searchText',
    'change-displayed-items',
    'focus',
    'blur',
    'select',
    'remove',
    'clear',
    'create',
    'search',
    'search-error',
    'load-more',
    'open',
    'close',
    'keydown',
    'keyup',
    'scroll'
  ],
  setup (props, { emit, slots }) {
    const instance = getCurrentInstance()
    // set by CoolSelectPlugin, the component also works without the plugin
    const coolSelect = instance?.appContext.config.globalProperties.$coolSelect || { options: DEFAULT_OPTIONS }
    const texts = computed(() => ({ ...DEFAULT_OPTIONS.text, ...(coolSelect.options && coolSelect.options.text) }))
    const menuId = 'IZ-select-menu-' + (++uid)

    const selectRef = ref(null)
    const inputRef = ref(null)
    const inputForTextRef = ref(null)
    const menuRef = ref(null)
    const menuItemsRef = ref(null)

    const wishShowMenu = ref(false)
    const menuRendered = ref(false)
    // index of the item highlighted by arrows (among the displayed selectable items)
    const arrowsIndex = ref(null)
    const focused = ref(false)
    // shallow: items must keep their identity (they are compared with ===)
    const selectedItemByArrows = shallowRef(null)
    const searchData = ref(props.searchText || '')
    const scrollItemsLimitCurrent = ref(props.scrollItemsLimit)

    function getSearchData () {
      return searchData.value
    }

    const accessors = createItemAccessors(props)
    const { getItemText, getItemValue, isItemDisabled } = accessors
    const remote = useRemoteSearch(props, emit)
    const { rows, itemRows, allItems, itemsComputed } = useItems(props, accessors, getSearchData, remote)
    const selection = useSelection(props, emit, accessors, allItems)
    const { selectedItems } = selection

    const hasMenu = computed(() => !props.simpleInput && wishShowMenu.value && !props.loading)
    const { menuCurrentPosition, menuPositionStyles, menuCalculatePos } = useMenuPosition(props, {
      selectRef,
      inputRef,
      menuRef,
      isOpen: hasMenu
    })

    // single selection: the selected item
    const selectedItem = computed(() => selectedItems.value.length ? selectedItems.value[0] : null)
    const hasValue = computed(() => selectedItems.value.length > 0)
    const currentItemValue = computed(() => getItemValue(selectedItem.value))
    const showSelectionSlot = computed(() => (
      !props.multiple && !!slots.selection && selectedItem.value != null && !getSearchData()
    ))
    const inputValue = computed(() => {
      if (props.multiple) return getSearchData()
      // with the "selection" slot the text in the input would only get in the way
      if (slots.selection && getSearchData() === '') return ''
      if (getSearchData() !== '') return getSearchData()

      return getItemText(selectedItem.value) || currentItemValue.value
    })
    const inputForTextStyles = computed(() => {
      if (props.inputElCustomAttributes && props.inputElCustomAttributes.style) {
        return { ...props.inputElCustomAttributes.style }
      }

      return {}
    })
    const hasError = computed(() => !!props.errorMessage)
    const isMobile = computed(() => {
      if (typeof window === 'undefined') return false

      return window.innerWidth <= 900 && window.innerHeight <= 900
    })
    const selectedItemIndex = computed(() => {
      if (props.multiple || selectedItem.value == null) return null

      const index = itemsComputed.value.findIndex(item => selection.isSelected(item))

      return index === -1 ? null : index
    })
    const shouldCloseOnSelect = computed(() => (
      props.closeOnSelect === undefined ? !props.multiple : props.closeOnSelect
    ))
    const showClear = computed(() => (
      props.clearable && hasValue.value && !props.disabled && !props.readonly && !props.simpleInput
    ))
    // values for the hidden inputs ("name" prop)
    const formValues = computed(() => {
      const values = selectedItems.value.map(item => {
        const value = getItemValue(item)

        return value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value)
      })

      return values.length || props.multiple ? values : ['']
    })
    // only a part of the items is rendered, more are added on scroll
    const visibleRows = computed(() => rows.value.filter(row => (
      row.index < scrollItemsLimitCurrent.value || (arrowsIndex.value && row.index <= arrowsIndex.value)
    )))
    // taggable: the item with exactly the typed text, if there is one
    const exactMatchRow = computed(() => {
      const search = getSearchData().trim().toLowerCase()

      if (!search) return null

      return itemRows.value.find(row => !row.disabled && String(row.text).toLowerCase() === search) || null
    })
    const canCreate = computed(() => {
      const search = getSearchData().trim()

      return props.taggable && search !== '' && !exactMatchRow.value &&
        !selectedItems.value.some(item => String(getItemText(item)).toLowerCase() === search.toLowerCase())
    })
    const remoteLoading = computed(() => remote.enabled.value && remote.loading.value)
    const remoteLoadingMore = computed(() => remote.enabled.value && remote.loadingMore.value)
    const remoteTooShort = computed(() => remote.enabled.value && remote.tooShort.value)

    function setSearchData (val) {
      searchData.value = val
      emit('update:searchText', val)
    }

    // after an item is chosen: empty search, and the first page again if the items are remote
    function resetSearch () {
      const hadSearch = getSearchData() !== ''

      setSearchData('')

      if (hadSearch && remote.enabled.value && hasMenu.value) remote.ensureLoaded('')
    }

    function setInputFocused () {
      inputForTextRef.value?.focus()
    }

    function setInputSelected () {
      setTimeout(() => {
        inputForTextRef.value?.select()
      }, 100)
    }

    function showMenu () {
      if (hasMenu.value) return

      menuRendered.value = true
      wishShowMenu.value = true

      if (remote.enabled.value) remote.ensureLoaded(getSearchData())
    }

    function hideMenu () {
      if (!hasMenu.value) return

      wishShowMenu.value = false
    }

    function setFocused (byInput = false) {
      if (focused.value || props.disabled || props.readonly) return

      // set first: focusing the input below fires its focus event, which calls this function again
      focused.value = true

      if (!props.disableSearch && !byInput) setInputFocused()

      if (typeof window !== 'undefined' && window.scrollTo && props.allowMobileScroll && isMobile.value) {
        const { top } = getOffsetSum(inputRef.value)

        window.scrollTo({
          top: top - 8,
          behavior: 'smooth'
        })
      }

      if (props.selectTextOnFocus) setInputSelected()

      showMenu()
      emit('focus')
    }

    function setBlured () {
      if (props.resetSearchOnBlur) setSearchData('')

      focused.value = false
      selectedItemByArrows.value = null
      arrowsIndex.value = null
      hideMenu()
      inputForTextRef.value?.blur()
      emit('blur')
    }

    function fireSelectEvent (item) {
      nextTick(() => {
        emit('select', item)
      })
    }

    // "selected" in the meaning of v-model (not highlighted by arrows)
    function isReallySelected (item) {
      return selection.isSelected(item)
    }

    // kept for compatibility with 1.x: selected or highlighted by arrows
    function isItemSelected (item) {
      return item === selectedItemByArrows.value || (isReallySelected(item) && !selectedItemByArrows.value)
    }

    function addItem (item) {
      if (props.multiple && selection.isSelected(item)) return

      selection.select(item)
      fireSelectEvent(item)
    }

    function removeItem (item) {
      if (props.disabled || props.readonly) return

      selection.remove(item)
    }

    // the user chose an item: single selection replaces, multiple selection toggles
    function pickItem (item) {
      if (props.multiple && selection.isSelected(item)) {
        selection.remove(item)
      } else {
        addItem(item)
      }

      if (!props.multiple) {
        selectedItemByArrows.value = null
      }

      resetSearch()
    }

    function clearSelection () {
      if (props.disabled || props.readonly) return

      selection.clear()
      selectedItemByArrows.value = null
      arrowsIndex.value = null
      resetSearch()
      emit('clear')
      setInputFocused()
    }

    function createFromSearch () {
      const text = getSearchData().trim()

      if (!text) return

      emit('create', text)
      addItem(text)
      selectedItemByArrows.value = null
      arrowsIndex.value = null
      resetSearch()
      setInputFocused()

      if (shouldCloseOnSelect.value) hideMenu()
    }

    function scrollToHighlighted () {
      if (!props.scrollToItemIfNeeded) return

      nextTick(() => {
        const container = menuItemsRef.value
        if (!container) return

        const selectedElement = container.querySelector('[data-index="' + arrowsIndex.value + '"]')

        if (!selectedElement) return

        scrollIfNeeded(selectedElement, container)
      })
    }

    function setHighlighted (index) {
      const row = itemRows.value[index]

      if (!row || row.disabled) return

      arrowsIndex.value = index

      if (props.arrowsDisableInstantSelection || props.multiple) {
        // only highlights the item
        selectedItemByArrows.value = row.raw
      } else {
        // selects the item right away
        setSearchData('')
        selection.select(row.raw)
        selectedItemByArrows.value = null
        fireSelectEvent(row.raw)
      }

      scrollToHighlighted()
    }

    function onSelectByArrow (e) {
      e.preventDefault()

      if (props.disabled || props.readonly) return

      showMenu()

      const count = itemRows.value.length
      if (!count) return

      const step = e.key === 'ArrowUp' ? -1 : 1
      // -1 (not 0), so the first press of "down" selects the first item, not the second
      let index = arrowsIndex.value === null ? (selectedItemIndex.value ?? -1) : arrowsIndex.value

      // jumps to the opposite side at the ends and skips disabled items
      for (let i = 0; i < count; i++) {
        index += step
        if (index < 0) index = count - 1
        if (index > count - 1) index = 0
        if (!itemRows.value[index].disabled) break
      }

      setHighlighted(index)
    }

    // the keys move the caret while the user can type, so they are only used without search
    function onHomeEnd (e) {
      if (!props.disableSearch || !hasMenu.value || props.disabled || props.readonly) return

      e.preventDefault()

      const enabled = itemRows.value.filter(row => !row.disabled)
      if (!enabled.length) return

      setHighlighted((e.key === 'Home' ? enabled[0] : enabled[enabled.length - 1]).index)
    }

    function onEnter (e) {
      if (!hasMenu.value) {
        showMenu()
        return
      }

      e.preventDefault()

      let picked = false

      if (selectedItemByArrows.value != null) {
        // the item highlighted by arrows becomes selected
        pickItem(selectedItemByArrows.value)
        picked = true
      } else if (props.taggable && exactMatchRow.value) {
        pickItem(exactMatchRow.value.raw)
        picked = true
      } else if (canCreate.value) {
        createFromSearch()
        return
      } else if (
        !arrowsIndex.value &&
        !props.disableFirstItemSelectOnEnter &&
        (getSearchData() !== '' || (!props.multiple && selectedItem.value == null))
      ) {
        // nothing is highlighted: select the first item
        const firstRow = itemRows.value.find(row => !row.disabled)

        if (!firstRow) return

        pickItem(firstRow.raw)
        picked = true
      }

      if (!picked || shouldCloseOnSelect.value) hideMenu()
    }

    function onClick () {
      if (props.disabled || props.readonly) return

      setFocused()
      showMenu()
    }

    // a menu rendered elsewhere ("menu-to") is not inside the select, so its events do not reach it
    function onMenuMouseDown (e) {
      if (!props.menuTo) return

      const interactive = e.target.closest && e.target.closest('input, textarea, select, button, a, [contenteditable]')

      // keeps the focus in the search input
      if (!interactive) e.preventDefault()

      onClick()
    }

    function onClickSelectItem (item) {
      if (isItemDisabled(item)) return

      pickItem(item)
      setInputFocused()

      if (shouldCloseOnSelect.value) hideMenu()
    }

    function onSearchKeyDown (e) {
      if (props.disabled || props.readonly) return
      if (['Enter', 'ArrowDown', 'ArrowUp', 'Tab'].includes(e.key)) return

      if (!e.target.value && e.key === 'Backspace' && hasValue.value) {
        if (props.multiple) {
          // removes the last chip
          selection.remove(selectedItems.value[selectedItems.value.length - 1])
        } else {
          // important for the "selection" slot: backspace on an empty input removes the selection
          selection.clear()
          arrowsIndex.value = null
        }
      }

      showMenu()
      emit('keydown', e)
    }

    function onSearchKeyUp (e) {
      if (props.disabled || props.readonly) return

      emit('keyup', e)
    }

    function onSearch (e) {
      if (props.disabled || props.readonly) return

      selectedItemByArrows.value = null
      arrowsIndex.value = null

      if (!props.multiple && props.clearOnSearch) selection.clear()

      setSearchData(e.target.value)
      // before the menu is shown: opening must not send its own request for the same text
      if (remote.enabled.value) remote.search(getSearchData())
      showMenu()
      emit('search', getSearchData())
    }

    function onSimpleInput (e) {
      emit('update:modelValue', e.target.value)
    }

    function onScroll (event) {
      emit('scroll', event)

      const content = event.target
      const nearEnd = (
        content.scrollHeight -
        (content.scrollTop + content.clientHeight)
      ) < 200

      if (!nearEnd) return

      if (scrollItemsLimitCurrent.value < itemsComputed.value.length) {
        // scrolled near the end: show more items
        scrollItemsLimitCurrent.value += props.scrollItemsLimitAddAfterScroll
      } else if (remote.enabled.value) {
        // everything loaded is displayed: ask the server for the next page
        remote.loadMore()
      }
    }

    const listeners = {
      mousedown: ({ target }) => {
        const select = selectRef.value
        const menu = menuRef.value

        if (!focused.value || !select) return
        if (select.contains(target) || (menu && menu.contains(target))) return

        setBlured()
      },
      // capture phase: also catches the scroll of any parent element
      scroll: ({ target }) => {
        const menu = menuRef.value

        if (menu && target && target.nodeType === 1 && menu.contains(target)) return

        menuCalculatePos()
      },
      resize: () => menuCalculatePos()
    }
    let resizeObserver = null

    function addMenuListeners () {
      window.addEventListener('scroll', listeners.scroll, true)
      window.addEventListener('resize', listeners.resize)
    }

    function removeMenuListeners () {
      window.removeEventListener('scroll', listeners.scroll, true)
      window.removeEventListener('resize', listeners.resize)
    }

    // initial sync with v-model, it never emits anything
    selection.syncFromModel()

    watch(() => props.searchText, val => {
      if (val !== searchData.value) setSearchData(val)
    })
    // an array of v-model can be changed in place, so its elements are tracked too
    watch(() => Array.isArray(props.modelValue) ? props.modelValue.slice() : props.modelValue, selection.syncFromModel)
    watch(allItems, selection.syncFromModel)
    watch(() => props.selectedItem, selection.syncFromModel)
    watch(() => props.multiple, selection.syncFromModel)
    watch(itemsComputed, items => {
      emit('change-displayed-items', items)
    })
    watch(hasMenu, val => {
      if (val) {
        addMenuListeners()
        // the menu is rendered now, so it can be measured
        nextTick(menuCalculatePos)
        emit('open')
      } else {
        removeMenuListeners()
        emit('close')
      }
    })
    // the height of the menu or of the input (chips) has changed
    watch([rows, selectedItems, canCreate, remoteLoading, remoteLoadingMore], () => {
      if (hasMenu.value) nextTick(menuCalculatePos)
    })
    watch(() => [props.searchUrl, JSON.stringify(props.searchParams || {})], () => {
      if (remote.enabled.value && hasMenu.value) remote.ensureLoaded(getSearchData())
    })

    if (props.eventEmitter) props.eventEmitter.on('set-search', setSearchData)

    onMounted(() => {
      window.addEventListener('mousedown', listeners.mousedown)

      if (typeof ResizeObserver !== 'undefined' && inputRef.value) {
        resizeObserver = new ResizeObserver(() => menuCalculatePos())
        resizeObserver.observe(inputRef.value)
      }
    })

    onBeforeUnmount(() => {
      window.removeEventListener('mousedown', listeners.mousedown)
      removeMenuListeners()
      remote.cancel()

      if (resizeObserver) resizeObserver.disconnect()

      if (props.eventEmitter && props.eventEmitter.off) {
        props.eventEmitter.off('set-search', setSearchData)
      }
    })

    return {
      MENU_POSITIONS,
      SIZES,
      coolSelect,
      texts,
      menuId,
      selectRef,
      inputRef,
      inputForTextRef,
      menuRef,
      menuItemsRef,
      wishShowMenu,
      menuRendered,
      arrowsIndex,
      focused,
      selectedItem,
      selectedItems,
      selectedItemByArrows,
      searchData,
      scrollItemsLimitCurrent,
      menuCurrentPosition,
      menuPositionStyles,
      itemsComputed,
      visibleRows,
      inputValue,
      currentItemValue,
      hasValue,
      formValues,
      showSelectionSlot,
      showClear,
      canCreate,
      inputForTextStyles,
      hasMenu,
      hasError,
      isMobile,
      selectedItemIndex,
      remoteLoading,
      remoteLoadingMore,
      remoteTooShort,
      menuCalculatePos,
      getSearchData,
      setSearchData,
      setInputFocused,
      setInputSelected,
      setFocused,
      setBlured,
      fireSelectEvent,
      getItemText,
      getItemValue,
      isItemSelected,
      isReallySelected,
      removeItem,
      clearSelection,
      createFromSearch,
      showMenu,
      hideMenu,
      onSelectByArrow,
      onHomeEnd,
      onEnter,
      onClick,
      onMenuMouseDown,
      onClickSelectItem,
      onSearchKeyDown,
      onSearchKeyUp,
      onSearch,
      onSimpleInput,
      onScroll
    }
  }
})
</script>
