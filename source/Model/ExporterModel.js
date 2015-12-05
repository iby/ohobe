/*global Folder*/

'use strict';

var XmpUtility = require('../Utility/XmpUtility');
var JSON2 = require('JSON2');
var DataType = require('../Constant/DataType.js');
var ExportCategory = require('../Constant/ExportCategory.js');
var ExportTarget = require('../Constant/ExportTarget.js');

var XMP_NAMESPACE = 'ohobe-exporter';

function ExporterModel() {}

ExporterModel.prototype = {

    /**
     * Whether to export only prefixed artboards.
     */
    artboardOnlyWithPrefix: null,

    /**
     * Artboard scaling, new line separated prefix and scale.
     */
    artboardScaling: null,

    /**
     * Whether artboard scaling is enabled or not.
     */
    artboardScalingEnabled: null,

    /**
     * Whether to ignore prefixed artboards.
     */
    artboardSkipWithPrefix: null,

    /**
     * What to export (artboard, layer, symbol).
     */
    category: null,

    /**
     * Whether to export only prefixed layers.
     */
    layerOnlyWithPrefix: null,

    /**
     * Same as artboard.
     */
    layerScaling: null,

    /**
     * Same as artboard.
     */
    layerScalingEnabled: null,

    /**
     * Whether to ignore prefixed layers.
     */
    layerSkipWithPrefix: null,

    /**
     * Last used export path.
     */
    path: null,

    /**
     * What to export within group (all items, selected items).
     */
    target: null,

    /**
     * Loads data.
     */
    load: function (document) {
        var data = XmpUtility.load(document, XMP_NAMESPACE);

        if (typeof data.json === DataType.STRING) {
            data = JSON2.parse(unescape(data.json));
        } else {
            data = {};
        }

        // Normalise loaded data.

        (typeof data.artboardOnlyWithPrefix !== DataType.BOOLEAN) && (data.artboardOnlyWithPrefix = false);
        (data.artboardScaling == null || data.artboardScaling.constructor !== Array) && (data.artboardScaling = []);
        (typeof data.artboardScalingEnabled !== DataType.BOOLEAN) && (data.artboardScalingEnabled = false);
        (typeof data.artboardSkipWithPrefix !== DataType.BOOLEAN) && (data.artboardSkipWithPrefix = false);
        (data.category == null || Object.values(ExportCategory).indexOf(data.category) === -1) && (data.category = ExportCategory.ARTBOARD);
        (typeof data.layerOnlyWithPrefix !== DataType.BOOLEAN) && (data.layerOnlyWithPrefix = false);
        (data.layerScaling == null || data.layerScaling.constructor !== Array) && (data.layerScaling = []);
        (typeof data.layerScalingEnabled !== DataType.BOOLEAN) && (data.layerScalingEnabled = false);
        (typeof data.layerSkipWithPrefix !== DataType.BOOLEAN) && (data.layerSkipWithPrefix = false);

        (data.path == null || data.path === '') && (data.path = Folder.decode(document.fullName.exists ? new Folder(document.fullName).parent.fullName : Folder.desktop) + '/export');
        (data.target == null || Object.values(ExportTarget).indexOf(data.target) === -1) && (data.target = ExportTarget.ALL);

        // Update model with loaded data.

        this.artboardOnlyWithPrefix = data.artboardOnlyWithPrefix;
        this.artboardScaling = data.artboardScaling;
        this.artboardScalingEnabled = data.artboardScalingEnabled;
        this.artboardSkipWithPrefix = data.artboardSkipWithPrefix;
        this.category = data.category;
        this.layerOnlyWithPrefix = data.layerOnlyWithPrefix;
        this.layerScaling = data.layerScaling;
        this.layerScalingEnabled = data.layerScalingEnabled;
        this.layerSkipWithPrefix = data.layerSkipWithPrefix;
        this.path = data.path;
        this.target = data.target;

        return this;
    },

    /**
     * Saves data.
     */
    save: function (document) {

        // Extract data from the model.

        var data = {
            artboardOnlyWithPrefix: this.artboardOnlyWithPrefix,
            artboardScaling: this.artboardScaling,
            artboardScalingEnabled: this.artboardScalingEnabled,
            artboardSkipWithPrefix: this.artboardSkipWithPrefix,
            category: this.category,
            layerOnlyWithPrefix: this.layerOnlyWithPrefix,
            layerScaling: this.layerScaling,
            layerScalingEnabled: this.layerScalingEnabled,
            layerSkipWithPrefix: this.layerSkipWithPrefix,
            path: this.path,
            target: this.target
        };

        // Normalise / serialise data.

        XmpUtility.save(document, XMP_NAMESPACE, {json: escape(JSON2.stringify(data))});

        return this;
    }
};

module.exports = ExporterModel;