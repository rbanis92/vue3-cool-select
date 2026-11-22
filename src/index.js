import { mergeDeep } from './helpers'
import { DEFAULT_OPTIONS } from './constants'
import Vue3CoolSelect from './Vue3CoolSelect.vue'

export const CoolSelectPlugin = {
  install (app, optionsInput = {}) {
    app.config.globalProperties.$coolSelect = {
      options: mergeDeep(DEFAULT_OPTIONS, optionsInput)
    }

    app.component('Vue3CoolSelect', Vue3CoolSelect)
    app.component('CoolSelect', Vue3CoolSelect)
  }
}

export { default as EventEmitter } from './eventEmitter'
// "CoolSelect" is the name used by vue-cool-select (Vue 2), kept to make migration easier
export { Vue3CoolSelect, Vue3CoolSelect as CoolSelect }
export default Vue3CoolSelect
