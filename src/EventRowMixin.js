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
      css: PropTypes.object,
    },

    defaultProps: {
      segments: [],
      selected: {},
      slots: 7,
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
          css={props.css}
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
