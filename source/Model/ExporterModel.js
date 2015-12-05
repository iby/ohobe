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
     * Artboard scaling, new line separated prefix and scale.
     */
    artboardScaling: null,

    /**
     * Whether artboard scaling is enabled or not.
     */
    artboardScalingEnabled: null,

    /**
     * What to export (artboard, layer, symbol).
     */
    category: null,

    /**
     * Same as artboard.
     */
    layerScaling: null,

    /**
     * Same as artboard.
     */
    layerScalingEnabled: null,

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

        if (data.artboardScaling == null || data.artboardScaling.constructor !== Array) {
            data.artboardScaling = [];
        }

        if (typeof data.artboardScalingEnabled !== DataType.BOOLEAN) {
            data.artboardScalingEnabled = false;
        }

        if (data.category == null || Object.values(ExportCategory).indexOf(data.category) === -1) {
            data.category = ExportCategory.ARTBOARD;
        }

        if (data.layerScaling == null || data.layerScaling.constructor !== Array) {
            data.layerScaling = [];
        }

        if (typeof data.layerScalingEnabled !== DataType.BOOLEAN) {
            data.layerScalingEnabled = false;
        }

        if (data.path == null || data.path === '') {
            data.path = Folder.decode(document.fullName.exists ? new Folder(document.fullName).parent.fullName : Folder.desktop) + '/export';
        }

        if (data.target == null || Object.values(ExportTarget).indexOf(data.target) === -1) {
            data.target = ExportTarget.ALL;
        }

        // Update model with loaded data.

        this.artboardScaling = data.artboardScaling;
        this.artboardScalingEnabled = data.artboardScalingEnabled;
        this.category = data.category;
        this.layerScaling = data.layerScaling;
        this.layerScalingEnabled = data.layerScalingEnabled;
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
            artboardScaling: this.artboardScaling,
            artboardScalingEnabled: this.artboardScalingEnabled,
            category: this.category,
            layerScaling: this.layerScaling,
            layerScalingEnabled: this.layerScalingEnabled,
            path: this.path,
            target: this.target
        };

        // Normalise / serialise data.

        XmpUtility.save(document, XMP_NAMESPACE, {json: escape(JSON2.stringify(data))});

        return this;
    }
};

module.exports = ExporterModel;