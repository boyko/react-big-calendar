import React from 'react';
import dateMath from 'date-arithmetic';
import LocalizerProvider from '../../src/LocalizerProvider';
import dateFns from '../../src/utils/dates';
import eventFns from '../../src/utils/eventLevels';
import defaultLocalizer from '../../src/localizers/default';
import events from '../events';
import Month from '../../src/Month';
import eventWrapper from '../../src/EventWrapper';
import header from '../../src/Header';
import BackgroundWrapper from '../../src/BackgroundWrapper';
// import IconNext from 'react-material-icons/lib/next_week.svg.react';
// import IconPrev from 'react-material-icons/lib/view_week.svg.react';

import './styles.css';

const css = {
  month_view: 'month_view',
  month_row: 'month_row',
  row: 'week_row',
  header: 'header',
  month_header: 'month_header',
  date_cell: 'date_cell',
  now: 'rbc-now',
  row_content: 'rbc-row-content',
  row_segment: 'rbc-row-segment',
  event: 'rbc-event',
  event_content: 'rbc-event-content',
  row_bg: 'rbc-row-bg',
  day_bg: 'rbc-day-bg',
  selected_cell: 'rbc-selected-cell',
  today: 'rbc-today',
  span_range1: 'span_range_1',
  span_range2: 'span_range_2',
  span_range3: 'span_range_3',
  span_range4: 'span_range_4',
  span_range5: 'span_range_5',
  span_range6: 'span_range_6',
  span_range7: 'span_range_7',
  off_range: 'rbc-off-range',
  current: 'rbc-current',
};

const Event = (props) => {
  return (
    <span>{props.title}</span>
  );
};

const components = {
  event: Event,
  eventWrapper,
  header,
  dateCellWrapper: BackgroundWrapper,
};

class CalendarWrapper extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      date: new Date(2017, 8, 13),
    };
  }

  toNextMonth = () => {
    const { date } = this.state;
    const nextDate = dateMath.add(date, 1, 'month');
    this.setState({ date: nextDate });
  };

  toPrevMonth = () => {
    const { date } = this.state;
    const nextDate = dateMath.subtract(date, 1, 'month');
    this.setState({ date: nextDate });
  };

  render() {
    const { date } = this.state;
    return (
      <div>
        <div>
          <button onClick={this.toPrevMonth}>Previous month</button>
          <div>{date.toISOString()}</div>
          <button onClick={this.toNextMonth}>Next month</button>
        </div>
        <LocalizerProvider
          localizer={defaultLocalizer}
          dateFns={dateFns(defaultLocalizer)}
          eventFns={eventFns(dateFns(defaultLocalizer))}
        >
          <Month
            css={css}
            events={events}
            date={date}
            weekdayFormat={'ddd'}
            titleAccessor="title"
            allDayAccessor="allDay"
            startAccessor="start"
            endAccessor="end"
            onDrillDown={() => null}
            getDrilldownView={() => null}
            components={components}
          />
        </LocalizerProvider>
      </div>
    );
  }
}

export default CalendarWrapper;
