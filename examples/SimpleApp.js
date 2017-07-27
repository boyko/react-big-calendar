import React from 'react';
import { render } from 'react-dom';
import Basic from './demos/basic';
import 'react-big-calendar/lib/less/styles.less';
import './styles.less';
import './prism.less';


const Example = () => (
  <Basic />
);

render(<Example />, document.getElementById('root'));
