import type { Module } from 'vuex'

//  Defining state types
interface AuthState {
  token: string | null
  remember: boolean
  superUser: boolean
  userName: string
  avatar: string
}

//  Defining the root state type
interface RootState {
  auth: AuthState
}

//  Export module
const authModule: Module<AuthState, RootState> = {
  namespaced: true,
  state: {
    token: null,
    remember: false,
    superUser: false,
    userName: '',
    avatar: '',
  },
  mutations: {
    setToken(state, token: string) {
      state.token = token
    },
    clearToken(state) {
      state.token = null
    },
    setRemember(state, remember: boolean) {
      state.remember = remember
    },
    setSuperUser(state, superUser: boolean) {
      state.superUser = superUser
    },
    setUserName(state, userName: string) {
      state.userName = userName
    },
    setAvatar(state, avatar: string) {
      state.avatar = avatar
    },
  },
  actions: {
    updateToken({ commit }, token: string) {
      commit('setToken', token)
    },
    clearToken({ commit }) {
      commit('clearToken')
    },
    updateRemember({ commit }, remember: boolean) {
      commit('setRemember', remember)
    },
    updateSuperUser({ commit }, superUser: boolean) {
      commit('setSuperUser', superUser)
    },
    updateUserName({ commit }, userName: string) {
      commit('setUserName', userName)
    },
    updateAvatar({ commit }, avatar: string) {
      commit('setAvatar', avatar)
    },
  },
  getters: {
    getToken: state => state.token,
    getRemember: state => state.remember,
    getSuperUser: state => state.superUser,
    getUserName: state => state.userName,
    getAvatar: state => state.avatar,
  },
}

export default authModule
