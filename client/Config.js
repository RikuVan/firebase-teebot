import {h} from 'preact';

const isBool = val => typeof val === 'boolean';

const Config = ({config}) => (
  <article>
    <h2>Config</h2>
    {config && (
      <ul>
        {Object.keys(config).map(prop => (
          <li>
            {prop}
            {': '}
            {isBool(config[prop]) ? config[prop].toString() : config[prop]}
          </li>
        ))}
      </ul>
    )}
  </article>
);

export default Config;
