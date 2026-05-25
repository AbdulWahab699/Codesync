import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-900">
          <p className="text-red-400">Something went wrong. Please refresh.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary