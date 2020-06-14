import React from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import Home from './Home.js';
import Admin from './Admin.js';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Route exact path="/" component={Home} />
          <Route exact path="/admin" component={Admin} />
        </div>
      </Router>
    </div>
  );
}

export default App;
