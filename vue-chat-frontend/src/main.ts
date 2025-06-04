import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'

// Naive UI fonts (optional, if you installed vfonts)
// You can choose your favorite font or follow the recommended fonts from Naive UI documentation
import 'vfonts/Lato.css'      // One of the commonly used sans-serif fonts
import 'vfonts/FiraCode.css'  // One of the commonly used monospace fonts, suitable for code display

// Global custom styles (if needed)
// import './assets/main.css' // Uncomment this line if you have global styles

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
