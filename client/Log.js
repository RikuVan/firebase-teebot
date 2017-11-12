import {h} from 'preact';

const Log = ({log, onClear}) => (
  <article>
    <h2>Log</h2>
    {log && (
      <button className="log-button" onClick={onClear} disabled={!log}>
        CLEAR LOG
      </button>
    )}
    {log ? (
      <ul>
        {Object.keys(log)
          .reverse()
          .map(id => (
            <li>
              <pre>{JSON.stringify(log[id], null, 2)}</pre>
            </li>
          ))}
      </ul>
    ) : (
      <p>No items</p>
    )}
  </article>
);

export default Log;
