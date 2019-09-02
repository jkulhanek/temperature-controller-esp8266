import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from './reducers'
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
import thunk from 'redux-thunk'

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/sass/light-bootstrap-dashboard-react.scss";
import "./assets/css/demo.css";
import "./assets/css/pe-icon-7-stroke.css";

import AdminLayout from "./layouts/Admin.jsx";
import LoginForm from "components/LoginForm/LoginForm";
import { AuthInfoProvider } from 'authentication';

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

ReactDOM.render(
  <AuthInfoProvider>{({isAuthenticated}) =>
    <Provider store={store}>
      <HashRouter>
        <Switch>
          <Route exact path="/login">
            <LoginForm />
          </Route>
          <Route exact path="/">
            <Redirect to="/portal" />
          </Route>
          <Route path="/" render={props => isAuthenticated ? <AdminLayout {...props} /> : <Redirect to="/login" />} />
        </Switch>
      </HashRouter>
    </Provider>
  }</AuthInfoProvider>, document.getElementById('root'));
