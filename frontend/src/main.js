import Alpine from 'alpinejs'
import './index.css'
import './App.css'

const clubTabs = {
  overview: {
    label: 'AT A GLANCE',
    title: 'Overview',
    description: 'Your community, your matches, and your next game—all in one place.',
  },
  leaderboard: {
    label: 'THE STANDINGS',
    title: 'Leaderboard',
    description: 'Follow your community’s progress, one match at a time.',
  },
  schedules: {
    label: 'ON THE CALENDAR',
    title: 'Schedules',
    description: 'See what’s coming up on the court.',
  },
}

Alpine.data('tennisApp', () => {
  return {
    page: window.location.hash || '#home',
    message: '',
    user: null,
    sessionReady: false,
    busy: false,
    clubTab: 'overview',

    get signup() {
      return this.page === '#signup'
    },

    get accountPage() {
      return !this.user && (this.signup || this.page === '#login')
    },

    get activeTab() {
      return clubTabs[this.clubTab]
    },

    async init() {
      try {
        const response = await fetch('/api/session')
        if (!response.ok) return
        const data = await response.json()
        this.user = data.user
      } catch {
        // The public homepage works without account services.
      } finally {
        this.sessionReady = true
      }
    },

    navigate() {
      this.$root.querySelector('.account-panel form')?.reset()
      this.page = window.location.hash || '#home'
      this.message = ''
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    },

    async submit(event) {
      if (this.busy) return
      const form = event.currentTarget
      const signup = this.signup
      const data = new FormData(form)

      if (signup && data.get('password') !== data.get('confirm')) {
        this.message = 'Your passwords do not match.'
        return
      }

      this.busy = true
      this.message = ''
      try {
        const response = await fetch(signup ? '/api/signup' : '/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(data)),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Unable to continue.')

        form.reset()
        this.user = result.user
        window.location.hash = '#home'
      } catch (error) {
        this.message = error instanceof SyntaxError ? 'Account services are unavailable.' : error.message
      } finally {
        this.busy = false
      }
    },

    async logout() {
      if (this.busy) return
      this.busy = true
      this.message = ''
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{}',
        })
        if (!response.ok) throw new Error('Unable to log out. Please try again.')
        this.user = null
        this.clubTab = 'overview'
        window.location.hash = '#home'
      } catch (error) {
        this.message = error.message
      } finally {
        this.busy = false
      }
    },
  }
})

window.Alpine = Alpine
Alpine.start()
