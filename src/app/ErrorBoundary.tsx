import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { routes } from './routes';
import styles from './ErrorBoundary.module.css';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[Atria render error]', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className={styles.errorPage}>
        <section>
          <p className="eyebrow">Recovery</p>
          <h1>Atria ran into a problem</h1>
          <span>Your saved data has not been intentionally changed. Try reloading the app.</span>
          <div>
            <button type="button" onClick={() => window.location.reload()}>
              Reload Atria
            </button>
            <Link to={routes.settings}>Open data settings</Link>
          </div>
        </section>
      </main>
    );
  }
}
