import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { liquidGlass } from './directives/liquidGlass'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('liquid-glass', liquidGlass)

app.mount('#app')
