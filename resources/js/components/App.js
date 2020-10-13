import React from 'react';
import ReactDOM from 'react-dom';
import {Link, BrowserRouter, Route, Switch} from 'react-router-dom'

import CinemaScope from './CinemaScope'
import About from './About'

const App = () => {
    return (
        <BrowserRouter>
        <React.Fragment>
          <nav className="navbar navbar-expand-md navbar-light bg-white shadow-sm">
            <div className="container">
              <a className="navbar-brand" href="{{ url('/') }}">
                  CinemaScope
              </a>

              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
                  <span class="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarSupportedContent">

                  <ul className="navbar-nav mr-auto">
                      <li className="nav-item">
                        <Link to="/" className="nav-link">
                            Top
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/about" className="nav-link">
                            About
                        </Link>
                      </li>
                  </ul>
                </div>
             </div>
            </nav>
            <main class="py-4">
            <Switch>
                <Route path="/" exact component={CinemaScope} />
            </Switch>
            </main>
        </React.Fragment>
        </BrowserRouter>
    )
}

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
