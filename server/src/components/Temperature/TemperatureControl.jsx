import { connect } from 'react-redux';
import React from 'react';
import { Card } from "/components/Card/Card.jsx";
import {connectDataPeriodic} from 'components';
import { fetchCurrentTemperature } from 'actions';
import Thermostat from './Thermostat';
import SetTemporaryTemperature from './SetTemporaryTemperature';

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