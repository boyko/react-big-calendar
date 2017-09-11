import PropTypes from 'prop-types';
import React from 'react';
import cn from 'classnames';
// import dates from './utils/dates';
import { accessor, elementType } from './utils/propTypes';
import { accessor as get } from './utils/accessors';

let propTypes = {
  event: PropTypes.object.isRequired,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.instanceOf(Date),

  selected: PropTypes.bool,
  eventPropGetter: PropTypes.func,
  titleAccessor: accessor,
  allDayAccessor: accessor,
  startAccessor: accessor,
  endAccessor: accessor,

  eventComponent: elementType,
  eventWrapperComponent: elementType.isRequired,
  onSelect: PropTypes.func,
  css: PropTypes.shape({
    event: PropTypes.string,
    selected: PropTypes.string,
    allday: PropTypes.string,
    continues_prior: PropTypes.string,
    continues_after: PropTypes.string,
    content: PropTypes.string,
  }),
};

const defaultProps = {
  css: {
    event: 'rbc-event',
    selected: 'rbc-selected',
    allday: 'rbc-event-allday',
    continues_prior: 'rbc-event-continues-prior',
    continues_after: 'rbc-event-continues-after',
    content: 'rbc-event-content',
  },
};

class EventCell extends React.Component {
  static propTypes = propTypes;
  static defaultProps = defaultProps;
  static contextTypes = {
    eventFns: PropTypes.object,
    dateFns: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);
    this.dateFns = this.context.dateFns;
    this.eventFns = this.context.eventFns;
  }

  render() {
    let {
      className,
      event,
      selected,
      eventPropGetter,
      startAccessor,
      endAccessor,
      titleAccessor,
      slotStart,
      slotEnd,
      onSelect,
      eventComponent: Event,
      eventWrapperComponent: EventWrapper,
      css,
      ...props
    } = this.props;

    let title = get(event, titleAccessor)
      , end = get(event, endAccessor)
      , start = get(event, startAccessor)
      , isAllDay = get(event, props.allDayAccessor)
      , continuesPrior = this.dateFns.lt(start, slotStart, 'day')
      , continuesAfter = this.dateFns.gt(end, slotEnd, 'day');

    if (eventPropGetter)
      var { style, className: xClassName } = eventPropGetter(event, start, end, selected);

    return (
      <EventWrapper event={event}>
        <div
          style={{ ...props.style, ...style }}
          className={cn(css.event, className, xClassName, {
            [css.selected]: selected,
            [css.allday]: isAllDay || this.dateFns.diff(start, this.dateFns.ceil(end, 'day'), 'day') > 1,
            [css.continues_prior]: continuesPrior,
            [css.continues_after]: continuesAfter,
          })}
          onClick={(e) => onSelect(event, e)}
        >
          <div className={css.content} title={title}>
            {Event
              ? <Event event={event} title={title} />
              : title
            }
          </div>
        </div>
      </EventWrapper>
    );
  }
}

EventCell.propTypes = propTypes;

export default EventCell;
