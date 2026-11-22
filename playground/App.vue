<template>
  <main class="page">
    <header class="page__header">
      <h1>vue3-cool-select</h1>

      <div class="page__controls">
        <select
          v-model="page"
          class="custom-select custom-select-sm"
        >
          <option value="examples">
            Examples
          </option>
          <option value="states">
            States
          </option>
        </select>
        <select
          v-model="theme"
          class="custom-select custom-select-sm"
        >
          <option value="bootstrap">
            Bootstrap
          </option>
          <option value="material-design">
            Material Design
          </option>
        </select>
      </div>
    </header>

    <Examples v-if="page === 'examples'" />
    <States
      v-else
      :theme="theme"
    />
  </main>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import bootstrapCss from '../src/styles/themes/bootstrap.styl?inline'
import materialCss from '../src/styles/themes/material-design.styl?inline'
import Examples from './Examples.vue'
import States from './States.vue'

const themes = { bootstrap: bootstrapCss, 'material-design': materialCss }
const params = new URLSearchParams(location.search)
const theme = ref(params.get('theme') || 'bootstrap')
const page = ref(params.get('page') || 'examples')
const styleEl = document.createElement('style')

document.head.appendChild(styleEl)
watchEffect(() => {
  styleEl.textContent = themes[theme.value]
})
watchEffect(() => {
  history.replaceState(null, '', '?page=' + page.value + '&theme=' + theme.value)
})
</script>

<style>
body {
  background: #f6f7f9;
}

.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 360px;
}

.page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page__controls {
  display: flex;
  gap: 8px;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

h2 {
  margin: 32px 0 8px;
  font-size: 1rem;
  font-weight: 600;
}

pre {
  margin: 8px 0 0;
  font-size: .8rem;
  color: #6c757d;
  white-space: pre-wrap;
}

.row-flex {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.row-flex > * {
  flex: 1 1 160px;
  min-width: 0;
}

.muted {
  margin-left: 8px;
  color: #6c757d;
}
</style>
