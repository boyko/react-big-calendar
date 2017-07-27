import React from 'react';
import LocalizerProvider from '../../src/LocalizerProvider';
import dateFns from '../../src/utils/dates';
import eventFns from '../../src/utils/eventLevels';
import defaultLocalizer from '../../src/localizers/default';
import events from '../events';
import Month from '../../src/Month';
import eventWrapper from '../../src/EventWrapper';
import header from '../../src/Header';
import BackgroundWrapper from '../../src/BackgroundWrapper';

const components = {
  event: () => <span>Test event</span>,
  eventWrapper,
  header,
  dateCellWrapper: BackgroundWrapper,
};

const Calendar = () => (
  <LocalizerProvider
    localizer={defaultLocalizer}
    dateFns={dateFns(defaultLocalizer)}
    eventFns={eventFns(dateFns(defaultLocalizer))}
  >
    <Month
      events={events}
      date={new Date(2015, 3, 1)}
      titleAccessor="title"
      allDayAccessor="allDay"
      startAccessor="start"
      endAccessor="end"
      onDrillDown={() => null}
      getDrilldownView={() => null}
      components={components}
    />
  </LocalizerProvider>
);

export default Calendar;
