import { ref } from 'vue'
import { MENU_POSITIONS } from '../constants'

/**
 * Places the menu above or below the input field.
 * Without "menu-to" the menu is positioned inside the select, with "menu-to" it is rendered
 * elsewhere (e.g. in body) and fixed to the viewport, so a modal or "overflow: hidden" cannot clip it.
 */
export function useMenuPosition (props, { selectRef, inputRef, menuRef, isOpen }) {
  const menuCurrentPosition = ref(props.menuDefaultPosition)
  const menuPositionStyles = ref({})

  function getPosition (rect, menu) {
    if (!props.menuDynamicPosition) return props.menuDefaultPosition

    const height = menu.offsetHeight
    // with a disabled search the menu covers the input field
    const overflowAbove = (props.disableSearch ? rect.bottom : rect.top) - height < 0
    const overflowBelow = (props.disableSearch ? rect.top : rect.bottom) + height > window.innerHeight

    if (overflowAbove) return MENU_POSITIONS.BOTTOM
    if (overflowBelow) return MENU_POSITIONS.TOP

    return props.menuDefaultPosition
  }

  function menuCalculatePos () {
    const select = selectRef.value
    const input = inputRef.value
    const menu = menuRef.value

    if (!select || !input || !menu || !isOpen.value) return

    const rect = input.getBoundingClientRect()
    const styles = {}

    if (props.menuTo) {
      styles.position = 'fixed'
      styles.left = rect.left + 'px'
      styles.width = rect.width + 'px'
    } else {
      styles.left = input.offsetLeft + 'px'
      styles.width = input.offsetWidth + 'px'
    }

    // the height of the menu depends on its width, so the width is applied before measuring
    menu.style.width = styles.width

    const position = getPosition(rect, menu)

    if (props.menuTo) {
      if (position === MENU_POSITIONS.BOTTOM) {
        styles.top = (props.disableSearch ? rect.top : rect.bottom) + 'px'
      } else {
        styles.bottom = (window.innerHeight - (props.disableSearch ? rect.bottom : rect.top)) + 'px'
      }
    } else if (position === MENU_POSITIONS.BOTTOM) {
      styles.top = input.offsetTop + (props.disableSearch ? 0 : input.offsetHeight) + 'px'
    } else {
      styles.bottom = select.offsetHeight - input.offsetTop - (props.disableSearch ? input.offsetHeight : 0) + 'px'
    }

    menuCurrentPosition.value = position
    menuPositionStyles.value = styles
  }

  return { menuCurrentPosition, menuPositionStyles, menuCalculatePos }
}
