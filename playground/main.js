import { createApp } from 'vue'
// only the playground uses Bootstrap: as page styles and as the reference for the Bootstrap theme
import 'bootstrap/dist/css/bootstrap.min.css'
import { CoolSelectPlugin } from '../src/index'
import App from './App.vue'

createApp(App)
  .use(CoolSelectPlugin)
  .mount('#app')
