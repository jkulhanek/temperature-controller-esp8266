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

export function Card(props) {
    return (
      <div className={"card" + (props.plain ? " card-plain" : "")}>
        <div className={"header" + (props.hCenter ? " text-center" : "")}>
          <h4 className="title">{props.title}</h4>
          <p className="category">{props.category}</p>
        </div>
        {!props.overlay && <div
          className={
            "content" +
            (props.ctAllIcons ? " all-icons" : "") +
            (props.ctTableFullWidth ? " table-full-width" : "") +
            (props.ctTableResponsive ? " table-responsive" : "") +
            (props.ctTableUpgrade ? " table-upgrade" : "")
          }

          style={props.overlay && {opacity:0} || {}}
        >
          {props.content}

          <div className="footer">
            {props.legend}
            {props.stats != null ? <hr /> : ""}
            <div className="stats">
              <i className={props.statsIcon} /> {props.stats}
            </div>
          </div>
        </div>}
          {props.overlay && <div className="dialog">
            {props.overlay}
            </div>}
      </div>
    );
}

export default Card;
