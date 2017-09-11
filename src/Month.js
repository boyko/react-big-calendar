import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';

// import dates from './utils/dates';
import chunk from 'lodash/chunk';

// import { views } from './utils/constants';
import { notify } from './utils/helpers';
import getPosition from 'dom-helpers/query/position';
import raf from 'dom-helpers/util/requestAnimationFrame';

import Popup from './Popup';
import Overlay from 'react-overlays/lib/Overlay';
import DateContentRow from './DateContentRow';
import Header from './Header';

import { accessor, dateFormat } from './utils/propTypes';
// import { segStyle, inRange, sortEvents } from './utils/eventLevels';


let propTypes = {
  events: PropTypes.array.isRequired,
  date: PropTypes.instanceOf(Date),

  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),

  step: PropTypes.number,
  now: PropTypes.instanceOf(Date),

  scrollToTime: PropTypes.instanceOf(Date),
  eventPropGetter: PropTypes.func,

  culture: PropTypes.string,
  dayFormat: dateFormat,

  rtl: PropTypes.bool,
  width: PropTypes.number,

  titleAccessor: accessor.isRequired,
  allDayAccessor: accessor.isRequired,
  startAccessor: accessor.isRequired,
  endAccessor: accessor.isRequired,

  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),

  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,

  dateFormat,

  weekdayFormat: dateFormat,
  popup: PropTypes.bool,

  messages: PropTypes.object,
  components: PropTypes.shape({
    event: PropTypes.func.isRequired,
    header: PropTypes.func.isRequired,
    eventWrapper: PropTypes.func.isRequired,
    dateCellWrapper: PropTypes.func.isRequired,
  }).isRequired,
  popupOffset: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
  ]),
  css: PropTypes.shape({
    month_view: PropTypes.string,
    month_row: PropTypes.string,
    header: PropTypes.string,
    row: PropTypes.string,
    month_header: PropTypes.string,
    date_cell: PropTypes.string,
    now: PropTypes.string,
    row_content: PropTypes.string,
    row_segment: PropTypes.string,
    event: PropTypes.string,
    event_content: PropTypes.string,
    row_bg: PropTypes.string,
    day_bg: PropTypes.string,
    selected_cell: PropTypes.string,
    today: PropTypes.string,
    span_range1: PropTypes.string,
    span_range2: PropTypes.string,
    span_range3: PropTypes.string,
    span_range4: PropTypes.string,
    span_range5: PropTypes.string,
    span_range6: PropTypes.string,
    span_range7: PropTypes.string,
    off_range: PropTypes.string,
    current: PropTypes.string,
  }),
};

const defaultProps = {
  css: {
    month_view: 'rbc-month-view',
    month_row: 'rbc-month-row',
    header: 'rbc-header',
    row: 'rbc-row',
    month_header: 'rbc-month-header',
    date_cell: 'rbc-date-cell',
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
  },
};

class MonthView extends React.Component {
  static displayName = 'MonthView';
  static propTypes = propTypes;
  static defaultProps = defaultProps;
  static contextTypes = {
    localizer: PropTypes.object,
    dateFns: PropTypes.object,
    eventFns: PropTypes.object,
  };

  constructor(...args) {
    super(...args);

    this._bgRows = [];
    this._pendingSelection = [];
    this.state = {
      rowLimit: 5,
      needLimitMeasure: true,
    };
    this.localizer = this.context.localizer;
    this.dateFns = this.context.dateFns;
    this.eventFns = this.context.eventFns;

    this.eventsForWeek = this.eventsForWeek.bind(this);
  }

  eventsForWeek(start, end) {
    return this.props.events
      .filter(e => this.eventFns.inRange(e, start, end, this.props));
  }


  componentWillReceiveProps({ date }) {
    this.setState({
      needLimitMeasure: !this.dateFns.eq(date, this.props.date),
    });
  }

  componentDidMount() {
    let running;

    if (this.state.needLimitMeasure) this.measureRowLimit(this.props);

    window.addEventListener(
      'resize',
      (this._resizeListener = () => {
        if (!running) {
          raf(() => {
            running = false;
            this.setState({ needLimitMeasure: true }); //eslint-disable-line
          });
        }
      }),
      false,
    );
  }

  componentDidUpdate() {
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener, false);
  }

  getContainer = () => {
    return findDOMNode(this);
  };

  render() {
    let { date, culture, weekdayFormat, className, css } = this.props,
      month = this.dateFns.visibleDays(date, culture),
      weeks = chunk(month, 7);

    this._weekCount = weeks.length;

    return (
      <div className={cn(css.month_view, className)}>
        <div className={`${css.row} ${css.month_header}`}>
          {this.renderHeaders(weeks[0], weekdayFormat, culture)}
        </div>
        {weeks.map((week, idx) => this.renderWeek(week, idx))}
        {this.props.popup && this.renderOverlay()}
      </div>
    );
  }

  renderWeek = (week, weekIdx) => {
    let {
      components,
      selectable,
      titleAccessor,
      startAccessor,
      endAccessor,
      allDayAccessor,
      eventPropGetter,
      messages,
      selected,
      now,
      css,
    } = this.props;

    const { needLimitMeasure, rowLimit } = this.state;

    const eventsForWeek = this.eventsForWeek(week[0], week[week.length - 1]);
    eventsForWeek.sort((a, b) => this.eventFns.sortEvents(a, b, this.props));

    return (
      <DateContentRow
        key={weekIdx}
        ref={weekIdx === 0 ? 'slotRow' : undefined}
        container={this.getContainer}
        className={css.month_row}
        css={css}
        now={now}
        range={week}
        events={eventsForWeek}
        maxRows={rowLimit}
        selected={selected}
        selectable={selectable}
        messages={messages}
        titleAccessor={titleAccessor}
        startAccessor={startAccessor}
        endAccessor={endAccessor}
        allDayAccessor={allDayAccessor}
        eventPropGetter={eventPropGetter}
        renderHeader={this.readerDateHeading}
        renderForMeasure={needLimitMeasure}
        onShowMore={this.handleShowMore}
        onSelect={this.handleSelectEvent}
        onSelectSlot={this.handleSelectSlot}
        eventComponent={components.event}
        eventWrapperComponent={components.eventWrapper}
        dateCellWrapper={components.dateCellWrapper}
      />
    );
  };

  readerDateHeading = ({ date, className, ...props }) => {
    let {
      date: currentDate,
      getDrilldownView,
      dateFormat,
      culture,
      css,
    } = this.props;

    let isOffRange = this.dateFns.month(date) !== this.dateFns.month(currentDate);
    let isCurrent = this.dateFns.eq(date, currentDate, 'day');
    let drilldownView = getDrilldownView(date);
    let label = this.localizer.format(date, dateFormat, culture);

    return (
      <div
        {...props}
        className={cn(
          className,
          isOffRange && css.off_range,
          isCurrent && css.current,
        )}
      >
        {drilldownView
          ? <a
            href="#"
            onClick={e => this.handleHeadingClick(date, drilldownView, e)}
          >
            {label}
          </a>
          : <span>
              {label}
            </span>}
      </div>
    );
  };

  renderHeaders(row, format, culture) {
    const { css } = this.props;
    let first = row[0];
    let last = row[row.length - 1];
    let HeaderComponent = this.props.components.header || Header;
    const localizer = this.localizer;

    return this.dateFns.range(first, last, 'day').map((day, idx) => (
      <div
        key={'header_' + idx}
        className={cn(
          css.header,
          css.span_range1,
        )}
      >
        <HeaderComponent
          date={day}
          label={localizer.format(day, format, culture)}
          localizer={localizer}
          format={format}
          culture={culture}
        />
      </div>
    ));
  }

  renderOverlay() {
    let overlay = (this.state && this.state.overlay) || {};
    let { components } = this.props;

    return (
      <Overlay
        rootClose
        placement="bottom"
        container={this}
        show={!!overlay.position}
        onHide={() => this.setState({ overlay: null })}
      >
        <Popup
          {...this.props}
          eventComponent={components.event}
          eventWrapperComponent={components.eventWrapper}
          position={overlay.position}
          events={overlay.events}
          slotStart={overlay.date}
          slotEnd={overlay.end}
          onSelect={this.handleSelectEvent}
        />
      </Overlay>
    );
  }

  measureRowLimit() {
    this.setState({
      needLimitMeasure: false,
      rowLimit: this.refs.slotRow.getRowLimit(),
    });
  }

  handleSelectSlot = (range, slotInfo) => {
    this._pendingSelection = this._pendingSelection.concat(range);

    clearTimeout(this._selectTimer);
    this._selectTimer = setTimeout(() => this.selectDates(slotInfo));
  };

  handleHeadingClick = (date, view, e) => {
    e.preventDefault();
    this.clearSelection();
    notify(this.props.onDrillDown, [date, view]);
  };

  handleSelectEvent = (...args) => {
    this.clearSelection();
    notify(this.props.onSelectEvent, args);
  };

  handleShowMore = (events, date, cell, slot) => {
    const { popup, onDrillDown, onShowMore, getDrilldownView } = this.props;
    //cancel any pending selections so only the event click goes through.
    this.clearSelection();

    if (popup) {
      let position = getPosition(cell, findDOMNode(this));

      this.setState({
        overlay: { date, events, position },
      });
    } else {
      // || views.DAY
      notify(onDrillDown, [date, getDrilldownView(date)]);
    }

    notify(onShowMore, [events, date, slot]);
  };

  selectDates(slotInfo) {
    let slots = this._pendingSelection.slice();

    this._pendingSelection = [];

    slots.sort((a, b) => +a - +b);

    notify(this.props.onSelectSlot, {
      slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
    });
  }

  clearSelection() {
    clearTimeout(this._selectTimer);
    this._pendingSelection = [];
  }
}

// MonthView.navigate = (date, action) => {
//   switch (action) {
//     case navigate.PREVIOUS:
//       return dates.add(date, -1, 'month');
//
//     case navigate.NEXT:
//       return dates.add(date, 1, 'month');
//
//     default:
//       return date;
//   }
// };
//
// MonthView.range = (date, { culture }) => {
//   let start = dates.firstVisibleDay(date, culture);
//   let end = dates.lastVisibleDay(date, culture);
//   return { start, end };
// };

export default MonthView;
