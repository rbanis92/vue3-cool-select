import { SIZES, MENU_POSITIONS } from './constants'

export default {
  modelValue: {
    type: null, // any type
    default: null,
    note: 'value for "v-model".'
  },
  items: {
    type: [Array, String],
    default: () => [],
    required: false,
    note: 'array of suggestions (data fetched from backend, etc).'
  },
  itemText: {
    type: [String, Array, Function],
    default: null,
    note: 'property in item for text. An array of properties joins them with "textSeparator", a function gets the item and returns the text.'
  },
  textSeparator: {
    type: String,
    default: ' - ',
    note: 'separator for the text when "itemText" is an array of properties.'
  },
  itemValue: {
    type: String,
    default: null, // null means the whole item is the value
    note: 'property in item for value.'
  },
  placeholder: {
    type: String,
    default: null,
    note: 'placeholder for input.'
  },
  loading: {
    type: Boolean,
    default: false,
    note: 'display the loading indicator.'
  },
  disabled: {
    type: Boolean,
    default: false,
    note: 'disable the select.'
  },
  readonly: {
    type: Boolean,
    default: false,
    note: 'readonly state.'
  },
  filter: {
    type: Function,
    default: (item, queryText, itemText) => {
      const hasValue = val => val != null ? val : ''

      const text = hasValue(itemText)
      const query = hasValue(queryText)

      return text.toString()
        .toLowerCase()
        .indexOf(query.toString().toLowerCase()) > -1
    },
    note: 'filter function for search.'
  },
  searchText: {
    type: String,
    default: '',
    note: 'search string for input, you can use this with "v-model:search-text".'
  },
  inputElCustomAttributes: {
    type: Object,
    default: () => ({}),
    note: 'you can pass your attributes to the input element. Note: the attributes that are used by the component itself inside are not available, for example, "style".'
  },
  disableSearch: {
    type: Boolean,
    default: false,
    note: 'disable search input element.'
  },
  disableFilteringBySearch: {
    type: Boolean,
    default: false,
    note: 'disable filtering by search (you can use search for manually getting items).'
  },
  resetSearchOnBlur: {
    type: Boolean,
    default: true,
    note: 'reset search on blur event.'
  },
  allowMobileScroll: {
    type: Boolean,
    default: true,
    note: 'allow scrolling to an item on mobile devices.'
  },
  arrowsDisableInstantSelection: {
    type: Boolean,
    default: true,
    note: 'disable auto select when up or down with key arrow.'
  },
  menuItemsMaxHeight: {
    type: String,
    default: '300px',
    note: 'max menu height (any css value).'
  },
  eventEmitter: {
    type: Object,
    note: 'Observer pattern, helps manage events from parent to child.'
  },
  scrollItemsLimit: {
    type: Number,
    default: 20,
    note: 'the initial limit of the displayed items to scroll. So that there are not many elements in the scrolling at the beginning. Also see scrollItemsLimitAddAfterScroll prop.'
  },
  scrollItemsLimitAddAfterScroll: {
    type: Number,
    default: 10,
    note: 'the number of items added to the scrollItemsLimit prop after scrolling to the end of the scroll. Also see scrollItemsLimitAddAfterScroll prop.'
  },
  disableFirstItemSelectOnEnter: {
    type: Boolean,
    default: false,
    note: 'disable the selection of the first item from the list of items in menu when to press enter (when no item is selected).'
  },
  scrollToItemIfNeeded: {
    type: Boolean,
    default: true,
    note: 'to scroll to an item if it has moved beyond the scroll bar.'
  },
  inputStyles: {
    type: Object,
    default: () => ({}),
    note: 'custom styles for the input field. You can specify dynamic styles.'
  },
  inputForTextClass: {
    type: [Array, String, Object],
    default: () => '',
    note: 'custom "class" attribute for the input field. You can specify dynamic class.'
  },
  errorMessage: {
    type: String,
    default: null
  },
  successful: {
    type: Boolean,
    default: false,
    note: 'does the component have a successful state. If true, then apply green colors.'
  },
  size: {
    type: String,
    default: SIZES.DEFAULT,
    note: 'sets size'
  },
  menuDefaultPosition: {
    type: String,
    default: MENU_POSITIONS.BOTTOM,
    note: 'sets menu\'s default position'
  },
  menuDynamicPosition: {
    type: Boolean,
    default: true,
    note: 'sets the dynamic position behavior for the menu (based on viewport)'
  },
  selectTextOnFocus: {
    type: Boolean,
    default: false,
    note: 'if true, fully select a chosen item on focus so the user can instantly search for a new item.'
  },
  simpleInput: {
    type: Boolean,
    default: false,
    note: 'works as simple input (no menu)'
  },
  multiple: {
    type: Boolean,
    default: false,
    note: 'multiple selection, "v-model" is an array of values.'
  },
  taggable: {
    type: Boolean,
    default: false,
    note: 'the typed text can be added as a new value (by enter or by click on the "create" row).'
  },
  clearable: {
    type: Boolean,
    default: false,
    note: 'shows a button which removes the selection.'
  },
  clearOnSearch: {
    type: Boolean,
    default: true,
    note: 'single selection: typing a search removes the selected item. With false the item stays selected until another one is chosen.'
  },
  closeOnSelect: {
    type: Boolean,
    default: undefined,
    note: 'close the menu after an item is selected. By default true for single and false for multiple selection.'
  },
  itemChildren: {
    type: String,
    default: null,
    note: 'property in item with child items. Such an item is displayed as a group label.'
  },
  itemDisabled: {
    type: [String, Function],
    default: null,
    note: 'property in item (or a function which gets the item) telling that the item cannot be selected.'
  },
  selectedItem: {
    type: null, // an item or an array of items
    default: null,
    note: 'item (or items) for the value of "v-model" when it is not in "items", e.g. a saved value with remote search.'
  },
  searchUrl: {
    type: String,
    default: null,
    note: 'URL for remote search. Request: "?q=text&page=1", response: { results: [], pagination: { more: true } }.'
  },
  searchParams: {
    type: Object,
    default: () => ({}),
    note: 'additional query parameters for remote search.'
  },
  searchDelay: {
    type: Number,
    default: 250,
    note: 'delay in ms between typing and the request of remote search.'
  },
  minSearchLength: {
    type: Number,
    default: 0,
    note: 'minimal length of the search text for remote search. With 0 the first page is loaded when the menu opens.'
  },
  searchRequest: {
    type: Function,
    default: null,
    note: 'own request for remote search: (text, page, params, signal) => Promise of { results, more }.'
  },
  name: {
    type: String,
    default: null,
    note: 'name of hidden inputs with the value, to submit the select with a form. Multiple selection adds "[]".'
  },
  id: {
    type: String,
    default: null,
    note: '"id" attribute of the input element, e.g. for a label.'
  },
  required: {
    type: Boolean,
    default: false,
    note: 'the form cannot be submitted while nothing is selected.'
  },
  menuTo: {
    type: [String, Object],
    default: null,
    note: 'renders the menu inside this element (CSS selector or element, e.g. "body"), so a parent with "overflow: hidden" or a modal cannot clip it.'
  }
}
