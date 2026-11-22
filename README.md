# vue3-cool-select

Vue 3 select with autocomplete, 13 slots and two themes (Bootstrap, Material Design).

This is a Vue 3 port of [vue-cool-select](https://github.com/iliyaZelenko/vue-cool-select) by Ilya Zelenko,
which supports only Vue 2. The props, slots, events, themes and CSS class names are the same.

## Features

- no dependencies
- autocomplete with built-in or custom search, the search input can also be disabled
- 13 slots to change content anywhere
- keyboard controls and tab navigation
- validation states (error, success), disabled and readonly
- small and large sizes
- two themes, or write your own from scratch
- the menu opens upwards when there is no space below
- TypeScript declarations

## Installation

```bash
npm install vue3-cool-select
```

## Usage

Register globally with the plugin:

```js
import { createApp } from 'vue'
import { CoolSelectPlugin } from 'vue3-cool-select'

// import one theme (or your own)
import 'vue3-cool-select/themes/bootstrap.css'
// import 'vue3-cool-select/themes/material-design.css'

createApp(App)
  .use(CoolSelectPlugin, {
    // optional
    text: { noData: 'No data available' }
  })
  .mount('#app')
```

```vue
<vue3-cool-select
  v-model="selected"
  :items="items"
/>
```

Or import the component where you need it (the plugin is not required):

```vue
<script setup>
import { ref } from 'vue'
import { Vue3CoolSelect } from 'vue3-cool-select'
import 'vue3-cool-select/themes/bootstrap.css'

const items = ['Item 1', 'Item 2', 'Item 3']
const selected = ref(null)
</script>

<template>
  <Vue3CoolSelect
    v-model="selected"
    :items="items"
    placeholder="Select an item"
  />
</template>
```

Items can be objects:

```vue
<Vue3CoolSelect
  v-model="countryCode"
  :items="[{ code: 'JP', name: 'Japan' }, { code: 'NO', name: 'Norway' }]"
  item-text="name"
  item-value="code"
/>
```

### Browser (CDN)

```html
<link rel="stylesheet" href="https://unpkg.com/vue3-cool-select/dist/themes/bootstrap.css">
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/vue3-cool-select"></script>
<script>
  const app = Vue.createApp({ /* ... */ })

  app.use(Vue3CoolSelect.CoolSelectPlugin)
  app.mount('#app')
</script>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | any | `null` | Selected value. |
| `items` | `Array \| String` | `[]` | Items, or the same array as a JSON string. |
| `itemText` | `String` | `null` | Property of an item used as text. |
| `itemValue` | `String` | `null` | Property of an item used as value. Without it the whole item is the value. |
| `placeholder` | `String` | `null` | Placeholder of the input. |
| `loading` | `Boolean` | `false` | Loading state, the menu is hidden while it is `true`. |
| `disabled` | `Boolean` | `false` | Disables the select. |
| `readonly` | `Boolean` | `false` | Readonly state. |
| `filter` | `Function` | text contains query, case-insensitive | `(item, queryText, itemText) => Boolean`, filter for search. |
| `searchText` (`v-model:search-text`) | `String` | `''` | Search string of the input. |
| `inputElCustomAttributes` | `Object` | `{}` | Attributes for the input element. |
| `disableSearch` | `Boolean` | `false` | Disables the search input. |
| `disableFilteringBySearch` | `Boolean` | `false` | Disables filtering by search (use the `search` event to load items yourself). |
| `resetSearchOnBlur` | `Boolean` | `true` | Resets search on blur. |
| `allowMobileScroll` | `Boolean` | `true` | Scrolls to the select on focus on mobile devices. |
| `arrowsDisableInstantSelection` | `Boolean` | `true` | Arrows only highlight an item, enter selects it. With `false` arrows select right away. |
| `menuItemsMaxHeight` | `String` | `'300px'` | Max height of the menu (any CSS value). |
| `eventEmitter` | `Object` | | Instance of `EventEmitter` to send events to the select (see below). |
| `scrollItemsLimit` | `Number` | `20` | Initial limit of displayed items. |
| `scrollItemsLimitAddAfterScroll` | `Number` | `10` | Number of items added to the limit after scrolling to the end. |
| `disableFirstItemSelectOnEnter` | `Boolean` | `false` | Disables selection of the first item by enter when no item is selected. |
| `scrollToItemIfNeeded` | `Boolean` | `true` | Scrolls to the item highlighted by arrows if it is out of view. |
| `inputStyles` | `Object` | `{}` | Styles for the input field. |
| `inputForTextClass` | `String \| Array \| Object` | `''` | Class for the input element. |
| `errorMessage` | `String` | `null` | Error message, also sets the error state. |
| `successful` | `Boolean` | `false` | Successful state. |
| `size` | `String` | `'default'` | `'sm'`, `'default'` or `'lg'`. |
| `menuDefaultPosition` | `String` | `'bottom'` | `'bottom'` or `'top'`. |
| `menuDynamicPosition` | `Boolean` | `true` | Chooses the menu position based on free space in the viewport. |
| `selectTextOnFocus` | `Boolean` | `false` | Selects the text on focus, so the user can type a new search at once. |
| `simpleInput` | `Boolean` | `false` | Works as a simple input without a menu. |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | value | The selected value has changed (`v-model`). |
| `update:searchText` | string | The search string has changed (`v-model:search-text`). |
| `select` | item | An item was selected by the user. |
| `search` | string | The user typed in the search input. |
| `change-displayed-items` | items | The list of displayed items has changed. |
| `focus` | | The select got focus. |
| `blur` | | The select lost focus. |
| `keydown` | event | Key down in the input. |
| `keyup` | event | Key up in the input. |
| `scroll` | event | The menu was scrolled. |

## Slots

| Slot | Props | Description |
| --- | --- | --- |
| `item` | `{ item }` | An item in the menu. |
| `selection` | `{ item }` | The selected item, displayed in the input. |
| `no-data` | | Displayed when there are no items. |
| `error` | `{ errorMessage }` | The error message. |
| `input-before` | | Before the input field. |
| `input-after` | | After the input field. |
| `input-start` | | Inside the input field, at the start. |
| `input-end` | | Inside the input field, at the end. |
| `before-items` | | Before items, scrolls with them. |
| `after-items` | | After items, scrolls with them. |
| `before-items-fixed` | | Above the items, does not scroll. |
| `after-items-fixed` | | Below the items, does not scroll. |
| `before-items-fixed-absolute` | | Over the top of the items, positioned absolutely. |
| `after-items-fixed-absolute` | | Over the bottom of the items, positioned absolutely. |

```vue
<Vue3CoolSelect v-model="user" :items="users" item-text="name">
  <template #item="{ item }">
    <img :src="item.avatar" width="24"> {{ item.name }}
  </template>
  <template #selection="{ item }">
    <b>{{ item.name }}</b>
  </template>
</Vue3CoolSelect>
```

## EventEmitter

```js
import { EventEmitter } from 'vue3-cool-select'

const eventEmitter = new EventEmitter()

// sets the search string of the select which got :event-emitter="eventEmitter"
eventEmitter.emit('set-search', 'text')
```

## Themes

The compiled themes are `vue3-cool-select/themes/bootstrap.css` and
`vue3-cool-select/themes/material-design.css` (also available as `vue3-cool-select/dist/themes/*.css`).
The Stylus sources are in `vue3-cool-select/src/styles/themes`. To write your own theme, copy one of them and
style the `IZ-select*` classes.

## Migration from vue-cool-select (Vue 2)

- `Vue.use(CoolSelectPlugin)` becomes `app.use(CoolSelectPlugin)`.
- The package name in imports is `vue3-cool-select`. `CoolSelect` is still exported and `<cool-select>` is
  still registered by the plugin, next to `Vue3CoolSelect` and `<vue3-cool-select>`.
- `v-model` uses `modelValue` and `update:modelValue`. The `value` prop and the `input` event are gone.
- `:search-text.sync` becomes `v-model:search-text`.
- Scoped slots use the `#item="{ item }"` syntax.

## Development

```bash
npm install
npm run dev     # playground
npm test        # unit tests
npm run build   # dist
```

## License

[MIT](LICENSE). Based on vue-cool-select, copyright (c) 2019 Ilya Zelenko.
