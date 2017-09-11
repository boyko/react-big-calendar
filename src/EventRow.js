import PropTypes from 'prop-types';
import React from 'react';
import EventRowMixin from './EventRowMixin';

class EventRow extends React.Component {
  static propTypes = {
    segments: PropTypes.array,
    css: PropTypes.object,
    ...EventRowMixin.propTypes,
  };
  static defaultProps = {
    ...EventRowMixin.defaultProps,
  };
  static contextTypes = {
    eventFns: PropTypes.object,
  };

  constructor(props, context) {
    super(props, context);

    this.EventRowMixin = EventRowMixin(context.eventFns);
  }

  render() {
    let { segments, css } = this.props;

    let lastEnd = 1;

    return (
      <div className={css.row}>
        {segments.reduce((row, { event, left, right, span }, li) => {
          let key = '_lvl_' + li;
          let gap = left - lastEnd;

          let content = this.EventRowMixin.renderEvent(this.props, event);

          if (gap)
            row.push(this.EventRowMixin.renderSpan(this.props, gap, key + '_gap'));

          row.push(this.EventRowMixin.renderSpan(this.props, span, key, content));

          lastEnd = right + 1;

          return row;
        }, [])}
      </div>
    );
  }
}

export default EventRow;
