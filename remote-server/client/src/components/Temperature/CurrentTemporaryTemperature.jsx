import React from 'react';

class CurrentTemporaryTemperature extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }
    componentWillUnmount() {
    }
    render() {
        return <div className="row" style={{paddingTop: '5px',borderTop: '1px solid rgba(0,0,0,.1)',marginTop: '10px'}}>
            <p className="col-xs-12 category">Current setting</p>
            <div className="clearfix">
                <div style={{width:'auto',fontSize: 'large',paddingRight: '0px',lineHeight: '41px'}} className="col-xs-6">18:55</div>
                <div className="col-xs-6" style={{float: 'right', minWidth: '120px'}}>
                    <button type="button" className="btn-block btn btn-default btn-fill">Cancel</button>
                </div>
            </div>
        </div>
    }
}

export default CurrentTemporaryTemperature
