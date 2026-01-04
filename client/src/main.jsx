import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './axiosConfig' // Import configuration
import App from './App.jsx'

import ErrorBoundary from './components/common/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
