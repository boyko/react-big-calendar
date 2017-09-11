import PropTypes from 'prop-types';
import React from 'react';
import EventRowMixin from './EventRowMixin';

class EventRow extends React.Component {
  static propTypes = {
    segments: PropTypes.array,
    css: PropTypes.shape({
      row: PropTypes.string,
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
    ...EventRowMixin.propTypes,
  };
  static defaultProps = {
    css: {
      row: 'rbc-row',
      span_range1: 'span_range_1',
      span_range2: 'span_range_2',
      span_range3: 'span_range_3',
      span_range4: 'span_range_4',
      span_range5: 'span_range_5',
      span_range6: 'span_range_6',
      span_range7: 'span_range_7',
    },
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
