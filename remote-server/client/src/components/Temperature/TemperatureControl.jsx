import { connect } from 'react-redux';
import React from 'react';
import { Card } from "components/Card/Card.jsx";
import {connectDataPeriodic} from 'components';
import { fetchCurrentTemperature } from 'actions';
import Thermostat from './Thermostat';
import SetTemporaryTemperature from './SetTemporaryTemperature';
//p
//                    <i onClick={()=>this.setState({commitTemperatureDialog:{temperature:userTemperature + 0.5}})}
//                        className="pe-7s-angle-up-circle" style="font-size: xxx-large;float: right;display: inline-block;position: relative;"></i>

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
                    {(!this.state.commitTemperatureDialog) &&  <React.Fragment>
                    <div className="clearfix">
                        <i onClick={()=>this.setState({commitTemperatureDialog:{temperature:targetTemperature + 0.5}})}
                            className="pe-7s-angle-up-circle" style={{fontSize: 'xxx-large', float: 'right',display: 'inline-block',position: 'relative'}}></i>
                        <i onClick={()=>this.setState({commitTemperatureDialog:{temperature:targetTemperature - 0.5}})}
                            className="pe-7s-angle-down-circle" style={{fontSize: 'xxx-large', float: 'left',display: 'inline-block',position: 'relative'}}></i>
                    </div></React.Fragment>}
                        {this.state.commitTemperatureDialog && <SetTemporaryTemperature 
                            onCancel={() => this.setState({commitTemperatureDialog: null})}
                            onCommit={() => this.setState({commitTemperatureDialog: null})}
                            temperature={this.state.commitTemperatureDialog.temperature} />}
                    </React.Fragment>                    
                }
            />
    }
}

export default connectDataPeriodic(fetchCurrentTemperature, x => x.currentTemperature, 60)(TemperatureControl);
