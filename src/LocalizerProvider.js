import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  localizer: PropTypes.shape({
    format: PropTypes.func,
  }).isRequired,
  dateFns: PropTypes.shape({
    monthsInYear: PropTypes.func,
    firstVisibleDay: PropTypes.func,
    lastVisibleDay: PropTypes.func,
    visibleDays: PropTypes.func,
    ceil: PropTypes.func,
    range: PropTypes.func,
    merge: PropTypes.func,
    sameMonth: PropTypes.func,
    isToday: PropTypes.func,
    eqTime: PropTypes.func,
    isJustDate: PropTypes.func,
    duration: PropTypes.func,
    diff: PropTypes.func,
    total: PropTypes.func,
    week: PropTypes.func,
    today: PropTypes.func,
    yesterday: PropTypes.func,
    tomorrow: PropTypes.func,
  }).isRequired,
  eventFns: PropTypes.object.isRequired,
};
const defaultProps = {};

class LocalizerProvider extends React.Component {
  getChildContext() {
    return {
      localizer: this.props.localizer,
      dateFns: this.props.dateFns,
      eventFns: this.props.eventFns,
    };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

LocalizerProvider.childContextTypes = propTypes;
LocalizerProvider.propTypes = propTypes;
LocalizerProvider.defaultProps = defaultProps;

export default LocalizerProvider;