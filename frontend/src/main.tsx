import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "sonner"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "leaflet/dist/leaflet.css"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
        <Toaster
          toastOptions={{
            style: {
              background: "var(--speed-orange-light)",
              color: "var(--accent-foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
)
