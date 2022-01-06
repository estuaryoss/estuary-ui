import {store} from 'quasar/wrappers'
import {createStore} from 'vuex'

import dashboard from './module-dashboard'
import commands from './module-commands'
import eureka_apps from './module-eureka-apps'
import file_transfers from './module-file-transfers'
import env from './module-environment'

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      env,
      dashboard,
      commands,
      eureka_apps,
      file_transfers
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: false
  })

  return Store
})
