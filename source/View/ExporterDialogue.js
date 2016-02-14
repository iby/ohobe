/*global app, Folder, ScriptUI*/

'use strict';

var Action = require('../Constant/Action');
var Alignment = require('../Constant/Alignment');
var Component = require('../Constant/Component');
var Orientation = require('../Constant/Orientation');
var UiUtility = require('./Utility/UiUtility');
var ExportCategory = require('../Constant/ExportCategory');
var ExportTarget = require('../Constant/ExportTarget');

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
    var scalesGroup = UiUtility.createGroup(rightGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP});

    UiUtility.createStaticText(targetGroup, 'Artboards:');
    targetGroup.allButton = UiUtility.createRadioButton(targetGroup, 'All', {value: model.artboard.target === ExportTarget.ALL});
    targetGroup.activeButton = UiUtility.createRadioButton(targetGroup, 'Active', {value: model.artboard.target === ExportTarget.ACTIVE});
    targetGroup.onlyWithPrefixCheckbox = UiUtility.createCheckBox(targetGroup, 'Only with + prefix', {value: model.artboard.onlyWithPrefix});
    targetGroup.skipWithPrefixCheckbox = UiUtility.createCheckBox(targetGroup, 'Skip with - prefix', {value: model.artboard.skipWithPrefix});

    scalesGroup.scales = model.artboard.scales;
    scalesGroup.checkbox = UiUtility.createCheckBox(scalesGroup, 'Multi-scaling (prefix, scale):', {value: model.artboard.scale});
    scalesGroup.group = UiUtility.createGroup(scalesGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP, spacing: spacingSmall});
    scalesGroup.button = UiUtility.createButton(scalesGroup, '+', {size: [controlHeight, controlHeight], enabled: model.artboard.scale});

    // Event handling.

    targetGroup.allButton.onClick = function () { model.artboard.target = ExportTarget.ALL };
    targetGroup.activeButton.onClick = function () { model.artboard.target = ExportTarget.ACTIVE };
    targetGroup.onlyWithPrefixCheckbox.onClick = function () { model.artboard.onlyWithPrefix = this.value };
    targetGroup.skipWithPrefixCheckbox.onClick = function () { model.artboard.skipWithPrefix = this.value };

    scalesGroup.checkbox.onClick = function () {
        scalesGroup.button.enabled = model.artboard.scale = this.value;
        updateScalesOptionBlocks(scalesGroup.group, scalesGroup.scales, model.artboard.scale);
        this.window.layout.layout(true);
    };

    // Todo: use the previous prefix when adding it.

    scalesGroup.button.onClick = function () {
        createScalesOptionBlock(this.parent.group, null, true);
        this.window.layout.layout(true);
    };

    // Finally…

    createScalesOptionBlocks(scalesGroup.group, scalesGroup.scales, model.artboard.scale);

    return group;
}

function createLayerOptionsBlock(container, model) {
    var group = UiUtility.createGroup(container, Orientation.ROW, {alignChildren: Alignment.LEFT_TOP});

    var leftGroupProperties = {minimumSize: [200, 0], alignment: Alignment.LEFT_FILL, alignChildren: Alignment.LEFT_TOP};
    var rightGroupProperties = {minimumSize: [200, 0], alignment: Alignment.RIGHT_FILL, alignChildren: Alignment.LEFT_TOP};

    var leftGroup = UiUtility.createGroup(group, Orientation.COLUMN, leftGroupProperties);
    var rightGroup = UiUtility.createGroup(group, Orientation.COLUMN, rightGroupProperties);
    var targetGroup = UiUtility.createGroup(leftGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP});
    var scalesGroup = UiUtility.createGroup(rightGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP});

    UiUtility.createStaticText(targetGroup, 'Layers:');
    targetGroup.allButton = UiUtility.createRadioButton(targetGroup, 'All', {value: model.layer.target === ExportTarget.ALL});
    targetGroup.selectedButton = UiUtility.createRadioButton(targetGroup, 'Selected', {value: model.layer.target === ExportTarget.SELECTED});
    targetGroup.recursiveCheckbox = UiUtility.createCheckBox(targetGroup, 'Recursive', {value: model.layer.recursive});
    targetGroup.onlyWithPrefixCheckbox = UiUtility.createCheckBox(targetGroup, 'Only with + prefix', {value: model.layer.onlyWithPrefix});
    targetGroup.skipWithPrefixCheckbox = UiUtility.createCheckBox(targetGroup, 'Skip with - prefix', {value: model.layer.skipWithPrefix});

    scalesGroup.scales = model.layer.scales;
    scalesGroup.checkbox = UiUtility.createCheckBox(scalesGroup, 'Multi-scaling (prefix, scale):', {value: model.layer.scale});
    scalesGroup.group = UiUtility.createGroup(scalesGroup, Orientation.COLUMN, {alignChildren: Alignment.LEFT_TOP, spacing: spacingSmall});
    scalesGroup.button = UiUtility.createButton(scalesGroup, '+', {size: [controlHeight, controlHeight], enabled: model.layer.scale});

    // Event handling.

    targetGroup.allButton.onClick = function () { model.layer.target = ExportTarget.ALL };
    targetGroup.selectedButton.onClick = function () { model.layer.target = ExportTarget.SELECTED };
    targetGroup.recursiveCheckbox.onClick = function () { model.layer.recursive = this.value };
    targetGroup.onlyWithPrefixCheckbox.onClick = function () { model.layer.onlyWithPrefix = this.value };

    targetGroup.skipWithPrefixCheckbox.onClick = function () {
        model.layer.skipWithPrefix = this.value;
    };

    scalesGroup.checkbox.onClick = function () {
        scalesGroup.button.enabled = model.layer.scale = this.value;
        updateScalesOptionBlocks(scalesGroup.group, scalesGroup.scales, model.layer.scale);
        this.window.layout.layout(true);
    };

    scalesGroup.button.onClick = function () {
        createScalesOptionBlock(this.parent.group, null, true);
        this.window.layout.layout(true);
    };

    // Finally…

    createScalesOptionBlocks(scalesGroup.group, scalesGroup.scales, model.layer.scale);

    return group;
}

function updateScalesOptionBlocks(container, scales, enabled) {
    while (container.children.length > 0) {
        container.remove(0);
    }
    createScalesOptionBlocks(container, scales, enabled);
}

function createScalesOptionBlocks(container, scales, enabled) {
    if (scales.length === 0) {
        createScalesOptionBlock(container, null, enabled);
    } else {
        for (var i = 0, n = scales.length; i < n; i++) {
            createScalesOptionBlock(container, scales[i], enabled);
        }
    }
}

function createScalesOptionBlock(container, scale, enabled) {
    var group = UiUtility.createGroup(container, Orientation.ROW, {alignChildren: Alignment.LEFT_TOP, spacing: spacingSmall});
    scale == null && (container.parent.scales.push(scale = {prefix: '\u00D7', value: 1}));

    UiUtility.createButton(group, '-', {size: [controlHeight, controlHeight], enabled: enabled}).onClick = function () {
        container.remove(group);
        container.parent.scales.splice(container.parent.scales.indexOf(scale), 1);
        container.window.layout.layout(true);
    };

    group.prefixTextfield = UiUtility.createTextfield(group, scale.prefix, {size: [controlHeight * 2, controlHeight], enabled: enabled, justify: 'center'}); // Unicode for ×
    group.scaleTextfield = UiUtility.createTextfield(group, scale.value, {size: [50, controlHeight], enabled: enabled, justify: 'center'});

    // Handle events.

    group.prefixTextfield.onChanging = function () {
        scale.prefix = this.text;
    };

    group.scaleTextfield.onChanging = function () {
        scale.value = this.text;
    };

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