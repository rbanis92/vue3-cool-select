import type { App, DefineComponent, Plugin } from 'vue'

export interface CoolSelectOptions {
  text?: {
    noData?: string
  }
}

export type CoolSelectSize = 'default' | 'sm' | 'lg'
export type CoolSelectMenuPosition = 'top' | 'bottom'

export interface CoolSelectProps {
  /** value for v-model */
  modelValue?: any
  /** array of items, or the same array as a JSON string */
  items?: any[] | string
  /** property in item for text */
  itemText?: string | null
  /** property in item for value, without it the whole item is the value */
  itemValue?: string | null
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
  search: (searchText: string) => void
  focus: () => void
  blur: () => void
  keydown: (event: KeyboardEvent) => void
  keyup: (event: KeyboardEvent) => void
  scroll: (event: Event) => void
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
>
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
      options: { text: { noData: string } }
    }
  }

  interface GlobalComponents {
    Vue3CoolSelect: typeof Vue3CoolSelect
    CoolSelect: typeof Vue3CoolSelect
  }
}
