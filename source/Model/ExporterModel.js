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
     * What to export (artboard, layer, symbol).
     */
    category: null,

    /**
     * Last used export path.
     */
    path: null,

    /**
     * What to export within group (all items, selected items).
     */
    target: null,

    artboard: {

        /**
         * Whether to export only prefixed artboards.
         */
        onlyWithPrefix: null,

        /**
         * Whether export multiple scales.
         */
        scale: null,

        /**
         * Scale prefixes and values.
         */
        scales: null,

        /**
         * Whether to ignore prefixed artboards.
         */
        skipWithPrefix: null

    },

    layer: {

        /**
         * Whether to export only prefixed layers.
         */
        onlyWithPrefix: null,

        /**
         * Whether to process layers recursively.
         */
        recursive: null,

        /**
         * Whether export multiple scales.
         */
        scale: null,

        /**
         * Scale prefixes and values.
         */
        scales: null,

        /**
         * Whether to ignore prefixed layers.
         */
        skipWithPrefix: null

    },

    /**
     * Loads data.
     */
    load: function (document) {
        var data = XmpUtility.load(document, XMP_NAMESPACE);

        if (typeof data.json === DataType.STRING) {
            try {
                data = JSON2.parse(unescape(data.json));
            } catch (error) {
                data = {};
            }
        } else {
            data = {};
        }

        // Normalise loaded data.

        (data.category == null || Object.values(ExportCategory).indexOf(data.category) === -1) && (data.category = ExportCategory.ARTBOARD);
        (data.path == null || data.path === '') && (data.path = Folder.decode(document.fullName.exists ? new Folder(document.fullName).parent.fullName : Folder.desktop) + '/export');
        (data.target == null || Object.values(ExportTarget).indexOf(data.target) === -1) && (data.target = ExportTarget.ALL);

        // Normalise artboard data.

        (data.artboard == null || typeof data.artboard !== DataType.OBJECT) && (data.artboard = {});
        (data.artboard.onlyWithPrefix == null || typeof data.artboard.onlyWithPrefix !== DataType.BOOLEAN) && (data.artboard.onlyWithPrefix = false);
        (data.artboard.scale == null || typeof data.artboard.scale !== DataType.BOOLEAN) && (data.artboard.scale = false);
        (data.artboard.scales == null || typeof data.artboard.scales !== DataType.OBJECT || data.artboard.scales.constructor !== Array) && (data.artboard.scales = []);
        (data.artboard.skipWithPrefix == null || typeof data.artboard.skipWithPrefix !== DataType.BOOLEAN) && (data.artboard.skipWithPrefix = false);

        // Normalise layer data.

        (data.layer == null || typeof data.layer !== DataType.OBJECT) && (data.layer = {});
        (data.layer.onlyWithPrefix == null || typeof data.layer.onlyWithPrefix !== DataType.BOOLEAN) && (data.layer.onlyWithPrefix = false);
        (data.layer.recursive == null || typeof data.layer.recursive !== DataType.BOOLEAN) && (data.layer.recursive = false);
        (data.layer.scale == null || typeof data.layer.scale !== DataType.BOOLEAN) && (data.layer.scale = false);
        (data.layer.scales == null || typeof data.layer.scales !== DataType.OBJECT || data.layer.scales.constructor !== Array) && (data.layer.scales = []);
        (data.layer.skipWithPrefix == null || typeof data.layer.skipWithPrefix !== DataType.BOOLEAN) && (data.layer.skipWithPrefix = false);

        // Update model with loaded data.

        this.category = data.category;
        this.path = data.path;
        this.target = data.target;

        this.artboard = {};
        this.artboard.onlyWithPrefix = data.artboard.onlyWithPrefix;
        this.artboard.scale = data.artboard.scale;
        this.artboard.scales = data.artboard.scales;
        this.artboard.skipWithPrefix = data.artboard.skipWithPrefix;

        this.layer = {};
        this.layer.onlyWithPrefix = data.layer.onlyWithPrefix;
        this.layer.recursive = data.layer.recursive;
        this.layer.scale = data.layer.scale;
        this.layer.scales = data.layer.scales;
        this.layer.skipWithPrefix = data.layer.skipWithPrefix;

        return this;
    },

    /**
     * Saves data.
     */
    save: function (document) {

        // Extract data from the model.

        var data = {
            category: this.category,
            path: this.path,
            target: this.target,

            artboard: {
                onlyWithPrefix: this.artboard.onlyWithPrefix,
                scale: this.artboard.scale,
                scales: this.artboard.scales,
                skipWithPrefix: this.artboard.skipWithPrefix
            },

            layer: {
                onlyWithPrefix: this.layer.onlyWithPrefix,
                recursive: this.layer.recursive,
                scale: this.layer.scale,
                scales: this.layer.scales,
                skipWithPrefix: this.layer.skipWithPrefix
            }
        };

        // Normalise / serialise data.

        XmpUtility.save(document, XMP_NAMESPACE, {json: escape(JSON2.stringify(data))});

        return this;
    }
};

module.exports = ExporterModel;