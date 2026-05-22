"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  tabLabel: string;
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/** Isolates tab panel failures so other tabs remain usable. */
export class PromptTabErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`prompt.tab.error.${this.props.tabLabel}`, error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <p className="font-semibold">{this.props.tabLabel} failed to load</p>
          <p className="mt-1 text-xs">{this.state.error.message}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={this.handleRetry}
          >
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
