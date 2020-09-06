import { downloadExcel, readExcelFile } from 'logic/plan';
import Button from 'components/CustomButton/CustomButton'
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { putCurrentPlan, fetchCurrentPlan } from 'actions';
import DataComponent from 'components/DataComponent/DataComponent';
import { Row, Col } from 'react-bootstrap';
import TemperaturePlan from './TemperaturePlan';

class TemperaturePlanUploader extends React.Component {
    constructor(props) {
        super(props);
    }

    readExcel(file) {
        var reader = new FileReader();

        reader.onload = async (e) => {
            var data = e.target.result;
            let plan = await readExcelFile(data, file.name);
            if(this.props.onChange) {
                console.log(plan);
                this.props.onChange(plan);
            }
        };

        reader.onerror = function(ex) {
            console.log(ex);
        };

        reader.readAsArrayBuffer(file);
    }

    render() {
        return <DataComponent fetch={this.props.fetch} resource={this.props.resource}>{(resource, loading) =>
            <React.Fragment><Row>
                <Col sm={6}>
                    <Button disabled={loading} block onClick={() => downloadExcel({ name: "empty", temperatures: resource && resource.temperatures})}>Download</Button>
                </Col>
                <Col sm={6}>
                    <label className="btn btn-default btn-fill btn-block">Upload <input type="file" name="files[]" onChange={(e) => this.readExcel(e.target.files[0])} style={{display: "none"}}/></label>
                </Col>
            </Row>{resource && <TemperaturePlan temperatures={resource.temperatures } />}
            </React.Fragment>
        }</DataComponent>
        
    }
}

TemperaturePlanUploader.propTypes = {
    onChange: PropTypes.func,
    plan: PropTypes.any,
};

const TemperaturePlanUploaderConnected = connect((state, oldProps) => Object.assign({}, oldProps, {
    resource: state.currentPlan,
}), (dispatch, oldProps) => Object.assign({}, oldProps, {
    onChange: (plan) => dispatch(putCurrentPlan(plan)),
    fetch: () => dispatch(fetchCurrentPlan()),
}))(TemperaturePlanUploader);
export default TemperaturePlanUploaderConnected;