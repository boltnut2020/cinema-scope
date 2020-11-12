import React from 'react';
import ReactDOM from 'react-dom';
import {Link, BrowserRouter, Route, Switch} from 'react-router-dom'

// import CinemaScope from './CinemaScope'
import Frame from './Frame'
import Card from './Card'
import About from './About'

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

                <Link to="/card" className="btn btn-dark ml-2">
                    カード
                </Link>
              </div>
              </div>
          </nav>
          <main className="">
            <Switch>
                <Route path="/" exact component={Frame} />
                <Route path="/frame" exact component={Frame} />
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
