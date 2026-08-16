import { Component } from "react";
import { ErrorState } from "./StateViews";

function reloadCurrentPage() {
  window.location.reload();
}

/**
 * Top-level error boundary. Catches render-time errors anywhere in the routed
 * tree so a single broken page does not blank out the whole app. In dev the
 * error message is surfaced; in production a generic message is shown.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Placeholder for a real error reporter (e.g. Sentry) in a later phase.
    console.error("Unhandled UI error:", error, info);
  }

  handleRetry = () => {
    // React.lazy caches a rejected module promise, so clearing this component's
    // state cannot recover a failed route chunk. A full reload preserves the
    // current URL and lets the browser request the current deployment again.
    (this.props.reloadPage ?? reloadCurrentPage)();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-pink-50">
          <ErrorState
            title="This page hit a snag"
            message={
              import.meta.env?.DEV
                ? String(this.state.error?.message || this.state.error)
                : "Please try again. If the problem continues, come back later."
            }
            onRetry={this.handleRetry}
            retryLabel="Reload page"
          />
        </div>
      );
    }
    return this.props.children;
  }
}
