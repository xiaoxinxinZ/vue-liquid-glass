import { createApp } from 'vue'
import App from './App.vue'
import { liquidGlass } from './directives/liquidGlass'
import './style.css'

const app = createApp(App)

app.directive('liquid-glass', liquidGlass)

app.mount('#app')
