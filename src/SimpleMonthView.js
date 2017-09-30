import React from 'react';
import PropTypes from 'prop-types';
import chunk from 'lodash/chunk';

const propTypes = {
  css: PropTypes.shape({
    month: PropTypes.string,
    month__header: PropTypes.string,
  }),
  events: PropTypes.array.isRequired,
};
const defaultProps = {};

const contextTypes = {
  localizer: PropTypes.object,
  dateFns: PropTypes.object,
  eventFns: PropTypes.objec,
};

class SimpleMonthView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.localizer = this.context.localizer;
    this.dateFns = this.context.dateFns;
    this.eventFns = this.context.eventFns;
  }

  eventsForRange = (start, end) => {
    return this.props.events
      .filter(e => this.eventFns.inRange(e, start, end, this.props));
  };

  renderMonthHeader(week) {
    const { css } = this.props;

    return (
      <ol className={css.month_header}>
        {
          week.map((day) => {
            return (<li key={day}>{this.localizer.format(day, 'ddd')}</li>);
          })
        }
      </ol>
    );
  }

  renderWeekHeader = (weekDays) => {
    const { css } = this.props;
    return (
      <ol className={css.week__days}>

      </ol>
    );
  };

  renderWeekSegments = (events) => {
    return (

    );
  };

  renderWeek = (week, idx) => {
    const { css } = this.props;

    const eventsForWeek = this.eventsForRange(week[0], week[week.length - 1]);
    eventsForWeek.sort((a, b) => this.eventFns.sortEvents(a, b, this.props));

    return (
      <div className={css.week} key={idx}>
        {this.renderWeekHeader(week)}

      </div>
    );
  };

  render() {
    const { css } = this.props;

    const month = this.dateFns.visibleDays(date);

    const weeks = chunk(month, 7);

    return (
      <div className={css.month}>
        {this.renderMonthHeader(weeks[0])}
        <div className={css.weeks__container}>
          {weeks.map((week, idx) => this.renderWeek(week, idx))}
        </div>
      </div>
    );
  }
};

SimpleMonthView.propTypes = propTypes;
SimpleMonthView.defaultProps = defaultProps;
SimpleMonthView.contextTypes = contextTypes;

export default SimpleMonthView;
