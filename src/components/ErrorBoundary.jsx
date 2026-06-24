import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF9F6',
          color: '#2D3436',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E1E6E8',
            padding: '2.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(217, 4, 41, 0.1)',
              color: '#D90429',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 1.5rem auto'
            }}>
              ⚠️
            </div>
            
            <h1 style={{
              fontSize: '24px',
              fontWeight: 800,
              marginBottom: '1rem',
              color: '#2D3436'
            }}>
              Something went wrong
            </h1>
            
            <p style={{
              color: '#636E72',
              fontSize: '15px',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              EchoScribe encountered an unexpected error. You can try returning to the landing page or reloading the application.
            </p>

            <div style={{
              textAlign: 'left',
              backgroundColor: '#F8F9FA',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              padding: '1rem',
              marginBottom: '2rem',
              overflowX: 'auto',
              maxHeight: '200px'
            }}>
              <strong style={{ fontSize: '13px', color: '#D90429', display: 'block', marginBottom: '0.5rem' }}>
                Error: {this.state.error && this.state.error.toString()}
              </strong>
              {isDev && this.state.errorInfo && (
                <pre style={{
                  fontSize: '11px',
                  color: '#4B5563',
                  margin: 0,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#E76F51',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 4px 6px rgba(231, 111, 81, 0.2)',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#D66043'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#E76F51'}
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
