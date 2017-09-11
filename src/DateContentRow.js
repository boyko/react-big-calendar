import cn from 'classnames';
import getHeight from 'dom-helpers/query/height';
import qsa from 'dom-helpers/query/querySelectorAll';
import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';

// import dates from './utils/dates';
import { accessor, elementType } from './utils/propTypes';
// import { segStyle, eventSegments, endOfRange, eventLevels } from './utils/eventLevels';
// import BackgroundCells from './BackgroundCells';
import EventRow from './EventRow';
import EventEndingRow from './EventEndingRow';

let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot;

const propTypes = {
  events: PropTypes.array.isRequired,
  range: PropTypes.array.isRequired,

  rtl: PropTypes.bool,
  renderForMeasure: PropTypes.bool,
  renderHeader: PropTypes.func,

  container: PropTypes.func,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),

  onShowMore: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,

  now: PropTypes.instanceOf(Date),
  startAccessor: accessor.isRequired,
  endAccessor: accessor.isRequired,

  dateCellWrapper: elementType,
  eventComponent: elementType,
  eventWrapperComponent: elementType.isRequired,
  minRows: PropTypes.number.isRequired,
  maxRows: PropTypes.number.isRequired,
  css: PropTypes.shape({
    date_cell: PropTypes.string,
    now: PropTypes.string,
    row_content: PropTypes.string,
    row: PropTypes.string,
    row_segment: PropTypes.string,
    event: PropTypes.string,
    event_content: PropTypes.string,
    background_cells: PropTypes.shape({
      row_bg: PropTypes.string,
      day_bg: PropTypes.string,
      selected_cell: PropTypes.string,
      today: PropTypes.string,
    }),
    event_row: PropTypes.shape({
      row: PropTypes.string,
      span_range1: PropTypes.string,
      span_range2: PropTypes.string,
      span_range3: PropTypes.string,
      span_range4: PropTypes.string,
      span_range5: PropTypes.string,
      span_range6: PropTypes.string,
      span_range7: PropTypes.string,
    }),
  }),
};

const defaultProps = {
  minRows: 0,
  maxRows: Infinity,
  css: {
    date_cell: 'rbc-date-cell',
    now: 'rbc-now',
    row_content: 'rbc-row-content',
    row: 'rbc-row',
    row_segment: 'rbc-row-segment',
    event: 'rbc-event',
    event_content: 'rbc-event-content',
    background_cells: {
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
    },
    event_row: {
      row: 'rbc-row',
      span_range1: 'span_range_1',
      span_range2: 'span_range_2',
      span_range3: 'span_range_3',
      span_range4: 'span_range_4',
      span_range5: 'span_range_5',
      span_range6: 'span_range_6',
      span_range7: 'span_range_7',
    },
  },
};

class DateContentRow extends React.Component {
  static propTypes = propTypes;
  static defaultProps = defaultProps;
  static contextTypes = {
    localizer: PropTypes.object,
    dateFns: PropTypes.object,
    eventFns: PropTypes.object,
  };

  constructor(...args) {
    super(...args);

    this.localizer = this.context.localizer;
    this.dateFns = this.context.dateFns;
    this.eventFns = this.context.eventFns;
  }

  handleSelectSlot = (slot) => {
    const { range, onSelectSlot } = this.props;

    onSelectSlot(
      range.slice(slot.start, slot.end + 1),
      slot,
    );
  };

  handleShowMore = (slot) => {
    const { range, onShowMore } = this.props;
    let row = qsa(findDOMNode(this), '.rbc-row-bg')[0];

    let cell;
    if (row) cell = row.children[slot - 1];

    let events = this.segments
      .filter(seg => isSegmentInSlot(seg, slot))
      .map(seg => seg.event);

    onShowMore(events, range[slot - 1], cell, slot);
  };

  createHeadingRef = r => {
    this.headingRow = r;
  };

  createEventRef = r => {
    this.eventRow = r;
  };

  getContainer = () => {
    const { container } = this.props;
    return container ? container() : findDOMNode(this);
  };

  getRowLimit() {
    let eventHeight = getHeight(this.eventRow);
    let headingHeight = this.headingRow ? getHeight(this.headingRow) : 0;
    let eventSpace = getHeight(findDOMNode(this)) - headingHeight;

    return Math.max(Math.floor(eventSpace / eventHeight), 1);
  }

  renderHeadingCell = (date, index) => {
    let { renderHeader, range, css } = this.props;

    return renderHeader({
      date,
      key: `header_${index}`,
      // style: this.eventFns.segStyle(1, range.length),
      className: cn(
        css.date_cell,
        css.span_range1,
        this.dateFns.eq(date, this.props.now, 'day') && css.now, // FIXME use props.now
      ),
    });
  };

  renderDummy = () => {
    let { className, range, renderHeader, css } = this.props;
    return (
      <div className={className}>
        <div className={css.row_content}>
          {renderHeader && (
            <div className={css.now} ref={this.createHeadingRef}>
              {range.map(this.renderHeadingCell)}
            </div>
          )}
          <div className={css.row} ref={this.createEventRef}>
            <div
              className={cn(
                css.row_segment,
                css.span_range1,
              )}

              // style={this.eventFns.segStyle(1, range.length)}
            >
              <div className={css.event}>
                <div className={css.event_content}>&nbsp;</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {
      rtl,
      events,
      range,
      className,
      selectable,
      renderForMeasure,
      startAccessor,
      endAccessor,
      renderHeader,
      minRows, maxRows,
      dateCellWrapper,
      eventComponent,
      eventWrapperComponent,
      onSelectStart,
      onSelectEnd,
      ...props
    } = this.props;

    const { css } = this.props;

    if (renderForMeasure)
      return this.renderDummy();

    let { first, last } = this.eventFns.endOfRange(range);

    let segments = this.segments = events.map(evt => this.eventFns.eventSegments(evt, first, last, {
      startAccessor,
      endAccessor,
    }));

    let { levels, extra } = this.eventFns.eventLevels(segments, Math.max(maxRows - 1, 1));
    while (levels.length < minRows) levels.push([]);

    // TODO: classname
    return (
      <div className={className}>
        {/*<BackgroundCells*/}
        {/*rtl={rtl}*/}
        {/*css={css.background_cells}*/}
        {/*range={range}*/}
        {/*selectable={selectable}*/}
        {/*container={this.getContainer}*/}
        {/*onSelectStart={onSelectStart}*/}
        {/*onSelectEnd={onSelectEnd}*/}
        {/*onSelectSlot={this.handleSelectSlot}*/}
        {/*cellWrapperComponent={dateCellWrapper}*/}
        {/*/>*/}

        <div className={css.row_content}>
          {renderHeader && (
            <div className={css.row} ref={this.createHeadingRef}>
              {range.map(this.renderHeadingCell)}
            </div>
          )}
          {levels.map((segs, idx) =>
            <EventRow
              {...props}
              css={css.event_row}
              key={idx}
              start={first}
              end={last}
              segments={segs}
              slots={range.length}
              eventComponent={eventComponent}
              eventWrapperComponent={eventWrapperComponent}
              startAccessor={startAccessor}
              endAccessor={endAccessor}
            />,
          )}
          {!!extra.length && (
            <EventEndingRow
              {...props}
              css={css.event_row}
              start={first}
              end={last}
              segments={extra}
              onShowMore={this.handleShowMore}
              eventComponent={eventComponent}
              eventWrapperComponent={eventWrapperComponent}
            />
          )}
        </div>
      </div>
    );
  }
}

DateContentRow.propTypes = propTypes;
DateContentRow.defaultProps = defaultProps;

export default DateContentRow;
