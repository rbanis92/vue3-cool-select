import type { App, DefineComponent, Plugin } from 'vue'

export interface CoolSelectTexts {
  noData?: string
  loading?: string
  loadingMore?: string
  typeToSearch?: string
  /** text before the typed value in the row which creates a tag */
  create?: string
  /** label of the clear button */
  clear?: string
  /** label of the button which removes a chip */
  remove?: string
}

export interface CoolSelectOptions {
  text?: CoolSelectTexts
}

export type CoolSelectSize = 'default' | 'sm' | 'lg'
export type CoolSelectMenuPosition = 'top' | 'bottom'

export interface CoolSelectSearchResult {
  results: any[]
  more?: boolean
  pagination?: { more?: boolean }
}

export type CoolSelectSearchRequest = (
  text: string,
  page: number,
  params: Record<string, any>,
  signal?: AbortSignal
) => Promise<CoolSelectSearchResult | any[]> | CoolSelectSearchResult | any[]

export interface CoolSelectProps {
  /** value for v-model, an array with "multiple" */
  modelValue?: any
  /** array of items, or the same array as a JSON string */
  items?: any[] | string
  /** property in item for text, several properties, or a function */
  itemText?: string | string[] | ((item: any) => any) | null
  /** separator for "itemText" as an array */
  textSeparator?: string
  /** property in item for value, without it the whole item is the value */
  itemValue?: string | null
  /** property in item with child items, such an item is a group label */
  itemChildren?: string | null
  /** property in item (or a function) telling that the item cannot be selected */
  itemDisabled?: string | ((item: any) => boolean) | null
  multiple?: boolean
  /** the typed text can be added as a new value */
  taggable?: boolean
  clearable?: boolean
  /** single selection: typing removes the selected item */
  clearOnSearch?: boolean
  closeOnSelect?: boolean
  /** item (or items) of the value when it is not in "items" */
  selectedItem?: any
  placeholder?: string | null
  loading?: boolean
  disabled?: boolean
  readonly?: boolean
  /** filter function for search */
  filter?: (item: any, queryText: string, itemText: any) => boolean
  /** search string, can be used with v-model:search-text */
  searchText?: string
  inputElCustomAttributes?: Record<string, any>
  disableSearch?: boolean
  disableFilteringBySearch?: boolean
  resetSearchOnBlur?: boolean
  /** URL for remote search: ?q=text&page=1 -> { results, pagination: { more } } */
  searchUrl?: string | null
  searchParams?: Record<string, any>
  searchDelay?: number
  minSearchLength?: number
  searchRequest?: CoolSelectSearchRequest | null
  /** name of hidden inputs with the value */
  name?: string | null
  id?: string | null
  required?: boolean
  /** renders the menu inside this element, e.g. "body" */
  menuTo?: string | HTMLElement | null
  allowMobileScroll?: boolean
  arrowsDisableInstantSelection?: boolean
  menuItemsMaxHeight?: string
  eventEmitter?: CoolSelectEventEmitter
  scrollItemsLimit?: number
  scrollItemsLimitAddAfterScroll?: number
  disableFirstItemSelectOnEnter?: boolean
  scrollToItemIfNeeded?: boolean
  inputStyles?: Record<string, any>
  inputForTextClass?: string | any[] | Record<string, any>
  errorMessage?: string | null
  successful?: boolean
  size?: CoolSelectSize
  menuDefaultPosition?: CoolSelectMenuPosition
  menuDynamicPosition?: boolean
  selectTextOnFocus?: boolean
  simpleInput?: boolean
}

export interface CoolSelectEmits {
  'update:modelValue': (value: any) => void
  'update:searchText': (searchText: string) => void
  'change-displayed-items': (items: any[]) => void
  select: (item: any) => void
  remove: (item: any) => void
  clear: () => void
  create: (text: string) => void
  search: (searchText: string) => void
  'search-error': (error: unknown) => void
  'load-more': (page: number) => void
  open: () => void
  close: () => void
  focus: () => void
  blur: () => void
  keydown: (event: KeyboardEvent) => void
  keyup: (event: KeyboardEvent) => void
  scroll: (event: Event) => void
}

export interface CoolSelectSlots {
  item?: (props: { item: any }) => any
  selection?: (props: { item: any }) => any
  chip?: (props: { item: any, remove: () => void }) => any
  group?: (props: { group: any }) => any
  create?: (props: { search: string }) => any
  error?: (props: { errorMessage: string }) => any
  'no-data'?: () => any
  loading?: () => any
  'loading-more'?: () => any
  'clear-icon'?: () => any
  'input-before'?: () => any
  'input-after'?: () => any
  'input-start'?: () => any
  'input-end'?: () => any
  'before-items'?: () => any
  'after-items'?: () => any
  'before-items-fixed'?: () => any
  'after-items-fixed'?: () => any
  'before-items-fixed-absolute'?: () => any
  'after-items-fixed-absolute'?: () => any
}

export interface CoolSelectEventEmitter {
  on: (event: string, listener: (data?: any) => void) => void
  off: (event: string, listener: (data?: any) => void) => void
  onOnce: (event: string, listener: (data?: any) => void) => void
  emit: (event: string, data?: any) => void
}

export const Vue3CoolSelect: DefineComponent<
  CoolSelectProps,
  {},
  {},
  {},
  {},
  {},
  {},
  CoolSelectEmits
> & { new (): { $slots: CoolSelectSlots } }
/** Alias of Vue3CoolSelect, the name used by vue-cool-select (Vue 2). */
export const CoolSelect: typeof Vue3CoolSelect
export default Vue3CoolSelect

export const CoolSelectPlugin: Plugin<[CoolSelectOptions?]> & {
  install (app: App, options?: CoolSelectOptions): void
}

export const EventEmitter: {
  new (): CoolSelectEventEmitter
  (): CoolSelectEventEmitter
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $coolSelect: {
      options: { text: Required<CoolSelectTexts> }
    }
  }

  interface GlobalComponents {
    Vue3CoolSelect: typeof Vue3CoolSelect
    CoolSelect: typeof Vue3CoolSelect
  }
}
