import React from 'react';

export class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <h1>Ocorreu um erro na interface.</h1>
          <p>Verifique o console para detalhes técnicos.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default DebugErrorBoundary;

