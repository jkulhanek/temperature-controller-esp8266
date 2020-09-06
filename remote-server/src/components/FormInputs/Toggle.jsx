import React from 'react';
import PropTypes from 'prop-types';
export default function Toggle(props) {
    return <label className="el-switch">
        <input type="checkbox" 
            name={props.name} 
            checked={props.checked}
            value="on"
            onChange={(e) => props.onChange && props.onChange({ checked: e.target.checked })} />
        <span className="el-switch-style"></span>
    </label>
}

Toggle.propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    checked: PropTypes.bool,
};

Toggle.defaultProps = {
    name: "toggle",
    checked: false,
}