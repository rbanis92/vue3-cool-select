import { computed, toRaw } from 'vue'
import { isObject } from '../helpers'

// How text, value and the disabled state are read from an item.
export function createItemAccessors (props) {
  // no property is configured: an object with a single key is treated as { anyKey: value }
  function fallback (item) {
    if (isObject(item)) {
      const keys = Object.keys(item)

      if (keys.length === 1) return item[keys[0]]
    }

    return item
  }

  function getItemText (item) {
    if (item == null || item === '') return null
    // strings and numbers (also the values created with "taggable") are their own text
    if (typeof item !== 'object') return item

    const itemText = props.itemText

    if (typeof itemText === 'function') return itemText(item)
    if (Array.isArray(itemText)) {
      return itemText
        .map(field => item[field])
        .filter(text => text != null && text !== '')
        .join(props.textSeparator)
    }
    if (itemText) return item[itemText]

    return fallback(item)
  }

  function getItemValue (item) {
    if (item == null) return null
    if (typeof item !== 'object') return item
    if (props.itemValue) return item[props.itemValue]

    return fallback(item)
  }

  // toRaw: the same object can come as a reactive proxy from v-model and as a raw object from items
  function getItemKey (item) {
    return toRaw(getItemValue(item))
  }

  function isItemDisabled (item) {
    const itemDisabled = props.itemDisabled

    if (!itemDisabled || item == null) return false
    if (typeof itemDisabled === 'function') return !!itemDisabled(item)

    return typeof item === 'object' && !!item[itemDisabled]
  }

  return { getItemText, getItemValue, getItemKey, isItemDisabled }
}

/**
 * Turns the items (local or loaded by remote search) into rows for the menu.
 * A row is { type: 'item', raw, text, disabled, group, index } or { type: 'group', raw, text, index },
 * "index" is the position among the selectable items (for a group: the index of its first item).
 */
export function useItems (props, accessors, getSearchData, remote) {
  const { getItemText, isItemDisabled } = accessors

  const sourceItems = computed(() => {
    if (remote.enabled.value) return remote.items.value

    let items = props.items || []

    if (typeof items === 'string') items = JSON.parse(items)

    return items
  })

  function createItemRow (raw, group) {
    return {
      type: 'item',
      raw,
      group,
      text: getItemText(raw),
      disabled: isItemDisabled(raw)
    }
  }

  const allRows = computed(() => {
    const rows = []
    const childrenKey = props.itemChildren

    for (const raw of sourceItems.value) {
      const children = childrenKey && raw && typeof raw === 'object' ? raw[childrenKey] : null

      if (Array.isArray(children)) {
        const group = { type: 'group', raw, text: getItemText(raw) }

        rows.push(group)
        for (const child of children) rows.push(createItemRow(child, group))
      } else {
        rows.push(createItemRow(raw, null))
      }
    }

    return rows
  })

  const rows = computed(() => {
    const search = getSearchData()
    let list = allRows.value

    // remote search is filtered by the server
    if (search && !props.disableFilteringBySearch && !remote.enabled.value) {
      const kept = new Set(
        list.filter(row => row.type === 'item' && props.filter(row.raw, search, row.text))
      )
      const groups = new Set()

      kept.forEach(row => row.group && groups.add(row.group))
      list = list.filter(row => row.type === 'group' ? groups.has(row) : kept.has(row))
    }

    let index = 0

    return list.map(row => ({ ...row, index: row.type === 'item' ? index++ : index }))
  })

  // every selectable item, not filtered by search (used to find the items of v-model)
  const allItems = computed(() => allRows.value.filter(row => row.type === 'item').map(row => row.raw))
  const itemRows = computed(() => rows.value.filter(row => row.type === 'item'))
  // displayed selectable items
  const itemsComputed = computed(() => itemRows.value.map(row => row.raw))

  return { rows, itemRows, allItems, itemsComputed }
}
