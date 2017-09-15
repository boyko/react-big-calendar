import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  css: PropTypes.shape({
    month_view: PropTypes.string,
  }),
};
const defaultProps = {};

class SimpleMonth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { css } = this.props;
    return (
      <div className={css.month_view}>
        <div className={css.month_header}>

        </div>
        <div>

        </div>
      </div>
    );
  }
}

SimpleMonth.propTypes = propTypes;
SimpleMonth.defaultProps = defaultProps;
SimpleMonth.contextTypes = {
  localizer: PropTypes.object,
  dateFns: PropTypes.object,
  eventFns: PropTypes.object,
};


export default SimpleMonth;
