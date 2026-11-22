<template>
  <main class="page">
    <header class="page__header">
      <h1>vue3-cool-select</h1>

      <label>
        Theme
        <select v-model="theme">
          <option value="bootstrap">Bootstrap</option>
          <option value="material-design">Material Design</option>
        </select>
      </label>
    </header>

    <section>
      <h2>Basic</h2>
      <vue3-cool-select
        v-model="basic"
        :items="languages"
        placeholder="Select a language"
      />
      <pre>v-model: {{ basic }}</pre>
    </section>

    <section>
      <h2>Objects with item-text and item-value</h2>
      <vue3-cool-select
        v-model="countryCode"
        :items="countries"
        item-text="name"
        item-value="code"
        placeholder="Select a country"
      />
      <pre>v-model: {{ countryCode }}</pre>
    </section>

    <section>
      <h2>Slots: item, selection, no-data</h2>
      <vue3-cool-select
        v-model="countryWithSlots"
        :items="countries"
        item-text="name"
        placeholder="Select a country"
      >
        <template #item="{ item }">
          <span class="flag">{{ item.flag }}</span>
          <b>{{ item.name }}</b>
          <small class="muted">{{ item.code }}</small>
        </template>
        <template #selection="{ item }">
          <span class="flag">{{ item.flag }}</span>
          <b>{{ item.name }}</b>
        </template>
        <template #no-data>
          No country with this name.
        </template>
      </vue3-cool-select>
      <pre>v-model: {{ countryWithSlots }}</pre>
    </section>

    <section>
      <h2>Remote search (v-model:search-text, loading, search event)</h2>
      <vue3-cool-select
        v-model="remote"
        v-model:search-text="remoteSearch"
        :items="remoteItems"
        :loading="remoteLoading"
        disable-filtering-by-search
        :reset-search-on-blur="false"
        placeholder="Type to search"
        @search="onRemoteSearch"
      >
        <template #input-end>
          <span
            v-if="remoteLoading"
            class="muted loading"
          >loading…</span>
        </template>
      </vue3-cool-select>
      <pre>search: "{{ remoteSearch }}", v-model: {{ remote }}</pre>
    </section>

    <section>
      <h2>Sizes</h2>
      <div class="row">
        <vue3-cool-select
          v-for="size in ['sm', 'default', 'lg']"
          :key="size"
          v-model="sizes[size]"
          :items="languages"
          :size="size"
          :placeholder="size"
        />
      </div>
    </section>

    <section>
      <h2>Validation</h2>
      <vue3-cool-select
        v-model="validated"
        :items="languages"
        :error-message="validated ? null : 'Please select a language'"
        :successful="!!validated"
        placeholder="Required"
      />
    </section>

    <section>
      <h2>Disabled, readonly, without search</h2>
      <div class="row">
        <vue3-cool-select
          model-value="PHP"
          :items="languages"
          disabled
        />
        <vue3-cool-select
          model-value="PHP"
          :items="languages"
          readonly
        />
        <vue3-cool-select
          v-model="noSearch"
          :items="languages"
          disable-search
          placeholder="No search"
        />
      </div>
    </section>

    <section>
      <h2>Many items (lazy rendering on scroll), instant selection by arrows</h2>
      <vue3-cool-select
        v-model="many"
        :items="manyItems"
        :arrows-disable-instant-selection="false"
        placeholder="1000 items"
      />
    </section>

    <section>
      <h2>Menu opens upwards when there is no space below</h2>
      <vue3-cool-select
        v-model="bottom"
        :items="languages"
        placeholder="Scroll so this is near the bottom of the window"
      />
    </section>
  </main>
</template>

<script setup>
import { reactive, ref, watchEffect } from 'vue'
import bootstrapCss from '../src/styles/themes/bootstrap.styl?inline'
import materialCss from '../src/styles/themes/material-design.styl?inline'

const themes = { bootstrap: bootstrapCss, 'material-design': materialCss }
const theme = ref('bootstrap')
const styleEl = document.createElement('style')

document.head.appendChild(styleEl)
watchEffect(() => {
  styleEl.textContent = themes[theme.value]
})

const languages = ['JavaScript', 'TypeScript', 'PHP', 'Python', 'Go', 'Rust', 'Kotlin', 'Swift']
const countries = [
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' }
]
const manyItems = Array.from({ length: 1000 }, (_, i) => 'Item ' + (i + 1))

const basic = ref(null)
const countryCode = ref('JP')
const countryWithSlots = ref(null)
const sizes = reactive({ sm: null, default: null, lg: null })
const validated = ref(null)
const noSearch = ref(null)
const many = ref(null)
const bottom = ref(null)

const remote = ref(null)
const remoteSearch = ref('')
const remoteItems = ref([])
const remoteLoading = ref(false)
let remoteTimer = null

// imitates a request to a backend
function onRemoteSearch (text) {
  clearTimeout(remoteTimer)
  remoteLoading.value = true

  remoteTimer = setTimeout(() => {
    remoteItems.value = text
      ? languages.filter(l => l.toLowerCase().includes(text.toLowerCase()))
      : []
    remoteLoading.value = false
  }, 500)
}
</script>

<style>
body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #212529;
  background: #f6f7f9;
}

.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 320px;
}

.page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

h1 {
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

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.row > * {
  flex: 1 1 160px;
}

.flag {
  margin-right: 8px;
}

.muted {
  margin-left: 8px;
  color: #6c757d;
}

.loading {
  margin-right: 12px;
  font-size: .8rem;
  white-space: nowrap;
}
</style>
