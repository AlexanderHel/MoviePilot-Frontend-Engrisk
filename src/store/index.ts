import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import authModule from './auth'

const store = createStore({
  modules: {
    //  User authenticationstore
    auth: authModule,
  },
  plugins: [
    createPersistedState({
      //  Options for configuring persistent storage
      storage: window.localStorage, //  Utilization localStorage  Storage state
      key: 'moviepilot', //  Stored key names
    }),
  ],
})

export default store
