"use strict";

import React from 'react'
import {apiPath} from "configuration";

class Authentication {
    constructor() {
        this._isAuthenticated = false;
        this._providers = [];
        this._isInitialized = false;
        this._initializeRequest = null;
    }

    authorizedFetch(path, options) {
        if(!this._isAuthenticated) {
            this.logout();
        }

        let headers = new Headers(options.headers);
        headers.set("Authorization", "Basic " + btoa(this._username + ":" + this._password));
        return fetch(path, Object.assign({}, options, {
            headers: headers,
        })).then((res) => {
            if(res.status === 401) {
                this.logout();
            }

            return res;
        })
    }

    logout() {
        this._isAuthenticated = false;
        localStorage.setItem("username", null);
        localStorage.setItem("password", null);
        this._updateProviders();
    }

    _initialize() {
        if(!this._isInitialized && !this._initializeRequest) {
            let username = localStorage.getItem("username");
            let password = localStorage.getItem("password");
            if(!username) {
                this._isInitialized = true;
            } else {
                this._initializeRequest = this.authenticate(username, password).then((result) => {
                    this._initializeRequest = null;
                    this._isInitialized = true;
                });
                return this._initializeRequest;
            }
        }
        return Promise.all([]);
    }

    _getState() {
        return {
            isAuthenticated: this._isAuthenticated,
            username: this._username,
        };
    }

    _updateProviders() {
        this._providers.forEach(x => {
            x.updateUserData(this._getState());
        });
    }

    async authenticate(username, password) {
        let headers=new Headers();
        headers.set("Authorization", "Basic " + btoa(username + ":" + password));
        let response = await fetch(apiPath + "/login", {
            cache: 'no-cache',
            mode: 'cors',
            method: 'post',
            headers: headers,
        });

        if(response.status === 200 && (await response.text()) == "valid") {
            this._username = username;
            this._password = password;
            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
            this._isAuthenticated = true;
            this._updateProviders();
            return true;
        }
        else if(response.status == 200 || response.status == 401) {
            return false;
        } else {
            throw Error(response.statusText);
        }
    }
}

var authentication = new Authentication();
export default authentication;

class AuthInfoProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = Object.assign(authentication._getState(), {
            ready: authentication._isInitialized,
        });

        this.updateUserData = this.updateUserData.bind(this);
    }

    componentDidMount() {
        authentication._providers.push(this);
        authentication._initialize().then(() => this.setState({ready: true}));
    }

    updateUserData(data) {
        this.setState(data);
    }

    componentWillUnmount() {
        authentication._providers = authentication._providers.filter(x => x != this);
    }

    render() {
        return <React.Fragment>{this.state.ready && this.props.children(this.state)}</React.Fragment>
    }
}

export { AuthInfoProvider };
