import { createApp, provide, h } from 'vue'
import App from './App.vue'

import Scene from "./Scene";

createApp(App).mount('#app')

createApp({
  setup() {
    provide("Scene", new Scene(document.querySelector("#scene")));
  },
  render: () => h(App),
})
  .mount("#app");