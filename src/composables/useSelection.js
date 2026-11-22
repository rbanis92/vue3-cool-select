import { shallowRef, toRaw } from 'vue'
import { isObject } from '../helpers'

/**
 * Selected items for single and multiple mode.
 * v-model holds values, "selectedItems" holds the items which belong to these values.
 * Synchronisation from v-model never emits; only actions of the user do.
 */
export function useSelection (props, emit, accessors, allItems) {
  const { getItemValue, getItemKey } = accessors

  // shallow: items must keep their identity
  const selectedItems = shallowRef([])
  // values of v-model for which no item is known (yet), they are kept in v-model
  let unresolvedValues = []

  function getModelValues () {
    const value = props.modelValue

    if (props.multiple) {
      if (Array.isArray(value)) return value

      return value == null || value === '' ? [] : [value]
    }

    return value == null ? [] : [value]
  }

  function getPreselectedItems () {
    const preselected = props.selectedItem

    if (preselected == null) return []

    return Array.isArray(preselected) ? preselected : [preselected]
  }

  const NOT_FOUND = {}
  const isStringOrNumber = value => typeof value === 'string' || typeof value === 'number'

  function findItemByValue (value) {
    // v-model can hold an item itself instead of its value
    const key = isObject(value) ? getItemKey(value) : toRaw(value)
    // the previously selected items are searched too, so a selection survives
    // when its item is no longer in the list (e.g. after a remote search)
    const pools = [allItems.value, getPreselectedItems(), selectedItems.value]

    for (const pool of pools) {
      const found = pool.find(item => getItemKey(item) === key)

      if (found !== undefined) return found
    }

    // a value from a server or from a form is often a string ("5") while the item has a number (5)
    if (isStringOrNumber(key)) {
      for (const pool of pools) {
        const found = pool.find(item => {
          const itemKey = getItemKey(item)

          return isStringOrNumber(itemKey) && String(itemKey) === String(key)
        })

        if (found !== undefined) return found
      }
    }

    // an unknown object is shown as it is; an unknown primitive only when new values are allowed
    if (value !== null && typeof value === 'object') return value
    if (props.taggable) return value

    return NOT_FOUND
  }

  function syncFromModel () {
    const items = []

    unresolvedValues = []

    for (const value of getModelValues()) {
      const item = findItemByValue(value)

      if (item === NOT_FOUND) unresolvedValues.push(value)
      else items.push(item)
    }

    selectedItems.value = items
  }

  function emitModel () {
    const values = selectedItems.value.map(getItemValue)

    if (props.multiple) {
      const next = unresolvedValues.concat(values)
      const current = getModelValues()
      const same = next.length === current.length &&
        next.every((value, i) => toRaw(value) === toRaw(current[i]))

      if (!same) emit('update:modelValue', next)

      return
    }

    const value = values.length ? values[0] : null
    const current = props.modelValue

    // already in sync with v-model (null and undefined both mean "nothing selected")
    if (toRaw(value) === toRaw(current) || (value == null && current == null)) return

    unresolvedValues = []
    emit('update:modelValue', value)
  }

  function setItems (items) {
    selectedItems.value = items
    emitModel()
  }

  function isSelected (item) {
    const key = getItemKey(item)

    return selectedItems.value.some(selected => getItemKey(selected) === key)
  }

  // single: replaces the selected item; multiple: adds the item
  function select (item) {
    if (!props.multiple) {
      setItems(item == null ? [] : [item])
    } else if (item != null && !isSelected(item)) {
      setItems(selectedItems.value.concat([item]))
    }
  }

  function remove (item) {
    const key = getItemKey(item)
    const next = selectedItems.value.filter(selected => getItemKey(selected) !== key)

    if (next.length === selectedItems.value.length) return false

    setItems(next)
    emit('remove', item)

    return true
  }

  function clear () {
    if (props.multiple) unresolvedValues = []

    setItems([])
  }

  return { selectedItems, syncFromModel, isSelected, select, remove, clear }
}
