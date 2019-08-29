import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";

export default function TemperaturePlan(props) {
    return <div className="card">
        <div className="content">
            <Row>
                <Col xs={5}>
                    <div className="icon-big text-center icon-warning">
                        <i className="pe-7s-server text-warning" />
                    </div>
                </Col>
                <Col xs={7}>
                    <div className="numbers">
                        <p>sdf</p>
                        sdf
                    </div>
                </Col>
            </Row>
            <div className="footer">
                <hr />
                <div className="stats">
                <i className="fa fa-refresh" /> updated now
            </div>
        </div>
        </div>
    </div>
}