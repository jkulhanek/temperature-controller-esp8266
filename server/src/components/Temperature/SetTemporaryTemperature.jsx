import { putTemporaryTemperature } from 'actions';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import Button from 'components/CustomButton/CustomButton'

class SetTemporaryTemperature extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            duration: "7200",
        }
    }

    commit() {
        this.props.onCommit && this.props.onCommit();
        this.props.setTemporaryTemperature(this.props.temperature, parseInt(this.state.duration));
    }

    render() {
        return <React.Fragment><Row>
            <Col xs={12}>
                <div className="form-group">
                    <label className="control-label">Duration</label>
                    <select className="form-control" value={this.state.duration} onChange={(e) => this.setState({duration: e.target.value})}>
                        <option value="3600">1 hour</option>
                        <option value="7200">2 hours</option>
                        <option value="10800">3 hours</option>
                        <option value="18000">5 hours</option>
                        <option value="28800">8 hours</option>
                        <option value="43200">12 hours</option>
                    </select>
                </div>                        
            </Col>
        </Row><Row>
            <Col xs={6}>
                <Button bsStyle="danger" block fill type="submit" onClick={() => this.props.onCancel && this.props.onCancel()}>Cancel</Button>
            </Col>
            <Col xs={6}>
                <Button bsStyle="default" block fill type="submit" disabled={!this.state.duration} onClick={() => this.commit()}>Set Up</Button>
            </Col>
        </Row></React.Fragment>
    }
}

const SetTemporaryTemperatureConnected = connect(null, (dispatch, oldState) => Object.assign({}, oldState, {
    setTemporaryTemperature: (t, d) => dispatch(putTemporaryTemperature(t, d)),
}))(SetTemporaryTemperature);
export default SetTemporaryTemperatureConnected;

SetTemporaryTemperatureConnected.propTypes = {
    temperature: PropTypes.number.isRequired,
    onCancel: PropTypes.func,
}

