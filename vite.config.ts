import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        stories: 'pages/stories.html',
        events: 'pages/events.html',
        faq: 'pages/faq.html',
        availability: 'pages/availability.html',
        contact: 'pages/contact.html',
        donate: 'pages/donate.html',
        virtualTour: 'pages/virtual-tour.html',
        projectOverview: 'pages/project-overview.html',
        donors: 'pages/donors.html',
        adminLogin: 'pages/admin-login.html',
        adminEvents: 'pages/admin-events.html',
      }
    }
  }
})