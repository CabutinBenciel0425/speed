import { Component, type ErrorInfo, type ReactNode } from "react"
import PageError from "@/components/common/PageError"

type State = { hasError: boolean }

export default class RouteErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page render failed", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8">
          <PageError
            message="This page ran into a problem. Reload it to try again."
            onRetry={() => window.location.reload()}
          />
        </main>
      )
    }
    return this.props.children
  }
}
