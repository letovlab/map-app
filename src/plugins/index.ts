// Plugins
import vuetify from './vuetify'
import pinia from '../stores'
import router from '../router'
import openLayersMap from 'vue3-openlayers'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(openLayersMap)
}
