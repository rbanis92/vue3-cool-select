# Changelog

## 2.0.0

New:

- Multiple selection (`multiple`) with chips, tags (`taggable`), clear button (`clearable`).
- Option groups (`item-children`) and disabled options (`item-disabled`).
- `item-text` accepts several properties or a function.
- Remote search: `search-url`, `search-params`, `search-delay`, `min-search-length`, `search-request`;
  the first page loads on open, next pages on scroll, outdated requests are aborted.
- `selected-item` shows a value which is not in `items`; `clear-on-search`, `close-on-select`.
- `name`, `id` and `required` for HTML forms.
- A value given as a numeric string finds the item with the same number.
- `menu-to` renders the menu in another element, so modals and `overflow: hidden` cannot clip it.
- New slots `chip`, `group`, `create`, `loading`, `loading-more`, `clear-icon`; new events `remove`,
  `clear`, `create`, `open`, `close`, `load-more`, `search-error`.
- ARIA attributes (combobox, listbox, options).
- Themes rebuilt on CSS custom properties (`--iz-*`). The Bootstrap theme has the exact measures of
  Bootstrap 4 `.form-control` in all sizes and states; the Material theme uses 40/48/56px boxes and 48px rows.

Changed (may need attention when upgrading from 1.x):

- A value which is not in `items` stays in `v-model` instead of being replaced with `null`.
- The menu is rendered when it is opened for the first time; there is one menu element instead of two.
- Only a part of the items is in the DOM (it was hidden with CSS before), more are added on scroll.
- An item highlighted by arrows has the class `IZ-select__item--highlighted`; `IZ-select__item--selected`
  is only for selected items.
- The menu is detached from the input by a small gap and has its own border radius.
- Scroll and resize listeners exist only while the menu is open.

Fixed:

- Invalid CSS in the themes, the Material theme forcing `font-size: 16px` on all content,
  `z-index` of the menu below modals, long selected text not cut with an ellipsis.

## 1.0.0

First release. Vue 3 port of [vue-cool-select](https://github.com/iliyaZelenko/vue-cool-select) 3.5.2.

Changes compared to vue-cool-select:

- Requires Vue 3.3 or newer.
- `v-model` uses `modelValue` / `update:modelValue`; the `value` prop and the `input` event are removed.
- `:search-text.sync` is replaced by `v-model:search-text`.
- The component is exported as `Vue3CoolSelect` (and still as `CoolSelect`).
- `EventEmitter` got an `off` method; the select unsubscribes on unmount.
- The transition of the error message is named `IZ-select-fade` (was `fade`), so it does not clash with
  transitions of the application.
- Fixed: the `focus` event was emitted twice when the select was focused by a click.
- Fixed: enter with an open menu replaced the selected item with the first item.
- Fixed: scrolling to the item highlighted by arrows now uses the menu which is displayed.
- Fixed: selecting an object item through `v-model` when the items array is not reactive.
- Menu items only animate their colors, so they can be clicked as soon as the menu opens.
