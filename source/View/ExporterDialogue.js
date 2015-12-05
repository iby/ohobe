/*global app, Folder, ScriptUI*/

'use strict';

var Action = require('../Constant/Action');
var Alignment = require('../Constant/Alignment');
var Component = require('../Constant/Component');
var Orientation = require('../Constant/Orientation');
var UiUtility = require('./Utility/UiUtility');
var ExportCategory = require('../Constant/ExportCategory.js');

function ExporterDialogue(model, callback) {
    var dialogue = new Window('dialog', 'Exporter \u2013 Ohobe');

    dialogue.orientation = Orientation.COLUMN;
    dialogue.alignChildren = Alignment.FILL_TOP;

    dialogue.optionsBlock = createOptionsBlock(dialogue, model);
    dialogue.outputLocationBlock = createOutputLocationBlock(dialogue, model);
    dialogue.progressBlock = createProgressBlock(dialogue);
    dialogue.controlBlock = createControlBlock(dialogue, model, callback);

    return dialogue;
}

module.exports = ExporterDialogue;

//

var controlHeight = 26;
var spacingSmall = 3;
var spacingLarge = 20;

//

function createControlBlock(container, model, callback) {
    var group = UiUtility.createGroup(container, Orientation.ROW, {alignment: Alignment.FILL_TOP});
    var minimumSize = [100, controlHeight * 1.25];

    group.exportButton = UiUtility.createButton(group, 'Export', {minimumSize: minimumSize, active: true});
    group.saveButton = UiUtility.createButton(group, 'Save', {minimumSize: minimumSize});
    group.cancelButton = UiUtility.createButton(group, 'Cancel', {minimumSize: minimumSize, alignment: Alignment.RIGHT_TOP});

    // Event handling.

    group.exportButton.onClick = function () {
        callback(Action.EXPORT, model);
        callback(Action.SAVE, model);
        this.window.close();
    };

    group.saveButton.onClick = function () {
        callback(Action.SAVE, model);
        this.window.close();
    };

    group.exportButton.onClick = function () {
        callback(Action.EXPORT, model);
        callback(Action.SAVE, model);
        this.window.close();
    };

    group.cancelButton.onClick = function () {
        this.window.close();
    };

    return group;
}

function createOptionsBlock(container, model) {
    var optionsBlock = UiUtility.createGroup(container, Orientation.COLUMN, {alignChildren: Alignment.FILL_TOP});
    var exportCategoryGroup = UiUtility.createGroup(optionsBlock, Orientation.ROW, {alignChildren: Alignment.LEFT_TOP});

    UiUtility.createHorizontalSeparator(optionsBlock);

    var exportCategoryOptionsGroup = UiUtility.createGroup(optionsBlock, Orientation.STACK, {alignChildren: Alignment.LEFT_TOP});

    // Export category selection.

    var categoryRadioButtons = {};
    var selectedCategory = model.category;
    var category;

    UiUtility.createStaticText(exportCategoryGroup, 'Export:');
    categoryRadioButtons[category] = exportCategoryGroup.artboardRadioButton = UiUtility.createRadioButton(exportCategoryGroup, 'Artboards', {indent: 1, category: category = ExportCategory.ARTBOARD, value: category === selectedCategory, generator: createArtboardOptionsBlock});
    categoryRadioButtons[category] = exportCategoryGroup.layerRadioButton = UiUtility.createRadioButton(exportCategoryGroup, 'Layers', {indent: 1, category: category = ExportCategory.LAYER, value: category === selectedCategory, generator: createLayerOptionsBlock});

    // Event handling.

    var updateSelectedCategory = function (category) {
        model.category = category == null ? category = selectedCategory : selectedCategory = category;
        exportCategoryOptionsGroup.children.length > 0 && exportCategoryOptionsGroup.remove(0);
        categoryRadioButtons[category].generator(exportCategoryOptionsGroup, model);
    };

    exportCategoryGroup.artboardRadioButton.onClick = exportCategoryGroup.layerRadioButton.onClick = function () {
        updateSelectedCategory(this.category);
        this.window.layout.layout(true);
    };

    // Finally…

    updateSelectedCategory();

    return optionsBlock;
}

function createArtboardOptionsBlock(container, model) {
    var group = UiUtility.createGroup(container, Orientation.ROW, {alignChildren: Alignment.LEFT_TOP});

    var leftGroupProperties = {minimumSize: [200, 0], alignment: Alignment.LEFT_FILL, alignChildren: Alignment.LEFT_TOP};
    var rightGroupProperties = {minimumSize: [200, 0], alignment: Alignment.RIGHT_FILL, alignChildren: Alignment.LEFT_TOP};

    var leftGroup = UiUtility.createGroup(group, Orientation.COLUMN, leftGroupProperties);
    var rightGroup = UiUtility.createGroup(group, Orientation.COLUMN, rightGroupProperties);
    var targetGroup = UiUtility.createGroup(leftGroup, Orientation.COLUMN, {alignment: Alignment.FILL_TOP, alignChildren: Alignment.FILL_TOP});
    var scalingGroup = UiUtility.createGroup(rightGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP});

    UiUtility.createStaticText(targetGroup, 'Artboards:');
    UiUtility.createRadioButton(targetGroup, 'All', {value: true});
    UiUtility.createRadioButton(targetGroup, 'Selected (\u2026)'); // Unicode for …
    targetGroup.onlyPrefixCheckbox = UiUtility.createCheckBox(targetGroup, 'Only with + prefix', {value: model.artboardOnlyWithPrefix});
    targetGroup.skipPrefixCheckbox = UiUtility.createCheckBox(targetGroup, 'Skip with - prefix', {value: model.artboardSkipWithPrefix});

    scalingGroup.scaling = model.artboardScaling;
    scalingGroup.checkbox = UiUtility.createCheckBox(scalingGroup, 'Multi-scaling (prefix, scale):', {value: model.artboardScalingEnabled});
    scalingGroup.group = UiUtility.createGroup(scalingGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP, spacing: spacingSmall});
    scalingGroup.button = UiUtility.createButton(scalingGroup, '+', {size: [controlHeight, controlHeight], enabled: model.artboardScalingEnabled});

    // Event handling.

    targetGroup.onlyPrefixCheckbox.onClick = function () {
        model.artboardOnlyWithPrefix = this.value;
    };

    targetGroup.skipPrefixCheckbox.onClick = function () {
        model.artboardSkipWithPrefix = this.value;
    };

    scalingGroup.checkbox.onClick = function () {
        scalingGroup.button.enabled = model.artboardScalingEnabled = this.value;
        updateScalingOptionBlocks(scalingGroup.group, scalingGroup.scaling, model.artboardScalingEnabled);
        this.window.layout.layout(true);
    };

    // Todo: use the previous prefix when adding it.

    scalingGroup.button.onClick = function () {
        createScalingOptionBlock(this.parent.group, null, true);
        this.window.layout.layout(true);
    };

    // Finally…

    createScalingOptionBlocks(scalingGroup.group, scalingGroup.scaling, model.artboardScalingEnabled);

    return group;
}

function createLayerOptionsBlock(container, model) {
    var group = UiUtility.createGroup(container, Orientation.ROW, {alignChildren: Alignment.LEFT_TOP});

    var leftGroupProperties = {minimumSize: [200, 0], alignment: Alignment.LEFT_FILL, alignChildren: Alignment.LEFT_TOP};
    var rightGroupProperties = {minimumSize: [200, 0], alignment: Alignment.RIGHT_FILL, alignChildren: Alignment.LEFT_TOP};

    var leftGroup = UiUtility.createGroup(group, Orientation.COLUMN, leftGroupProperties);
    var rightGroup = UiUtility.createGroup(group, Orientation.COLUMN, rightGroupProperties);
    var targetGroup = UiUtility.createGroup(leftGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP});
    var scalingGroup = UiUtility.createGroup(rightGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP});

    UiUtility.createStaticText(targetGroup, 'Layers:');
    UiUtility.createRadioButton(targetGroup, 'All', {value: true});
    UiUtility.createRadioButton(targetGroup, 'Selected (\u2026)'); // Unicode for …

    scalingGroup.scaling = model.layerScaling;
    scalingGroup.checkbox = UiUtility.createCheckBox(scalingGroup, 'Multi-scaling (prefix, scale):', {value: model.layerScalingEnabled});
    scalingGroup.group = UiUtility.createGroup(scalingGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP, spacing: spacingSmall});
    scalingGroup.button = UiUtility.createButton(scalingGroup, '+', {size: [controlHeight, controlHeight], enabled: model.artboardScalingEnabled});

    // Event handling.

    scalingGroup.checkbox.onClick = function () {
        scalingGroup.button.enabled = model.layerScalingEnabled = this.value;
        updateScalingOptionBlocks(scalingGroup.group, scalingGroup.scaling, model.layerScalingEnabled);
        this.window.layout.layout(true);
    };

    scalingGroup.button.onClick = function () {
        createScalingOptionBlock(this.parent.group, null, true);
        this.window.layout.layout(true);
    };

    // Finally…

    createScalingOptionBlocks(scalingGroup.group, scalingGroup.scaling, model.layerScalingEnabled);

    return group;
}

function updateScalingOptionBlocks(container, scaling, enabled) {
    while (container.children.length > 0) {
        container.remove(0);
    }
    createScalingOptionBlocks(container, scaling, enabled);
}

function createScalingOptionBlocks(container, scaling, enabled) {
    if (scaling.length === 0) {
        createScalingOptionBlock(container, null, enabled);
    } else {
        for (var i = 0, n = scaling.length; i < n; i++) {
            createScalingOptionBlock(container, scaling[i], enabled);
        }
    }
}

function createScalingOptionBlock(container, scaling, enabled) {
    var group = UiUtility.createGroup(container, Orientation.ROW, {alignChildren: Alignment.LEFT_TOP, spacing: spacingSmall});
    scaling == null && (container.parent.scaling.push(scaling = {prefix: '\u00D7', value: 1}));

    UiUtility.createButton(group, '-', {size: [controlHeight, controlHeight], enabled: enabled}).onClick = function () {
        container.remove(group);
        container.parent.scaling.splice(container.parent.scaling.indexOf(scaling), 1);
        container.window.layout.layout(true);
    };

    group.prefixTextfield = UiUtility.createTextfield(group, scaling.prefix, {size: [controlHeight * 2, controlHeight], enabled: enabled, justify: 'center'}); // Unicode for ×
    group.scaleTextfield = UiUtility.createTextfield(group, scaling.value, {size: [50, controlHeight], enabled: enabled, justify: 'center'});

    return group;
}

function createOutputLocationBlock(container, model) {
    var block = UiUtility.createGroup(container, Orientation.COLUMN, {alignChildren: Alignment.FILL_TOP});
    UiUtility.createHorizontalSeparator(block);

    var group = UiUtility.createGroup(block, Orientation.ROW, {size: [0, controlHeight]});

    block.textfield = UiUtility.createTextfield(group, model.path, {alignment: Alignment.FILL_FILL});
    block.button = UiUtility.createButton(group, 'Select location', {alignment: Alignment.RIGHT_FILL});

    block.button.onClick = function () {
        var folder = Folder(model.path).selectDlg(model.path);
        folder == null || (block.textfield.text = model.path = Folder.decode(folder));
    };

    return block;
}

function createProgressBlock(container) {
    var group = UiUtility.createGroup(container, Orientation.COLUMN, {alignment: Alignment.FILL_TOP, spacing: spacingLarge});

    UiUtility.createHorizontalSeparator(group);
    group.progressBar = UiUtility.createProgressBar(container, {alignment: Alignment.FILL_TOP});

    return group;
}