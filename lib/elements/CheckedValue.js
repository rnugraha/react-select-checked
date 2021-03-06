/**
 * Copyright (c) 2017 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */

import React from 'react';
import PropTypes from 'prop-types'

class CheckedValue extends React.Component {
    render() {
        return null;
    }
}

CheckedValue.propTypes = {
        children: PropTypes.node,
        disabled: PropTypes.bool,               // disabled prop passed to ReactSelect
        id: PropTypes.string,                   // Unique id for the value - used for aria
        value: PropTypes.object.isRequired,     // the option object for this value
};

export default CheckedValue;
