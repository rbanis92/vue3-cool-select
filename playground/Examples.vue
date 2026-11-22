<template>
  <div>
    <section>
      <h2>Basic, clearable</h2>
      <vue3-cool-select
        v-model="basic"
        :items="languages"
        clearable
        placeholder="Select a language"
      />
      <pre>v-model: {{ basic }}</pre>
    </section>

    <section>
      <h2>Objects, text from two properties</h2>
      <vue3-cool-select
        v-model="countryCode"
        :items="countries"
        :item-text="['code', 'name']"
        item-value="code"
        placeholder="Select a country"
      />
      <pre>v-model: {{ countryCode }}</pre>
    </section>

    <section>
      <h2>Multiple</h2>
      <vue3-cool-select
        v-model="multiple"
        :items="languages"
        multiple
        clearable
        placeholder="Select languages"
      />
      <pre>v-model: {{ multiple }}</pre>
    </section>

    <section>
      <h2>Tags (multiple + taggable)</h2>
      <vue3-cool-select
        v-model="tags"
        :items="languages"
        multiple
        taggable
        placeholder="Type and press enter"
      />
      <pre>v-model: {{ tags }}</pre>
    </section>

    <section>
      <h2>Groups and disabled items</h2>
      <vue3-cool-select
        v-model="grouped"
        :items="groups"
        item-children="children"
        item-text="name"
        item-value="id"
        item-disabled="disabled"
        placeholder="Select a framework"
      />
      <pre>v-model: {{ grouped }}</pre>
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
          <b>{{ item.name }}</b>
          <small class="muted">{{ item.code }}</small>
        </template>
        <template #selection="{ item }">
          <b>{{ item.name }}</b>
        </template>
        <template #no-data>
          No country with this name.
        </template>
      </vue3-cool-select>
      <pre>v-model: {{ countryWithSlots }}</pre>
    </section>

    <section>
      <h2>Remote search (pages of 10, a saved value which is not in the list)</h2>
      <vue3-cool-select
        v-model="remote"
        :search-request="searchCities"
        :selected-item="{ id: 777, text: 'City 777 (saved)' }"
        :clear-on-search="false"
        item-value="id"
        item-text="text"
        clearable
        placeholder="Search a city"
      />
      <pre>v-model: {{ remote }}</pre>
    </section>

    <section>
      <h2>Remote search, multiple</h2>
      <vue3-cool-select
        v-model="remoteMultiple"
        :search-request="searchCities"
        item-value="id"
        item-text="text"
        multiple
        placeholder="Search cities"
      />
      <pre>v-model: {{ remoteMultiple }}</pre>
    </section>

    <section>
      <h2>Inside "overflow: hidden": default menu (clipped) and menu-to="body"</h2>
      <div class="clip row-flex">
        <vue3-cool-select
          v-model="clipped"
          :items="languages"
          placeholder="Clipped"
        />
        <vue3-cool-select
          v-model="detached"
          :items="languages"
          menu-to="body"
          placeholder='menu-to="body"'
        />
      </div>
    </section>

    <section>
      <h2>Form: name and required</h2>
      <form
        class="row-flex"
        @submit.prevent="onSubmit"
      >
        <vue3-cool-select
          v-model="formValue"
          :items="countries"
          item-text="name"
          item-value="code"
          name="country"
          required
          placeholder="Required"
        />
        <button
          class="btn btn-primary"
          style="flex: none"
        >
          Submit
        </button>
      </form>
      <pre>submitted: {{ submitted }}</pre>
    </section>

    <section>
      <h2>Many items (rendered in parts on scroll), instant selection by arrows</h2>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const languages = ['JavaScript', 'TypeScript', 'PHP', 'Python', 'Go', 'Rust', 'Kotlin', 'Swift']
const countries = [
  { code: 'BD', name: 'Bangladesh' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'NO', name: 'Norway' },
  { code: 'UA', name: 'Ukraine' }
]
const groups = [
  { name: 'JavaScript', children: [{ id: 1, name: 'Vue' }, { id: 2, name: 'React' }, { id: 3, name: 'Svelte' }] },
  { name: 'PHP', children: [{ id: 4, name: 'Laravel' }, { id: 5, name: 'Symfony (disabled)', disabled: true }] },
  { name: 'Python', children: [{ id: 6, name: 'Django' }, { id: 7, name: 'Flask' }] }
]
const manyItems = Array.from({ length: 1000 }, (_, i) => 'Item ' + (i + 1))
const cities = Array.from({ length: 95 }, (_, i) => ({ id: i + 1, text: 'City ' + (i + 1) }))

const basic = ref(null)
const countryCode = ref('JP')
const multiple = ref(['PHP', 'Go'])
const tags = ref(['PHP', 'my own tag'])
const grouped = ref(null)
const countryWithSlots = ref(null)
const remote = ref(777)
const remoteMultiple = ref([])
const clipped = ref(null)
const detached = ref(null)
const formValue = ref(null)
const submitted = ref('')
const many = ref(null)
const bottom = ref(null)

// imitates a backend with pages of 10
function searchCities (text, page) {
  return new Promise(resolve => {
    setTimeout(() => {
      const found = cities.filter(city => city.text.toLowerCase().includes(text.toLowerCase()))

      resolve({ results: found.slice((page - 1) * 10, page * 10), more: page * 10 < found.length })
    }, 400)
  })
}

function onSubmit (e) {
  submitted.value = new URLSearchParams(new FormData(e.target)).toString()
}
</script>

<style>
.clip {
  height: 90px;
  padding: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px dashed #adb5bd;
}
</style>
