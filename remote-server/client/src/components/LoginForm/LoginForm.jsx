import React from 'react';
import "./LoginForm.css";
import authentication from 'authentication';
import { Redirect } from 'react-router-dom';

export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            error: null,
            isAuthenticated: false,
        }
    }

    async login(e) {
        e.preventDefault();
        if(await authentication.authenticate(this.state.username, this.state.password)) {
            this.setState({
                isAuthenticated: true,
            });
        } else {
            this.setState({
                isAuthenticated: false,
                error: "Invalid username or password",
            })
        }
    }

    render() {
        if(this.state.isAuthenticated) {
            return <Redirect to="/" />
        }

        return <div className="login-form">
            <form>
                <h2 className="text-center">Log in</h2>       
                <div className="form-group">
                    <input type="text" className="form-control" onChange={(e) => this.setState({error: null, username: e.target.value})} value={this.state.username} placeholder="Username" required="required" autoComplete="off" />
                </div>
                <div className="form-group">
                    <input type="password" className="form-control" onChange={(e) => this.setState({error: null, password: e.target.value})} value={this.state.password} placeholder="Password" required="required" autoComplete="off" />
                </div>
                <div className="form-group">
                    {
                        this.state.error && <span style={{color:"red"}}>{this.state.error}</span>
                    }
                    <button type="submit" onClick={(e) => this.login(e)} className="btn btn-primary btn-block">Log in</button>
                </div>      
            </form>
        </div>
    }
}