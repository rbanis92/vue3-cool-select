# Changelog

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
