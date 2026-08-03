'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    const win = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null;
    if (win && win.Sentry) {
      (win.Sentry as { captureException: (error: Error, options?: Record<string, unknown>) => void }).captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
              Algo deu errado
            </h2>

            <p className="mt-2 text-center text-sm text-gray-600">
              Desculpe, ocorreu um erro inesperado. Por favor, tente novamente.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                <p className="font-bold mb-2">Erro:</p>
                <p>{this.state.error.message}</p>
                {this.state.error.stack && (
                  <>
                    <p className="font-bold mt-2 mb-2">Stack:</p>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recarregar página
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.history.back();
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
