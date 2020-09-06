import React from 'react';
import propTypes from 'prop-types';

export default class DataComponentPeriodic extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.fetch();
        this.timer = setInterval(() => this.fetch(), this.props.interval * 1000);
    }

    fetch() {
        return this.props.fetch();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }

    render() {
        return <React.Fragment>{this.props.resource.resource && this.props.children(this.props.resource.resource)}</React.Fragment>;
    }
}

DataComponentPeriodic.propTypes = {
    fetch: propTypes.func.isRequired,
    interval: propTypes.number,
    resource: propTypes.shape({
        loading: propTypes.bool,
        resource: propTypes.object,
    }),
};

DataComponentPeriodic.defaultProps = {
    interval: 60,
};