import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router'
import {QueryClientProvider} from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import {queryClient} from './app/queryClient.ts'
import {worker} from './mocks/browser.ts'

async function startApp(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
  })

  const rootElement = document.getElementById('root');

  if(!rootElement) {
    throw new Error('Root element not found');
  }

  createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
  )
}

void startApp();
