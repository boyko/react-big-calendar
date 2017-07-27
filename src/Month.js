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
};

class MonthView extends React.Component {
  static displayName = 'MonthView';
  static propTypes = propTypes;
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
    let { date, culture, weekdayFormat, className } = this.props,
      month = this.dateFns.visibleDays(date, culture),
      weeks = chunk(month, 7);

    this._weekCount = weeks.length;

    return (
      <div className={cn('rbc-month-view', className)}>
        <div className="rbc-row rbc-month-header">
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
    } = this.props;

    const { needLimitMeasure, rowLimit } = this.state;

    const eventsForWeek = this.eventsForWeek(week[0], week[week.length - 1]);
    eventsForWeek.sort((a, b) => this.eventFns.sortEvents(a, b, this.props));

    return (
      <DateContentRow
        key={weekIdx}
        ref={weekIdx === 0 ? 'slotRow' : undefined}
        container={this.getContainer}
        className="rbc-month-row"
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
          isOffRange && 'rbc-off-range',
          isCurrent && 'rbc-current',
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
    let first = row[0];
    let last = row[row.length - 1];
    let HeaderComponent = this.props.components.header || Header;
    const localizer = this.localizer;

    return this.dateFns.range(first, last, 'day').map((day, idx) => (
      <div key={'header_' + idx} className="rbc-header" style={this.eventFns.segStyle(1, 7)}>
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
