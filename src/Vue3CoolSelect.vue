<template>
  <div
    ref="selectRef"
    :tabindex="disableSearch ? 0 : -1"
    :class="{
      'IZ-select': true,
      'IZ-select--with-value': inputValue,
      ...(size === SIZES.DEFAULT
        ? null
        : ({ ['IZ-select--' + size]: true })
      )
    }"
    @keydown.up="onSelectByArrow"
    @keydown.down="onSelectByArrow"
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

        <input
          v-if="simpleInput"
          ref="inputForTextRef"
          v-bind="{
            value: modelValue,
            placeholder,
            class: inputForTextClass,
            disabled,
            readonly,
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
            placeholder,
            class: inputForTextClass,
            disabled: disableSearch || disabled,
            readonly,
            tabindex: disableSearch ? -1 : 0,
            type: 'text',
            role: 'combobox',
            autocomplete: 'new-password',
            ...inputElCustomAttributes,
            style: inputForTextStyles
          }"
          @keyup="onSearchKeyUp"
          @keydown="onSearchKeyDown"
          @input="onSearch"
          @mousedown="onClick"
          @focus="setFocused(true)"
        >

        <slot name="input-end" />
      </div>

      <slot name="input-after" />
    </div>

    <!--
      Two menus are rendered (above and below the input) and only one is visible,
      so the free position can be measured against the viewport.
    -->
    <template v-if="!simpleInput">
      <div
        v-for="menuPos of [MENU_POSITIONS.TOP, MENU_POSITIONS.BOTTOM]"
        :key="'menu-position-' + menuPos"
        :ref="setMenuRef(menuPos)"
        :style="{
          'pointer-events': hasMenu ? 'auto' : 'none',
          ...getMenuDynamicStyles(menuPos)
        }"
        :class="{
          [`IZ-select__menu IZ-select__menu--at-${menuPos}`]: true,
          'IZ-select__menu--disable-search': disableSearch
        }"
      >
        <slot name="before-items-fixed" />

        <div
          :style="{ 'max-height': menuItemsMaxHeight }"
          class="IZ-select__menu-items"
          @scroll="onScroll"
        >
          <slot name="before-items">
            <div style="height: 8px;" />
          </slot>

          <div
            v-for="(item, i) in itemsComputed"
            v-show="i < scrollItemsLimitCurrent || (arrowsIndex && i <= arrowsIndex)"
            :key="'IZ-item-' + i"
            :class="{
              'IZ-select__item': true,
              'IZ-select__item--selected': isItemSelected(item)
            }"
            @click="onClickSelectItem(item)"
          >
            <slot
              :item="item"
              name="item"
            >
              <span>
                {{ getItemText(item) }}
              </span>
            </slot>
          </div>

          <div
            v-if="!itemsComputed.length && !loading"
            class="IZ-select__no-data"
          >
            <slot name="no-data">
              {{ coolSelect.options.text.noData }}
            </slot>
          </div>

          <slot name="after-items">
            <div style="height: 8px;" />
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
    </template>

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
  watch
} from 'vue'
import { isObject, getOffsetSum, outOfViewportGetFreePosition, scrollIfNeeded } from './helpers'
import props from './props'
import { SIZES, MENU_POSITIONS, DEFAULT_OPTIONS } from './constants'

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
    'search',
    'keydown',
    'keyup',
    'scroll'
  ],
  setup (props, { emit, slots }) {
    const instance = getCurrentInstance()
    // set by CoolSelectPlugin, the component also works without the plugin
    const coolSelect = instance?.appContext.config.globalProperties.$coolSelect || { options: DEFAULT_OPTIONS }

    const selectRef = ref(null)
    const inputRef = ref(null)
    const inputForTextRef = ref(null)
    // not reactive on purpose: only read on demand
    const menuRefs = {}
    const lastMenuDynamicStyles = {}

    const wishShowMenu = ref(false)
    const arrowsIndex = ref(null)
    const focused = ref(false)
    const selectedItem = ref(null)
    const selectedItemByArrows = ref(null)
    const searchData = ref(props.searchText || '')
    const scrollItemsLimitCurrent = ref(props.scrollItemsLimit)
    const menuCurrentPosition = ref(props.menuDefaultPosition)

    function getSearchData () {
      return searchData.value
    }

    function getItemText (item) {
      if (!item) return null
      if (props.itemText) return item[props.itemText]

      if (isObject(item)) {
        const keys = Object.keys(item)

        if (keys.length === 1) return item[keys[0]]

        return item
      }

      return item
    }

    function getItemValue (item) {
      if (item == null) return null
      if (props.itemValue) return item[props.itemValue]

      if (isObject(item)) {
        const keys = Object.keys(item)

        if (keys.length === 1) return item[keys[0]]

        return item
      }

      return item
    }

    function filteredBySearchItems (items) {
      if (!getSearchData() || props.disableFilteringBySearch) return items

      return items.filter(i =>
        props.filter(i, getSearchData(), getItemText(i))
      )
    }

    const itemsComputed = computed(() => {
      let items = props.items || []

      if (typeof items === 'string') {
        items = JSON.parse(items)
      }

      return filteredBySearchItems(items)
    })
    const currentItemValue = computed(() => getItemValue(selectedItem.value))
    const showSelectionSlot = computed(() => !!slots.selection && !!selectedItem.value && !getSearchData())
    const inputValue = computed(() => {
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
    const hasMenu = computed(() => !props.simpleInput && wishShowMenu.value && !props.loading)
    const hasError = computed(() => !!props.errorMessage)
    const isMobile = computed(() => {
      if (typeof window === 'undefined') return false

      return window.innerWidth <= 900 && window.innerHeight <= 900
    })
    const selectedItemIndex = computed(() => {
      const index = itemsComputed.value.indexOf(selectedItem.value)

      return index === -1 ? null : index
    })

    function setMenuRef (menuPos) {
      return el => {
        if (el) menuRefs[menuPos] = el
        else delete menuRefs[menuPos]
      }
    }

    function getMenuDynamicStyles (menuPos) {
      const isCurrentMenu = menuCurrentPosition.value === menuPos && hasMenu.value
      const obj = {
        visibility: isCurrentMenu ? 'visible' : 'hidden',
        opacity: +isCurrentMenu
      }

      // keeps the last position while the menu fades out
      if (!hasMenu.value) return { ...lastMenuDynamicStyles[menuPos], ...obj }

      const input = inputRef.value
      if (!input) return obj

      obj.width = input.offsetWidth + 'px'
      obj.left = input.offsetLeft + 'px'

      if (menuPos === MENU_POSITIONS.BOTTOM) {
        obj.top = input.offsetTop + input.offsetHeight + 'px'

        if (props.disableSearch) obj.top = input.offsetTop + 'px'
      } else if (menuPos === MENU_POSITIONS.TOP) {
        obj.bottom = '100%'

        if (props.disableSearch) obj.bottom = 0
      }

      lastMenuDynamicStyles[menuPos] = obj

      return obj
    }

    function menuCalculatePos () {
      if (!props.menuDynamicPosition || !hasMenu.value) return

      const menuTop = menuRefs[MENU_POSITIONS.TOP]
      const menuBottom = menuRefs[MENU_POSITIONS.BOTTOM]

      if (!menuTop || !menuBottom) return

      const newPosTop = outOfViewportGetFreePosition(menuTop)
      const newPosBottom = outOfViewportGetFreePosition(menuBottom)

      menuCurrentPosition.value = !newPosTop && !newPosBottom
        ? props.menuDefaultPosition
        : newPosTop || newPosBottom
    }

    function setSearchData (val) {
      searchData.value = val
      emit('update:searchText', val)
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

      wishShowMenu.value = true
      menuCalculatePos()
    }

    function hideMenu () {
      if (!hasMenu.value) return

      wishShowMenu.value = false
    }

    function setFocused (byInput = false) {
      if (focused.value || props.disabled || props.readonly) return

      if (!props.disableSearch && !byInput) setInputFocused()

      if (typeof window !== 'undefined' && window.scrollTo && props.allowMobileScroll && isMobile.value) {
        const { top } = getOffsetSum(inputRef.value)

        window.scrollTo({
          top: top - 8,
          behavior: 'smooth'
        })
      }

      if (props.selectTextOnFocus) setInputSelected()

      focused.value = true
      showMenu()
      emit('focus')
    }

    function setBlured () {
      if (props.resetSearchOnBlur) setSearchData('')

      focused.value = false
      hideMenu()
      inputForTextRef.value?.blur()
      emit('blur')
    }

    function fireSelectEvent (item) {
      selectedItemByArrows.value = null

      nextTick(() => {
        emit('select', item)
      })
    }

    function setSelectedItemByValue () {
      const value = isObject(props.modelValue)
        ? getItemValue(props.modelValue)
        : props.modelValue
      const found = itemsComputed.value.find(i => getItemValue(i) === value)

      selectedItem.value = found === undefined ? null : found
    }

    function isItemSelected (item) {
      return item === selectedItemByArrows.value || (item === selectedItem.value && !selectedItemByArrows.value)
    }

    // the items container of the menu which is currently displayed
    function getCurrentMenuItemsEl () {
      const menu = menuRefs[menuCurrentPosition.value]

      return menu ? menu.querySelector('.IZ-select__menu-items') : null
    }

    function onSelectByArrow (e) {
      e.preventDefault()

      if (props.disabled || props.readonly) return

      showMenu()
      // -1 (not 0), so the first press of "down" selects the first item, not the second
      if (arrowsIndex.value === null) arrowsIndex.value = selectedItemIndex.value ?? -1

      if (e.key === 'ArrowDown') arrowsIndex.value++
      if (e.key === 'ArrowUp') arrowsIndex.value--

      // jump to the opposite side
      const end = itemsComputed.value.length - 1
      if (arrowsIndex.value < 0) arrowsIndex.value = end
      if (arrowsIndex.value > end) arrowsIndex.value = 0

      const itemByArrowsIndex = itemsComputed.value[arrowsIndex.value]

      if (props.arrowsDisableInstantSelection) {
        // only highlights the item
        selectedItemByArrows.value = itemByArrowsIndex
      } else {
        // selects the item right away
        setSearchData('')
        selectedItem.value = itemByArrowsIndex
        fireSelectEvent(selectedItem.value)
      }

      if (props.scrollToItemIfNeeded) {
        nextTick(() => {
          const container = getCurrentMenuItemsEl()
          if (!container) return

          const selectedElement = Array.from(container.children)
            .filter(el => el.classList.contains('IZ-select__item'))[arrowsIndex.value]

          if (!selectedElement) return

          scrollIfNeeded(selectedElement, container)
        })
      }
    }

    function onEnter (e) {
      if (hasMenu.value) {
        e.preventDefault()

        let needToResetSearch = false

        // nothing is selected (also not by arrows): select the first item
        if (!arrowsIndex.value && !selectedItem.value && !props.disableFirstItemSelectOnEnter) {
          const firstItem = itemsComputed.value[0]

          if (!firstItem) return

          selectedItem.value = firstItem
          fireSelectEvent(firstItem)
          needToResetSearch = true
        }

        // the item highlighted by arrows becomes selected
        if (props.arrowsDisableInstantSelection && selectedItemByArrows.value) {
          selectedItem.value = selectedItemByArrows.value
          fireSelectEvent(selectedItem.value)
          needToResetSearch = true
        }

        if (needToResetSearch) setSearchData('')
      }

      hasMenu.value ? hideMenu() : showMenu()
    }

    function onClick () {
      if (props.disabled || props.readonly) return

      setFocused()
      showMenu()
    }

    function onClickSelectItem (item) {
      selectedItem.value = item
      setSearchData('')
      setInputFocused()
      hideMenu()
      fireSelectEvent(item)
    }

    function onSearchKeyDown (e) {
      if (props.disabled || props.readonly) return
      if (['Enter', 'ArrowDown', 'ArrowUp', 'Tab'].includes(e.key)) return

      // important for the "selection" slot: backspace on an empty input removes the selection
      if (!e.target.value && e.key === 'Backspace') {
        selectedItem.value = null
        arrowsIndex.value = null
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
      selectedItem.value = null
      arrowsIndex.value = null
      setSearchData(e.target.value)
      emit('search', getSearchData())
    }

    function onSimpleInput (e) {
      emit('update:modelValue', e.target.value)
    }

    function onScroll (event) {
      emit('scroll', event)

      if (scrollItemsLimitCurrent.value >= itemsComputed.value.length) return

      const content = event.target
      const showMoreItems = (
        content.scrollHeight -
        (content.scrollTop + content.clientHeight)
      ) < 200

      // scrolled near the end: show more items
      if (showMoreItems) {
        scrollItemsLimitCurrent.value += props.scrollItemsLimitAddAfterScroll
      }
    }

    const listeners = {
      mousedown: ({ target }) => {
        const select = selectRef.value

        if (focused.value && select && !select.contains(target)) setBlured()
      },
      scroll: menuCalculatePos,
      resize: menuCalculatePos
    }

    // initial sync with v-model, done before the watchers so it does not emit anything
    setSelectedItemByValue()

    watch(() => props.searchText, val => {
      if (val !== searchData.value) setSearchData(val)
    })
    watch(() => props.modelValue, setSelectedItemByValue)
    watch(() => props.items, setSelectedItemByValue)
    watch(selectedItem, () => {
      selectedItemByArrows.value = null

      const value = currentItemValue.value

      // already in sync with v-model (null and undefined both mean "nothing selected")
      if (value === props.modelValue || (value == null && props.modelValue == null)) return

      emit('update:modelValue', value)
    })
    watch(itemsComputed, items => {
      emit('change-displayed-items', items)
    })
    // the menu is rendered now (opened, or loading has finished), so it can be measured
    watch(hasMenu, val => {
      if (val) nextTick(menuCalculatePos)
    })

    if (props.eventEmitter) props.eventEmitter.on('set-search', setSearchData)

    onMounted(() => {
      window.addEventListener('mousedown', listeners.mousedown)

      if (props.menuDynamicPosition) {
        window.addEventListener('scroll', listeners.scroll)
        window.addEventListener('resize', listeners.resize)
      }
    })

    onBeforeUnmount(() => {
      window.removeEventListener('mousedown', listeners.mousedown)
      window.removeEventListener('scroll', listeners.scroll)
      window.removeEventListener('resize', listeners.resize)

      if (props.eventEmitter && props.eventEmitter.off) {
        props.eventEmitter.off('set-search', setSearchData)
      }
    })

    return {
      MENU_POSITIONS,
      SIZES,
      coolSelect,
      selectRef,
      inputRef,
      inputForTextRef,
      setMenuRef,
      wishShowMenu,
      arrowsIndex,
      focused,
      selectedItem,
      selectedItemByArrows,
      searchData,
      scrollItemsLimitCurrent,
      menuCurrentPosition,
      itemsComputed,
      inputValue,
      currentItemValue,
      showSelectionSlot,
      inputForTextStyles,
      hasMenu,
      hasError,
      isMobile,
      selectedItemIndex,
      getMenuDynamicStyles,
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
      setSelectedItemByValue,
      filteredBySearchItems,
      isItemSelected,
      showMenu,
      hideMenu,
      onSelectByArrow,
      onEnter,
      onClick,
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
