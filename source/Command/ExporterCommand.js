/*global Folder,Artboard,File*/

'use strict';

var ExportCategory = require('../Constant/ExportCategory');
var ExportTarget = require('../Constant/ExportTarget.js');
var DataType = require('../Constant/DataType.js');

function ExporterCommand() {}

ExporterCommand.prototype = {

    /**
     * @param document {Document}
     * @param artboard {Artboard|int}
     * @param item {Artboard}
     * @param path {File}
     */
    exportItem: function (document, artboard, item, path) {

        // Make sure we have an artboard.

        if (artboard == null) {
            artboard = document.artboards[document.artboards.getActiveArtboardIndex()];
        } else if (typeof artboard === DataType.NUMBER) {
            document.artboards.setActiveArtboardIndex(artboard);
            artboard = document.artboards[artboard];
        }

        // Same for the item, we must also find out the rectangle that we will be exporting.

        var rectangle;

        if (item == null) {
            item = artboard;
            rectangle = item.artboardRect;
        } else if (item.prototype === Artboard && item !== artboard) {
            throw new Error();
        } else {
            rectangle = item.visibleBounds;
        }

        // Create export configuration.

        var exportOptions = new ExportOptionsPNG24();
        exportOptions.antiAliasing = true;
        exportOptions.transparency = true;
        exportOptions.artBoardClipping = true;

        // We add a transparent shape that represents the export area. This is necessary when exporting artboards to preserve
        // artboard size, otherwise it will be shrunk to the size of the artwork, which might be smaller than the artboard
        // itself. Oh for fuck sake Adobe… did a kindergarden intern wrote the fucking rectangle class and methods? A drunk
        // hobo makes more sense than this shit. Jeeesaaas…

        var exportAreaLayer = document.layers.add();
        var exportAreaPath = exportAreaLayer.pathItems.rectangle(rectangle[1], rectangle[0], rectangle[2] - rectangle[0], rectangle[1] - rectangle[3]);

        exportAreaLayer.name = 'Exporter (Ohobe)';
        exportAreaPath.name = 'Area';
        exportAreaPath.fillColor = new RGBColor(0, 0, 0);
        exportAreaPath.opacity = 0;

        document.exportFile(new File(path + '/' + artboard.name + '.png'), ExportType.PNG24, exportOptions);

        app.undo();
    },

    /**
     * @param document
     * @param model
     * @param progressCallback
     */
    run: function (document, model, progressCallback) {

        // Ensure the folder we are exporting to exists.

        var folder = new Folder(model.path);
        folder.exists || folder.create();

        var onlyPrefix;
        var skipPrefix;
        var exportable;

        // Check what category we're dealing with and export.

        if (model.category === ExportCategory.ARTBOARD) {
            onlyPrefix = model.artboard.onlyWithPrefix ? '+' : null;
            skipPrefix = model.artboard.skipWithPrefix ? '-' : null;

            if (model.target === ExportTarget.ALL) {
                for (var i = 0, n = document.artboards.length; i < n; i++) {
                    exportable = onlyPrefix == null || document.artboards[i].name.slice(0, onlyPrefix.length) === onlyPrefix;
                    exportable = skipPrefix == null || document.artboards[i].name.slice(0, skipPrefix.length) !== skipPrefix;
                    exportable && this.exportItem(document, i, null, model.path);
                    progressCallback((i + 1) / n);
                }
            } else if (model.target === ExportTarget.SELECTED) {
                this.exportItem(document, null, null, model.path);
                progressCallback(1);
            }
        }
    }
};

module.exports = ExporterCommand;