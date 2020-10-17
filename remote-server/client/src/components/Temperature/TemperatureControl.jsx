
import { connect } from 'react-redux';
import React from 'react';
import { Card } from "components/Card/Card.jsx";
import {connectDataPeriodic} from 'components';
import { fetchCurrentTemperature, resetTemporaryTemperature, fetchTemporaryTemperature } from 'actions';
import Thermostat from './Thermostat';
import SetTemporaryTemperature from './SetTemporaryTemperature';


function toHHMMSS(sec_num) {
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}


class CurrentTemporaryTemperatureBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: ''
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => this.updateTime(), 1000);

    }
    componentWillUnmount() {
        this.interval = clearInterval(this.interval);
    }

    updateTime() {
        let date = new Date(this.props.start);
        let secondsLeft = Math.round(date.getTime() / 1000 + this.props.duration - Date.now() / 1000);
        this.setState({isSet: secondsLeft > 0, time: toHHMMSS(secondsLeft)});
    }

    render() {
        if(!this.state.isSet) return <React.Fragment></React.Fragment>;
        return <div className="row" style={{paddingTop: '5px',borderTop: '1px solid rgba(0,0,0,.1)',marginTop: '10px'}}>
            <p className="col-xs-12 category">Current setting</p>
            <div className="clearfix">
                <div style={{width:'auto',fontSize: 'large',paddingRight: '0px',lineHeight: '41px'}} className="col-xs-6">{this.state.time}</div>
                <div className="col-xs-6" style={{float: 'right', minWidth: '120px'}}>
                    <button type="button" onClick={()=>this.props.resetTemporaryTemperature(this.props.temperature)} className="btn-block btn btn-default btn-fill">Cancel</button>
                </div>
            </div>
        </div>
    }
}

let CurrentTemporaryTemperatureBlockConnected = connect(null, (dispatch, oldState) => Object.assign({}, oldState, {
    resetTemporaryTemperature: (currentTemperature) => dispatch(resetTemporaryTemperature(currentTemperature)),
}))(CurrentTemporaryTemperatureBlock);
CurrentTemporaryTemperatureBlockConnected = connectDataPeriodic(fetchTemporaryTemperature, x => x.temporaryTemperature, 60)(CurrentTemporaryTemperatureBlockConnected);


class TemperatureControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            commitTemperatureDialog: null,
        };
    }

    render() {
        const { temperature, userTemperature } = this.props;
        const targetTemperature = this.state.commitTemperatureDialog && this.state.commitTemperatureDialog.temperature || userTemperature;

        return <Card
                title="Temperature"
                category="Thermostat"
                content={
                    <React.Fragment>
                        <Thermostat 
                        onChange={temperature=>this.setState({commitTemperatureDialog:{temperature:temperature}})} 
                        targetTemperature={targetTemperature} 
                        ambientTemperature={temperature}></Thermostat>
                    <div className="clearfix">
                        <i onClick={()=>this.setState({commitTemperatureDialog:{temperature:targetTemperature + 0.5}})}
                            className="pe-7s-angle-up-circle" style={{fontSize: 'xxx-large', float: 'right',display: 'inline-block',position: 'relative'}}></i>
                        <i onClick={()=>this.setState({commitTemperatureDialog:{temperature:targetTemperature - 0.5}})}
                            className="pe-7s-angle-down-circle" style={{fontSize: 'xxx-large', float: 'left',display: 'inline-block',position: 'relative'}}></i>
                    </div>
                    {(!this.state.commitTemperatureDialog) && <CurrentTemporaryTemperatureBlockConnected />}
                    {this.state.commitTemperatureDialog && <SetTemporaryTemperature 
                        onCancel={() => this.setState({commitTemperatureDialog: null})}
                        onCommit={() => this.setState({commitTemperatureDialog: null})}
                        temperature={this.state.commitTemperatureDialog.temperature} />}
                    </React.Fragment>                    
                }
            />
    }
}

export default connectDataPeriodic(fetchCurrentTemperature, x =>  x.currentTemperature, 60)(TemperatureControl);
