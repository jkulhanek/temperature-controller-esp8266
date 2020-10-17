import React from 'react';
import { connect } from 'react-redux';
import DataComponentPeriodic from './DataComponent/DataComponentPeriodic';

export function connectDataPeriodic(fetchAction, mapResource, interval) {
    if(!interval) {
        interval = DataComponentPeriodic.defaultProps.interval;
    }

    return (Component) => {
        function DynamicComponent(props) {
            return <DataComponentPeriodic {...props} interval={interval}>{(props) => {
                return <Component {...(props || {})} />
            }}</DataComponentPeriodic>
        }

        return connect((state, ownProps) => Object.assign({}, ownProps, {
            resource: mapResource(state),
        }), (dispatch, ownState) => Object.assign({}, ownState, {
            fetch: () => dispatch(fetchAction()),
        }))(DynamicComponent);
    };
}