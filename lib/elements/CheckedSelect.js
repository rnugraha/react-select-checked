/**
 * Copyright (c) 2017 The Hyve B.V.
 * This code is licensed under the GNU General Public License,
 * version 3, or (at your option) any later version.
 */

import React from 'react';
import PropTypes from 'prop-types'
import Select from "react-select";
import classNames from 'classnames';
import CheckedOption from './CheckedOption';
import CheckedValue from './CheckedValue';
import OptionTools from './OptionTools';
import stripDiacritics from './stripDiacritics';

import 'react-select/dist/react-select.css';

class CheckedSelect extends React.Component {

    // constructor
    constructor(props, context) {
        super(props, context);

        this.handleFilterOptions = this.handleFilterOptions.bind(this);
        this.toggleSelection = this.toggleSelection.bind(this);
        this.clearVisibleOptions = this.clearVisibleOptions.bind(this);
        this.getResetValue = this.getResetValue.bind(this);
        this.setValue = this.setValue.bind(this);
        this.handleAddAll = this.handleAddAll.bind(this);
        this.handleClearAll = this.handleClearAll.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
        this.getSelectComponent = this.getSelectComponent.bind(this);
        this.getSelectAsyncComponent = this.getSelectAsyncComponent.bind(this);
    }

    /**
     * Custom filter options when user type filter in input value
     * @param options
     * @param filterValue
     * @param currentValue
     * @returns {*}
     */
    handleFilterOptions (options, filterValue, currentValue) {

        this._options = options;

        if (this.props.value.length) {
            currentValue = this.props.value;
        }

        if (this.props.ignoreAccents) {
            filterValue = stripDiacritics(filterValue);
        }

        if (this.props.ignoreCase) {
            filterValue = filterValue.toLowerCase();
        }

        if (currentValue) currentValue = currentValue.map(i => i[this.props.valueKey]);
        this._visibleOptions = options.filter(option => {

            if (!filterValue) return true;
            let valueTest = String(option[this.props.valueKey]);
            let labelTest = String(option[this.props.labelKey]);
            if (this.props.ignoreAccents) {
                if (this.props.matchProp !== 'label') valueTest = stripDiacritics(valueTest);
                if (this.props.matchProp !== 'value') labelTest = stripDiacritics(labelTest);
            }
            if (this.props.ignoreCase) {
                if (this.props.matchProp !== 'label') valueTest = valueTest.toLowerCase();
                if (this.props.matchProp !== 'value') labelTest = labelTest.toLowerCase();
            }
            return this.props.matchPos === 'start' ? (
                (this.props.matchProp !== 'label' && valueTest.substr(0, filterValue.length) === filterValue) ||
                (this.props.matchProp !== 'value' && labelTest.substr(0, filterValue.length) === filterValue)
            ) : (
                (this.props.matchProp !== 'label' && valueTest.indexOf(filterValue) >= 0) ||
                (this.props.matchProp !== 'value' && labelTest.indexOf(filterValue) >= 0)
            );
        });

        return this._visibleOptions;
    }

    /**
     * Select option when it is not selected and the other way around.
     * @param selectedValue - the option object to toggle
     */
    toggleSelection (selectedValue) {

        let value = this.props.value;

        // check if current value already contain new item
        let foundDuplicate = value.find(elem => {
            return elem[this.props.valueKey] === selectedValue[0][this.props.valueKey];
        });

        // remove item if it exists
        if (foundDuplicate) {
            value = value.filter( val => {
                return foundDuplicate[this.props.valueKey] !== val[this.props.valueKey];
            });
        } else {
            value = value.concat(selectedValue);
        }

        this.props.onChange(value);
    }

    /**
     * Remove default react-select clear button
     * @returns {null}
     */
    renderClearButton () {
        return null;
    }

    addVisibleOptions() {
        const values = this.props.value;
        const valueStrings = values.map(valueObject => valueObject[this.props.valueKey]);
        // Add currently visible, enabled options to
        // the already-selected ones
        const optionsToAdd = this._visibleOptions
                .filter(optionObject => (
                    !optionObject.disabled
                    && valueStrings.indexOf(optionObject[this.props.valueKey]) === -1))
        return values.concat(optionsToAdd)
    }

    clearVisibleOptions() {
        const visibleOptionValues = this._visibleOptions
            .map(optionObject => optionObject[this.props.valueKey]);
        const values = this.props.value;
        // remove all visible values, keeping only invisible ones
        return values.filter(valueObject => visibleOptionValues.indexOf(valueObject[this.props.valueKey]) === -1);
    }

    getResetValue () {
        if (this.props.resetValue !== undefined) {
            return this.props.resetValue;
        } else if (this.props.multi) {
            return [];
        } else {
            return null;
        }
    }

    setValue (value) {
        if (this.props.simpleValue && value) {
            value = this.props.multi ?
                value.map(i => i[this.props.valueKey]).join(this.props.delimiter) : value[this.props.valueKey];
        }
        this.props.onChange(value);
    }

    /**
     * Add all enabled visible options to the selection
     */
    handleAddAll () {
        const newValue = this.addVisibleOptions();
        this.setValue(newValue);
    }

    /**
     * Clear all visible options from the selection
     */
    handleClearAll () {
        const newValue = this.clearVisibleOptions();
        this.setValue(newValue);
    }

    renderMenu (params) {
        let props = this.props;

        return this._visibleOptions.map((option, i) => {
            const isSelected = props.value.some(selectedOption => selectedOption[params.valueKey] === option[params.valueKey]);
            let isFocused = option === params.focusedOption;
            let optionClass = classNames(params.optionClassName, {
                'Select-option': true,
                'is-selected': isSelected,
                'is-focused': isFocused,
                'is-disabled': option.disabled,
            });
            if (i === 0 ) {
                return (
                    <div key={`option-${i}-${option[params.valueKey]}`}>
                        <OptionTools
                            onAddAll={this.handleAddAll}
                            onClearAll={this.handleClearAll}
                            addAllTitle={props.addAllTitle}
                            clearAllTitle={props.clearAllTitle}
                        />
                        <CheckedOption
                            className={optionClass}
                            option={option}
                            onFocus={params.onFocus}
                            onSelect={params.onSelect}
                            isSelected={isSelected}
                        />
                    </div>
                );
            }
            return (
                <div key={`option-${i}-${option[params.valueKey]}`}>
                    <CheckedOption
                        className={optionClass}
                        option={option}
                        onFocus={params.onFocus}
                        onSelect={params.onSelect}
                        isSelected={isSelected}
                    />
                </div>
            );
        });
    }

    getSelectComponent() {
        return (
                <Select
                    onChange={this.toggleSelection}
                    clearRenderer={this.renderClearButton}
                    closeOnSelect={false}
                    disabled={this.props.disabled}
                    multi
                    menuRenderer={this.renderMenu}
                    optionComponent={CheckedOption}
                    options={this.props.options}
                    valueComponent={CheckedValue}
                    filterOptions={this.handleFilterOptions}
                    placeholder={this.props.placeholder}
                />
        );
    }

    getSelectAsyncComponent() {
        return (
                <Select.Async
                    loadOptions={this.props.loadOptions}
                    cache={this.props.cache}
                    onChange={this.toggleSelection}
                    clearRenderer={this.renderClearButton}
                    closeOnSelect={false}
                    disabled={this.props.disabled}
                    multi
                    menuRenderer={this.renderMenu}
                    optionComponent={CheckedOption}
                    valueComponent={CheckedValue}
                    filterOptions={this.handleFilterOptions}
                    placeholder={this.props.placeholder}
                />
        );
    }

    render() {
        return this.props.async ?  this.getSelectAsyncComponent() : this.getSelectComponent();
    }
}

CheckedSelect.propTypes = {
    addAllTitle: PropTypes.string,
    async: PropTypes.bool,
    cache: PropTypes.any,
    clearAllTitle: PropTypes.string,
    disabled: PropTypes.bool,
    ignoreAccents: PropTypes.bool,
    ignoreCase: PropTypes.bool,
    loadOptions: PropTypes.func,
    matchPos: PropTypes.string,
    matchProp: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    placeholder: PropTypes.string,
    value: PropTypes.any,
    valueKey: PropTypes.string,
};

CheckedSelect.defaultProps = {
    addAllTitle: 'Add all',
    async: false,
    cache: {},
    clearAllTitle: 'Clear',
    disabled: false,
    ignoreAccents: true,
    ignoreCase: true,
    label: '',
    matchPos: 'any',
    matchProp: 'any',
    options: [],
    placeholder: 'Please select ..',
    valueKey: 'value',
};

export default CheckedSelect;
