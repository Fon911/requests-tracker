import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import './app/styles/tokens.css'
import './app/styles/global.css'
import './app/styles/app.css'

import { App } from './app/App'
import { AppProviders } from './app/providers'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
