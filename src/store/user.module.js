import Api from '../services/Api'
import router from '../router'

const state = {
    token: null,
    user: null,
}

const getters = {
    user: state => state.user,
    isAuthenticated: state => state.token !== null,
    isAdmin: state => {
        if (state.user && state.user.isAdmin) {
            return true
        }
    }
}

const mutations = {
    authUser: (state, userData) => {
        console.log(userData)
        const { user, token } = userData
        state.token = token
        state.user = user
    },
    clearAuth: (state) => {
        state.token = null
        state.user = null
    }
}

const actions = {
    setLogoutTimer: ({ commit }, expirationTime) => {
        setTimeout(() => {
            commit('clearAuth')
            console.log('You have been logged out after 2 hours.')
        }, expirationTime * 1000)
    },
    register: async ({ commit, dispatch }, formData) => {
        try {
            const { data } = await Api.post('/users', formData)
            console.log(data)
            commit('authUser', data)
            const now = new Date()
            const expirationDate = new Date(now.getTime() + 7200000)
            localStorage.setItem('bs-auth-time', expirationDate)
            localStorage.setItem('bs-auth-token', data.token)
            dispatch('setLogoutTimer', 7200)
        } catch (err) {
            console.log('There was an error', err)
        }
    },
    login: async ({ commit, dispatch }, authData) => {
        try {
            const { data } = await Api.post('/auth/login', authData)
            console.log(data)
            commit('authUser', data)
            const now = new Date()
            const expirationDate = new Date(now.getTime() + 3600000)
            localStorage.setItem('bs-auth-time', expirationDate)
            localStorage.setItem('bs-auth-token', data.token)
            dispatch('setLogoutTimer', 3600)
        } catch (err) {
            console.log('There was an error', err)
        }
    },
    tryAutoLogin: async ({ commit }) => {
        const token = localStorage.getItem('bs-auth-token')
        if (!token) return
        const expirationDate = localStorage.getItem('bs-auth-time')
        const now = new Date()
        if (now >= expirationDate) {
            return
        }
        const { data } = await Api.get('/users/me', {
            headers: {
                Authorization: `Bearer: ${token}`
            }
        })
        commit('authUser', data)
    },
    logout: ({ commit }) => {
        localStorage.removeItem('bs-auth-token')
        localStorage.removeItem('bs-auth-time')
        commit('clearAuth')
        router.replace('/login')
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}