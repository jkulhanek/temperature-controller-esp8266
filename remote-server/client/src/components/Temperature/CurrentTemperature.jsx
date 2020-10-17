import { connect } from 'react-redux';
import React from 'react';
import DataComponentPeriodic from 'components/DataComponent/DataComponentPeriodic';
import {connectDataPeriodic} from 'components';
import { fetchCurrentTemperature } from 'actions';

function CurrentTemperature(props) {
    const { temperature } = props;
    return <React.Fragment>temperature: {temperature}</React.Fragment>
}

export default connectDataPeriodic(fetchCurrentTemperature, x => x.currentTemperature, 60)(CurrentTemperature);