import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';
import EventCell from './EventCell';
import getHeight from 'dom-helpers/query/height';
import { accessor, elementType } from './utils/propTypes';
// import { segStyle } from './utils/eventLevels';
import { isSelected } from './utils/selection';

/* eslint-disable react/prop-types */

export default function (eventFns) {
  return {
    propTypes: {
      slots: PropTypes.number.isRequired,
      end: PropTypes.instanceOf(Date),
      start: PropTypes.instanceOf(Date),

      selected: PropTypes.object,
      eventPropGetter: PropTypes.func,
      titleAccessor: accessor,
      allDayAccessor: accessor,
      startAccessor: accessor,
      endAccessor: accessor,

      eventComponent: elementType,
      eventWrapperComponent: elementType.isRequired,
      onSelect: PropTypes.func,
      css: PropTypes.shape({
        row: PropTypes.string,
        eventCell: PropTypes.shape({
          event: PropTypes.string,
          selected: PropTypes.string,
          allday: PropTypes.string,
          continues_prior: PropTypes.string,
          continues_after: PropTypes.string,
          content: PropTypes.string,
          span_range1: PropTypes.string,
          span_range2: PropTypes.string,
          span_range3: PropTypes.string,
          span_range4: PropTypes.string,
          span_range5: PropTypes.string,
          span_range6: PropTypes.string,
          span_range7: PropTypes.string,
        }),
      }),
    },

    defaultProps: {
      segments: [],
      selected: {},
      slots: 7,
      css: {
        row: 'rbc-row-segment',
        eventCell: {
          event: 'rbc-event',
          selected: 'rbc-selected',
          allday: 'rbc-event-allday',
          continues_prior: 'rbc-event-continues-prior',
          continues_after: 'rbc-event-continues-after',
          content: 'rbc-event-content',
          span_range1: 'span_range_1',
          span_range2: 'span_range_2',
          span_range3: 'span_range_3',
          span_range4: 'span_range_4',
          span_range5: 'span_range_5',
          span_range6: 'span_range_6',
          span_range7: 'span_range_7',
        },
      },
    },

    renderEvent(props, event) {
      let {
        eventPropGetter, selected, start,
        end,
        startAccessor,
        endAccessor,
        titleAccessor,
        allDayAccessor,
        eventComponent,
        eventWrapperComponent,
        onSelect,
      } = props;

      return (
        <EventCell
          event={event}
          eventWrapperComponent={eventWrapperComponent}
          eventPropGetter={eventPropGetter}
          onSelect={onSelect}
          selected={isSelected(event, selected)}
          startAccessor={startAccessor}
          endAccessor={endAccessor}
          titleAccessor={titleAccessor}
          allDayAccessor={allDayAccessor}
          slotStart={start}
          slotEnd={end}
          eventComponent={eventComponent}
        />
      );
    },

    renderSpan(props, len, key, content = ' ') {
      let { slots, css } = props;

      return (
        <div
          key={key}
          className={cn(
            css.row,
            css[`span_range${Math.abs(len)}`],
          )}

          // style={eventFns.segStyle(Math.abs(len), slots)}
        >
          {content}
        </div>
      );
    },

    getRowHeight() {
      getHeight(findDOMNode(this));
    },
  };
}
