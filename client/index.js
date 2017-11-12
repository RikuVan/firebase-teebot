import {h, render} from 'preact';
import App from './App';
import './styles.scss';

const data = window.__data__;

render(
  <App data={data} />,
  document.querySelector('body'),
  document.getElementById('app')
);

