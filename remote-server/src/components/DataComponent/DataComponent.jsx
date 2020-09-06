import React from 'react';
import propTypes from 'prop-types';

export default class DataComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetch();
    }

    render() {
        return <React.Fragment>{this.props.children(this.props.resource.resource, this.props.resource.loading)}</React.Fragment>;
    }
}

DataComponent.propTypes = {
    fetch: propTypes.func.isRequired,
    resource: propTypes.shape({
        loading: propTypes.bool,
        resource: propTypes.object,
    }),
};