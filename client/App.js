import {h, Component} from 'preact';
import Config from './Config';
import Log from './Log';
import {initDb, initializeApp, logRef, dbRef} from './firebaseDb';

initializeApp();

class App extends Component {
  constructor(props) {
    super();
    const {data} = props;
    this.state = {
      log: data ? data.log : [],
      config: data ? data.config : {}
    };

    this.onUpdate = this.onUpdate.bind(this);
    this.clearLog = this.clearLog.bind(this);
  }

  componentDidMount() {
    dbRef().on('value', this.onUpdate);
  }

  componentDidUnmount() {
    dbRef().off();
  }

  onUpdate(snapshot) {
    const {config, log} = snapshot.val();
    this.setState({config, log});
  }

  clearLog(e) {
    e.preventDefault();
    logRef().remove();
  }

  render(_p, state) {
    return (
      <main>
        <h1>Teebot</h1>
        <Config config={state.config} />
        <Log log={state.log} onClear={this.clearLog} />
      </main>
    );
  }
}

export default App;
