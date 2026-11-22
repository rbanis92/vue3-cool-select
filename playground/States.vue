<!--
  Every state of the select in three sizes. With the Bootstrap theme a real Bootstrap input is
  rendered beside each state (data-ref / data-test), so the measures can be compared.
-->
<template>
  <div>
    <section
      v-for="size in sizes"
      :key="size"
    >
      <h2>Size: {{ size }}</h2>

      <div
        v-for="state in states"
        :key="state.key"
        class="state"
      >
        <div class="state__label">
          {{ state.key }}
        </div>
        <div
          v-if="theme === 'bootstrap'"
          class="state__cell"
        >
          <input
            :data-ref="size + '/' + state.key"
            :class="['form-control', size === 'default' ? '' : 'form-control-' + size, state.refClass]"
            :value="state.props.modelValue"
            :placeholder="state.props.placeholder"
            :disabled="state.props.disabled"
            :readonly="state.props.readonly"
          >
          <div
            v-if="state.props.errorMessage"
            class="invalid-feedback d-block"
            :data-ref-error="size + '/' + state.key"
          >
            {{ state.props.errorMessage }}
          </div>
        </div>
        <div class="state__cell">
          <vue3-cool-select
            :data-test="size + '/' + state.key"
            :items="languages"
            :size="size"
            v-bind="state.props"
          />
        </div>
      </div>

      <div
        v-for="state in extraStates"
        :key="state.key"
        class="state"
      >
        <div class="state__label">
          {{ state.key }}
        </div>
        <div class="state__cell state__cell--wide">
          <vue3-cool-select
            :data-test="size + '/' + state.key"
            :items="state.items || languages"
            :size="size"
            v-bind="state.props"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({ theme: { type: String, required: true } })

const sizes = ['sm', 'default', 'lg']
const languages = ['JavaScript', 'TypeScript', 'PHP', 'Python', 'Go', 'Rust', 'Kotlin', 'Swift']
const groups = [
  { name: 'JavaScript', children: [{ id: 1, name: 'Vue' }, { id: 2, name: 'React' }] },
  { name: 'PHP', children: [{ id: 4, name: 'Laravel' }, { id: 5, name: 'Symfony', disabled: true }] }
]

// states which have an equivalent in Bootstrap
const states = [
  { key: 'placeholder', props: { placeholder: 'Placeholder' } },
  { key: 'value', props: { modelValue: 'TypeScript' } },
  { key: 'disabled', props: { modelValue: 'TypeScript', disabled: true } },
  { key: 'disabled-placeholder', props: { placeholder: 'Placeholder', disabled: true } },
  { key: 'readonly', props: { modelValue: 'TypeScript', readonly: true } },
  { key: 'error', props: { modelValue: 'TypeScript', errorMessage: 'Please select a language' }, refClass: 'is-invalid no-icon' },
  { key: 'success', props: { modelValue: 'TypeScript', successful: true }, refClass: 'is-valid no-icon' }
]
const extraStates = [
  { key: 'clearable', props: { modelValue: 'TypeScript', clearable: true } },
  { key: 'multiple-empty', props: { modelValue: [], multiple: true, placeholder: 'Placeholder' } },
  { key: 'multiple', props: { modelValue: ['PHP', 'Go'], multiple: true, clearable: true } },
  { key: 'multiple-wrap', props: { modelValue: languages, multiple: true, clearable: true } },
  { key: 'multiple-disabled', props: { modelValue: ['PHP', 'Go'], multiple: true, disabled: true } },
  { key: 'taggable', props: { modelValue: ['own tag'], multiple: true, taggable: true } },
  {
    key: 'groups',
    items: groups,
    props: { modelValue: 2, itemChildren: 'children', itemText: 'name', itemValue: 'id', itemDisabled: 'disabled' }
  },
  {
    key: 'long-text',
    items: [{ id: 1, name: 'A very long selected text which does not fit into the field and must be cut with an ellipsis at its end' }],
    props: { modelValue: 1, itemText: 'name', itemValue: 'id', clearable: true }
  },
  { key: 'no-search', props: { modelValue: 'PHP', disableSearch: true } }
]
</script>

<style>
.state {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.state__label {
  flex: 0 0 150px;
  padding-top: 6px;
  font-size: .8rem;
  color: #6c757d;
}

.state__cell {
  flex: 1 1 0;
  min-width: 0;
}

.state__cell--wide {
  max-width: 420px;
}

/* the reference inputs are compared without the validation icons of Bootstrap */
.form-control.no-icon {
  padding-right: .75rem;
  background-image: none;
}

.form-control-sm.no-icon {
  padding-right: .5rem;
}

.form-control-lg.no-icon {
  padding-right: 1rem;
}
</style>
