/*!

=========================================================
* Light Bootstrap Dashboard React - v1.3.0
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component } from "react";
import { connect } from "react-redux";
import { Grid, Row, Col } from "react-bootstrap";

import { Card } from "/components/Card/Card.jsx";
import TemperatureControl from "components/Temperature/TemperatureControl";
import TemperaturePlanUploader from "components/Temperature/TemperaturePlanUploader";
import Toggle from "components/FormInputs/Toggle";
import { putState, fetchState } from "actions";
import DataComponent from "components/DataComponent/DataComponent";

class Portal extends Component {
  createLegend(json) {
    var legend = [];
    for (var i = 0; i < json["names"].length; i++) {
      var type = "fa fa-circle text-" + json["types"][i];
      legend.push(<i className={type} key={i} />);
      legend.push(" ");
      legend.push(json["names"][i]);
    }
    return legend;
  }
  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col lg={3} sm={6}>
              <TemperatureControl />              
            </Col>
            <Col lg={6} sm={6}>
              <Card
                title="Current Plan"
                statsIcon=""
                category="Upload or download current plan"
                content={
                  <TemperaturePlanUploader />
                }
              />
            </Col>
            <Col lg={3} sm={6}>
              <DataComponent fetch={this.props.getIsOn} resource={this.props.isOn}>{
                (resource, loading) => <Card
                statsIcon="fa fa-clock-o"
                title="Status"
                category={(resource && resource.isOn ? "Running" : "Stopped")}
                content={
                  <Toggle 
                    checked={resource && resource.isOn} 
                    disabled={!loading}
                    onChange={(e) => { this.props.setIsOn(e.checked); }} />
                }
              />}
              </DataComponent>              
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default connect((state, oldProps) => Object.assign({}, oldProps, {
  isOn: state.state,
}), (dispatch, oldProps) => Object.assign({}, oldProps, {
  setIsOn: (value) => dispatch(putState(value)),
  getIsOn: () => dispatch(fetchState())
}))(Portal);
