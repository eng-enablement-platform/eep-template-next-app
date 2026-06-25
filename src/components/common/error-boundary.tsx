'use client';

import { unstable_rethrow } from 'next/navigation';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { ErrorDisplay } from '@/components/common/error-display';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      /*
       * Next.js implements redirect() and notFound() by throwing internal
       * control-flow exceptions (digests NEXT_REDIRECT / NEXT_NOT_FOUND). Those
       * are not real errors — re-throw them so the framework can complete the
       * navigation. unstable_rethrow is a no-op for genuine errors, which then
       * fall through to the fallback below.
       */
      if (this.state.error) {
        unstable_rethrow(this.state.error);
      }

      return (
        this.props.fallback ?? (
          <ErrorDisplay errorMessage={this.state.error?.message} />
        )
      );
    }

    return this.props.children;
  }
}
