import { createApp } from 'vue'
import { CoolSelectPlugin } from '../src/index'
import App from './App.vue'

createApp(App)
  .use(CoolSelectPlugin)
  .mount('#app')
