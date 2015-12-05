'use strict';

var Alignment = require('../../Constant/Alignment');
var Component = require('../../Constant/Component');
var Orientation = require('../../Constant/Orientation');

function UiUtility() {

}

/**
 * @param properties {*}
 * @param component {*}
 * @param [container] {*}
 * @returns {*}
 */
UiUtility.applyProperties = function (properties, component, container) {
    var key, keys = properties == null ? [] : Object.keys(properties);
    var size = null;

    for (var i = 0, n = keys.length; i < n; i++) {
        if ((key = keys[i]) === 'width' || key === 'height') {
            size == null && (size = {});
            size[key] = properties[key];
        } else {
            component[key] = properties[key];
        }
    }

    if (size != null) {
        size.width == null && (size.width = component.preferredSize[0]);
        size.height == null && (size.height = component.preferredSize[1]);
        component.size = size;
    }

    // With Illustration CC 19 align children property is a fucking joke, to make use of it just translate this onto
    // control, but make sure it's in the valid format.

    if ((properties == null || properties.alignment == null) && component.alignment == null && container != null && container.alignChildren != null) {
        component.alignment = container.alignChildren;
    }

    return component;
};

/**
 * @param container {*}
 * @param text {string}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createButton = function (container, text, properties) {
    var button = container.add(Component.BUTTON, undefined, text);
    UiUtility.applyProperties(properties, button, container);
    return button;
};

/**
 * @param container {*}
 * @param text {string}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createCheckBox = function (container, text, properties) {
    var radioButton = container.add(Component.CHECK_BOX, undefined, text);
    UiUtility.applyProperties(properties, radioButton, container);
    return radioButton;
};

/**
 * @param container {*}
 * @param icon {string}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createIconButton = function (container, icon, properties) {
    var button = container.add(Component.ICON_BUTTON, undefined, icon);
    UiUtility.applyProperties(properties, button, container);
    return button;
};

/**
 * @param container {*}
 * @param [orientation] {string}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createGroup = function (container, orientation, properties) {
    var group = container.add(Component.GROUP);
    UiUtility.applyProperties(properties, group, container);
    orientation == null || (group.orientation = orientation);
    return group;
};

/**
 * @param container {*}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createHorizontalGroup = function (container, properties) {
    var group = container.add(Component.GROUP);
    UiUtility.applyProperties(properties, group, container);
    group.orientation = Orientation.ROW;
    return group;
};

/**
 * @param container {*}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createVerticalGroup = function (container, properties) {
    var group = container.add(Component.GROUP);
    UiUtility.applyProperties(properties, group, container);
    group.orientation = Orientation.COLUMN;
    return group;
};

/**
 * @param container {*}
 * @param [orientation] {string}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createPanel = function (container, orientation, properties) {
    var group = container.add(Component.PANEL);
    UiUtility.applyProperties(properties, group, container);
    orientation == null || (group.orientation = orientation);
    return group;
};

/**
 * @param container {*}
 * @param [properties] {{}}
 * @returns {*}
 */
UiUtility.createProgressBar = function (container, properties) {
    var progressBar = container.add(Component.PROGRESS_BAR);
    UiUtility.applyProperties(properties, progressBar, container);
    return progressBar;
};

/**
 * @param container {*}
 * @param text {string}
 * @param [properties] {{value: bool}}
 * @returns {*}
 */
UiUtility.createRadioButton = function (container, text, properties) {
    var radioButton = container.add(Component.RADIO_BUTTON, undefined, text);
    UiUtility.applyProperties(properties, radioButton, container);
    return radioButton;
};

/**
 * @param container {*}
 * @param text {string}
 * @param [properties] {{}}
 * @returns {*}
 */
UiUtility.createStaticText = function (container, text, properties) {
    var staticText = container.add(Component.STATIC_TEXT, undefined, text);
    UiUtility.applyProperties(properties, staticText, container);
    return staticText;
};

/**
 * @param container {*}
 * @param text {string|number}
 * @param [properties] {{}}
 * @returns {*}
 */
UiUtility.createTextfield = function (container, text, properties) {
    var staticText = container.add(Component.EDIT_TEXT, undefined, text);
    UiUtility.applyProperties(properties, staticText, container);
    return staticText;
};

/**
 * @param container {*}
 * @returns {*}
 */
UiUtility.createHorizontalSeparator = function (container) {
    var separator = container.add(Component.PANEL);
    separator.alignment = [Alignment.FILL, Alignment.TOP];
    return separator
};

module.exports = UiUtility;