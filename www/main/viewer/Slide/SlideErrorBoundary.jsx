import React from 'react';
import PropTypes from 'prop-types';

// If a slide throws while rendering, React unmounts the whole window and the
// display goes blank. Leave just that slide out instead, and try again on the
// next one (a different resetKey).
export class SlideErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Slide failed to render:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    const { resetKey } = this.props;
    const { hasError } = this.state;
    if (hasError && prevProps.resetKey !== resetKey) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ hasError: false });
    }
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    return hasError ? null : children;
  }
}

SlideErrorBoundary.propTypes = {
  resetKey: PropTypes.string,
  children: PropTypes.node,
};
