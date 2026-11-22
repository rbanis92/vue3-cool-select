# vue3-cool-select

Vue 3 select with autocomplete, multiple selection, tags, groups, remote search, 19 slots and two themes
(Bootstrap, Material Design). No dependencies.

It started as a Vue 3 port of [vue-cool-select](https://github.com/iliyaZelenko/vue-cool-select) by Ilya Zelenko
and keeps its props, slots, events and CSS class names.

## Features

- single and multiple selection, tags (new values typed by the user)
- autocomplete with built-in or custom filter, or without search
- remote search with debounce, paging on scroll and a preselected value
- option groups and disabled options
- slots to change content anywhere
- keyboard controls, ARIA attributes
- clear button, validation states (error, success), disabled and readonly
- `name` and `required` for plain HTML forms
- small and large sizes
- two themes built on CSS custom properties, or write your own
- the menu opens upwards when there is no space below, and can be rendered in `body` to escape modals
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
    // optional: texts of the component
    text: { noData: 'No data available' }
  })
  .mount('#app')
```

```vue
<vue3-cool-select v-model="selected" :items="items" />
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
  <Vue3CoolSelect v-model="selected" :items="items" placeholder="Select an item" clearable />
</template>
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

In templates written in HTML (not in `.vue` files) use `<cool-select ...></cool-select>` with a closing tag
and props in kebab-case (`item-text`).

## Examples

Objects as items. Without `item-value` the whole object is the value. A value of `v-model` given as a
numeric string (`"5"`) also finds the item with the number `5`.

```vue
<Vue3CoolSelect v-model="countryCode" :items="countries" item-text="name" item-value="code" />
<!-- text from several properties -->
<Vue3CoolSelect v-model="userId" :items="users" :item-text="['code', 'name']" text-separator=" - " item-value="id" />
```

Multiple selection and tags. `v-model` is an array.

```vue
<Vue3CoolSelect v-model="languages" :items="items" multiple clearable />
<!-- the user can add own values by enter -->
<Vue3CoolSelect v-model="tags" :items="items" multiple taggable @create="onNewTag" />
```

Groups and disabled items.

```vue
<Vue3CoolSelect
  v-model="frameworkId"
  :items="[
    { name: 'JavaScript', children: [{ id: 1, name: 'Vue' }, { id: 2, name: 'React' }] },
    { name: 'PHP', children: [{ id: 3, name: 'Laravel' }, { id: 4, name: 'Symfony', disabled: true }] }
  ]"
  item-children="children"
  item-text="name"
  item-value="id"
  item-disabled="disabled"
/>
```

Remote search. The component sends `GET /api/customers?q=text&page=1` and expects
`{ "results": [...], "pagination": { "more": true } }` (`{ results, more }` and a plain array also work).
The first page is loaded when the menu opens, the next pages when the list is scrolled to its end.

```vue
<Vue3CoolSelect
  v-model="customerId"
  search-url="/api/customers"
  :search-params="{ group: groupId }"
  :selected-item="savedCustomer"
  :clear-on-search="false"
  item-value="id"
  item-text="text"
/>
```

`selected-item` is the item of the current value; it is needed because a saved value is usually not in the
loaded list. For another HTTP client or response format pass your own function:

```js
// <Vue3CoolSelect :search-request="searchCustomers" ... />
function searchCustomers (text, page, params, signal) {
  return axios.get('/api/customers', { params: { q: text, page, ...params }, signal })
    .then(({ data }) => ({ results: data.items, more: data.hasNextPage }))
}
```

HTML forms. Hidden inputs carry the value (`name[]` for multiple selection).

```vue
<form method="post">
  <Vue3CoolSelect v-model="countryCode" :items="countries" item-text="name" item-value="code" name="country" required />
</form>
```

Inside a modal or an element with `overflow: hidden` render the menu elsewhere:

```vue
<Vue3CoolSelect v-model="selected" :items="items" menu-to="body" />
```

Slots.

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

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` (`v-model`) | any | `null` | Selected value, an array with `multiple`. |
| `items` | `Array \| String` | `[]` | Items, or the same array as a JSON string. |
| `itemText` | `String \| Array \| Function` | `null` | Property of an item used as text; several properties joined with `textSeparator`; or a function `item => text`. |
| `textSeparator` | `String` | `' - '` | Separator for `itemText` as an array. |
| `itemValue` | `String` | `null` | Property of an item used as value. Without it the whole item is the value. |
| `itemChildren` | `String` | `null` | Property with child items. Such an item is a group label. |
| `itemDisabled` | `String \| Function` | `null` | Property (or function) telling that an item cannot be selected. |
| `multiple` | `Boolean` | `false` | Multiple selection. |
| `taggable` | `Boolean` | `false` | The typed text can be added as a new value. |
| `clearable` | `Boolean` | `false` | Shows a button which removes the selection. |
| `clearOnSearch` | `Boolean` | `true` | Single selection: typing removes the selected item. With `false` it stays until another one is chosen. |
| `closeOnSelect` | `Boolean` | `true` single, `false` multiple | Close the menu after an item is selected. |
| `selectedItem` | any | `null` | Item (or items) of the value when it is not in `items`. |
| `placeholder` | `String` | `null` | Placeholder of the input. |
| `loading` | `Boolean` | `false` | Loading state, the menu is hidden while it is `true`. |
| `disabled` | `Boolean` | `false` | Disables the select. |
| `readonly` | `Boolean` | `false` | Readonly state. |
| `filter` | `Function` | text contains query, case-insensitive | `(item, queryText, itemText) => Boolean`, filter for search. |
| `searchText` (`v-model:search-text`) | `String` | `''` | Search string of the input. |
| `disableSearch` | `Boolean` | `false` | Disables the search input. |
| `disableFilteringBySearch` | `Boolean` | `false` | Disables filtering by search (to fill `items` yourself on the `search` event). |
| `resetSearchOnBlur` | `Boolean` | `true` | Resets search on blur. |
| `searchUrl` | `String` | `null` | URL for remote search. |
| `searchParams` | `Object` | `{}` | Additional query parameters for remote search. A change reloads the list. |
| `searchDelay` | `Number` | `250` | Delay in ms between typing and the request. |
| `minSearchLength` | `Number` | `0` | Minimal length of the text for remote search. With `0` the first page loads on open. |
| `searchRequest` | `Function` | `null` | Own request: `(text, page, params, signal) => Promise<{ results, more }>`. |
| `name` | `String` | `null` | Name of hidden inputs with the value. |
| `id` | `String` | `null` | `id` of the input element, e.g. for a label. |
| `required` | `Boolean` | `false` | The form cannot be submitted while nothing is selected. |
| `menuTo` | `String \| Element` | `null` | Renders the menu inside this element (e.g. `"body"`). |
| `menuItemsMaxHeight` | `String` | `'300px'` | Max height of the menu (any CSS value). |
| `menuDefaultPosition` | `String` | `'bottom'` | `'bottom'` or `'top'`. |
| `menuDynamicPosition` | `Boolean` | `true` | Chooses the menu position based on free space in the viewport. |
| `size` | `String` | `'default'` | `'sm'`, `'default'` or `'lg'`. |
| `errorMessage` | `String` | `null` | Error message, also sets the error state. |
| `successful` | `Boolean` | `false` | Successful state. |
| `arrowsDisableInstantSelection` | `Boolean` | `true` | Arrows only highlight an item, enter selects it. With `false` arrows select right away (single selection). |
| `disableFirstItemSelectOnEnter` | `Boolean` | `false` | Disables selection of the first item by enter when no item is highlighted. |
| `scrollToItemIfNeeded` | `Boolean` | `true` | Scrolls to the item highlighted by arrows if it is out of view. |
| `scrollItemsLimit` | `Number` | `20` | Number of items rendered at first. |
| `scrollItemsLimitAddAfterScroll` | `Number` | `10` | Number of items added after scrolling to the end. |
| `selectTextOnFocus` | `Boolean` | `false` | Selects the text on focus, so the user can type a new search at once. |
| `allowMobileScroll` | `Boolean` | `true` | Scrolls to the select on focus on mobile devices. |
| `inputElCustomAttributes` | `Object` | `{}` | Attributes for the input element. |
| `inputStyles` | `Object` | `{}` | Styles for the input field. |
| `inputForTextClass` | `String \| Array \| Object` | `''` | Class for the input element. |
| `eventEmitter` | `Object` | | Instance of `EventEmitter` to send events to the select (see below). |
| `simpleInput` | `Boolean` | `false` | Works as a simple input without a menu. |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | value | The selected value has changed (`v-model`). |
| `update:searchText` | string | The search string has changed (`v-model:search-text`). |
| `select` | item | An item was selected by the user. |
| `remove` | item | An item was removed (multiple selection). |
| `clear` | | The clear button was used. |
| `create` | string | A new value was created (`taggable`). |
| `search` | string | The user typed in the search input. |
| `search-error` | error | A request of remote search has failed. |
| `load-more` | page | The next page of remote search is requested. |
| `change-displayed-items` | items | The list of displayed items has changed. |
| `open`, `close` | | The menu was opened or closed. |
| `focus`, `blur` | | The select got or lost focus. |
| `keydown`, `keyup` | event | Keys in the input. |
| `scroll` | event | The menu was scrolled. |

## Slots

| Slot | Props | Description |
| --- | --- | --- |
| `item` | `{ item }` | An item in the menu. |
| `selection` | `{ item }` | The selected item, displayed in the input (single selection). |
| `chip` | `{ item, remove }` | A selected item of multiple selection. |
| `group` | `{ group }` | A group label. |
| `create` | `{ search }` | The row which creates a new value (`taggable`). |
| `no-data` | | Displayed when there are no items. |
| `loading`, `loading-more` | | Displayed while remote search loads the first or a next page. |
| `clear-icon` | | Content of the clear button. |
| `error` | `{ errorMessage }` | The error message. |
| `input-before`, `input-after` | | Before and after the input field. |
| `input-start`, `input-end` | | Inside the input field, at its start and end. |
| `before-items`, `after-items` | | Before and after items, scroll with them. |
| `before-items-fixed`, `after-items-fixed` | | Above and below the items, do not scroll. |
| `before-items-fixed-absolute`, `after-items-fixed-absolute` | | Over the top and bottom of the items, positioned absolutely. |

## Keyboard

| Key | Action |
| --- | --- |
| Arrow down / up | Opens the menu, highlights the next / previous item (skips disabled ones). |
| Enter | Selects the highlighted item, or the first found item, or creates a tag. |
| Backspace on an empty input | Removes the selection (the last chip in multiple selection). |
| Escape, Tab | Closes the menu. |
| Home / End | First / last item, when search is disabled. |

## Themes and styling

The compiled themes are `vue3-cool-select/themes/bootstrap.css` and
`vue3-cool-select/themes/material-design.css` (also available as `vue3-cool-select/dist/themes/*.css`).
The Bootstrap theme has the exact measures of Bootstrap 4 `.form-control` in all sizes and states.

Every value of a theme is a CSS custom property, so small changes need no overriding of selectors:

```css
.IZ-select,
.IZ-select__menu {
  --iz-radius: 8px;
  --iz-focus-border-color: #6f42c1;
  --iz-focus-shadow: 0 0 0 .2rem rgba(111, 66, 193, .25);
  --iz-item-selected-color: #6f42c1;
  --iz-menu-z-index: 2000;
}
```

The full list of properties is at the top of `src/styles/themes/bootstrap.styl`. To write a theme from scratch,
import `src/styles/common/main.styl` and set the properties (see the two theme files, each is one list of values).

## EventEmitter

```js
import { EventEmitter } from 'vue3-cool-select'

const eventEmitter = new EventEmitter()

// sets the search string of the select which got :event-emitter="eventEmitter"
eventEmitter.emit('set-search', 'text')
```

## Migration

From 1.x to 2.0:

- A value which is not in `items` stays in `v-model` (1.x replaced it with `null`).
- The menu is rendered when it is opened for the first time, and there is one menu element instead of two.
- An item highlighted by arrows has the class `IZ-select__item--highlighted`; `IZ-select__item--selected` is
  only for selected items.
- The themes were rebuilt on CSS custom properties. Overrides of theme rules may need to be adjusted.

From vue-cool-select (Vue 2):

- `Vue.use(CoolSelectPlugin)` becomes `app.use(CoolSelectPlugin)`.
- The package name in imports is `vue3-cool-select`. `CoolSelect` is still exported and `<cool-select>` is
  still registered by the plugin, next to `Vue3CoolSelect` and `<vue3-cool-select>`.
- `v-model` uses `modelValue` and `update:modelValue`. The `value` prop and the `input` event are gone.
- `:search-text.sync` becomes `v-model:search-text`.
- Scoped slots use the `#item="{ item }"` syntax.

## Development

```bash
npm install
npm run dev     # playground with examples and a page of all states
npm test        # unit tests
npm run build   # dist
```

## License

[MIT](LICENSE). Based on vue-cool-select, copyright (c) 2019 Ilya Zelenko.
