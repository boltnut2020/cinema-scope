import React from 'react';
import ReactDOM from 'react-dom';
import {Link, BrowserRouter, Route, Switch} from 'react-router-dom'

// import CinemaScope from './CinemaScope'
import About from './About'
import StageTest from './StageTest'
import Card from './Card'

const App = () => {
    return (
        <BrowserRouter>
        <React.Fragment>
          <nav className="navbar navbar-expand-md navbar-light bg-silver shadow-sm">
            <div className="container justify-content-start">
              <a className="navbar-brand" href="/">
                  シネスコツール
              </a>

              <div>
                <Link to="/" className="btn btn-dark">
                    フレーム
                </Link>

                <Link to="/card" className="btn btn-dark">
                    カード
                </Link>
              </div>
{/*
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
                  <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul className="navbar-nav mr-auto">
                      <li className="nav-item">
                        <Link to="/" className="nav-link">
                            フレーム
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/card" className="nav-link">
                            カード
                        </Link>
                      </li>
                  </ul>
                </div>
*/}
              </div>
            </nav>
            <main className="">
            <Switch>
                <Route path="/" exact component={StageTest} />
                <Route path="/stage-test" exact component={StageTest} />
                <Route path="/card" exact component={Card} />
            </Switch>
            </main>
        </React.Fragment>
        </BrowserRouter>
    )
}

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
