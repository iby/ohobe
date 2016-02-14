/*global Artboard,Folder,File,Layer,PageItem,SymbolItem*/

'use strict';

var ExportCategory = require('../Constant/ExportCategory');
var ExportTarget = require('../Constant/ExportTarget');
var DataType = require('../Constant/DataType');

function ExporterCommand() {}

ExporterCommand.prototype = {

    /**
     * @param item {*}
     * @returns {string}
     */
    getItemName: function (item) {
        if (item.constructor === SymbolItem) {
            return item.symbol.name;
        }

        return item.typename;
    },

    /**
     * @param layer {Layer}
     * @returns {Array}
     */
    getVisibleBounds: function (layer) {

        // Oh Adobe, thanks for no way of getting layer's visible bounds. We go though each page item and
        // workout the maximum rectangle – only writing this in binary would make it worse… And then there
        // are layers also. And here comes the flipped y axis, someone kill me please.

        var minX = Number.POSITIVE_INFINITY;
        var minY = Number.NEGATIVE_INFINITY;
        var maxX = Number.NEGATIVE_INFINITY;
        var maxY = Number.POSITIVE_INFINITY;
        var rectangle;

        for (var i = 0, n = layer.pageItems.length; i < n; i++) {
            if (!layer.pageItems[i].hidden) {
                rectangle = layer.pageItems[i].visibleBounds;
                rectangle[0] < minX && (minX = rectangle[0]);
                rectangle[2] > maxX && (maxX = rectangle[2]);
                rectangle[1] > minY && (minY = rectangle[1]);
                rectangle[3] < maxY && (maxY = rectangle[3]);
            }
        }

        for (i = 0, n = layer.layers.length; i < n; i++) {
            if (layer.visible) {
                rectangle = this.getVisibleBounds(layer.layers[i]);
                rectangle[0] < minX && (minX = rectangle[0]);
                rectangle[2] > maxX && (maxX = rectangle[2]);
                rectangle[1] > minY && (minY = rectangle[1]);
                rectangle[3] < maxY && (maxY = rectangle[3]);
            }
        }

        return [minX, minY, maxX, maxY];
    },

    /**
     * @param document {Document}
     * @param artboard {Artboard|int}
     * @param item {Artboard}
     * @param path {File}
     * @param [scale] {Object}
     */
    exportItem: function (document, artboard, item, path, scale) {

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
        } else if (item.constructor === Layer) {
            rectangle = this.getVisibleBounds(item);
        } else if (item.constructor === Artboard) {
            if (item !== artboard) { throw new Error() }
            rectangle = item.artboardRect;
        } else {
            rectangle = item.visibleBounds;
        }

        // Create export configuration.

        var exportOptions = new ExportOptionsPNG24();
        exportOptions.antiAliasing = true;
        exportOptions.transparency = true;
        exportOptions.artBoardClipping = true;

        // Not this can only go two ways – we're dealing with an entire artboard or a selection. In first case we simply export file
        // with that artboard selected, trimming the contents. In second case we kind of do the same but create a temporary artboard
        // to make sure the contents are clipped.

        if (item === artboard) {

            // We add a transparent shape that represents the export area. This is necessary when exporting artboards to preserve
            // artboard size, otherwise it will be shrunk to the size of the artwork, which might be smaller than the artboard
            // itself. Oh for fuck sake Adobe… did a kindergarten intern wrote the fucking rectangle class and methods? A drunk
            // hobo makes more sense than this shit. Jeeesaaas…

            var exportAreaLayer = document.layers.add();
            var exportAreaPath = exportAreaLayer.pathItems.rectangle(rectangle[1], rectangle[0], rectangle[2] - rectangle[0], rectangle[1] - rectangle[3]);

            exportAreaLayer.name = 'Exporter (Ohobe)';
            exportAreaPath.name = 'Area';
            exportAreaPath.fillColor = new RGBColor(0, 0, 0);
            exportAreaPath.opacity = 0;
        } else {
            document.artboards.add(rectangle);
        }

        var filename = item.name === '' ? this.getItemName(item) : item.name;

        if (scale != null) {

            // Todo: this makes it a suffix, not prefix…

            exportOptions.horizontalScale = scale.value * 100;
            exportOptions.verticalScale = scale.value * 100;
            filename += scale.prefix + scale.value;
        }

        // And finally… unicorns and all the magic things!

        document.exportFile(new File(path + '/' + filename + '.png'), ExportType.PNG24, exportOptions);

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

        var onlyWithPrefix, onlyWithPrefixLength = 1;
        var skipWithPrefix, skipWithPrefixLength = 1;
        var exportable;
        var recursor;
        var i, n;
        var j, m;

        // Check what category we're dealing with and export.

        if (model.category === ExportCategory.ARTBOARD) {
            var artboards = document.artboards;

            onlyWithPrefix = model.artboard.onlyWithPrefix ? '+' : null;
            skipWithPrefix = model.artboard.skipWithPrefix ? '-' : null;

            if (model.artboard.target === ExportTarget.ALL) {
                for (i = 0, n = artboards.length; i < n; i++) {
                    exportable = onlyWithPrefix == null || artboards[i].name.slice(0, onlyWithPrefixLength) === onlyWithPrefix;
                    exportable = skipWithPrefix == null || artboards[i].name.slice(0, skipWithPrefixLength) !== skipWithPrefix;
                    exportable && this.exportItem(document, i, null, model.path);
                    progressCallback((i + 1) / n);
                }
            } else if (model.target === ExportTarget.SELECTED) {
                this.exportItem(document, null, null, model.path);
                progressCallback(1);
            } else {
                throw new Error('Unknown artboard export target.');
            }
        } else if (model.category === ExportCategory.LAYER) {
            var exportableItems = [];
            var recursive = model.layer.recursive;

            onlyWithPrefix = model.layer.onlyWithPrefix ? '+' : null;
            skipWithPrefix = model.layer.skipWithPrefix ? '-' : null;

            recursor = function (layers, selectedOnly) {
                var exportableItems = [];

                for (var i = 0, n = layers.length; i < n; i++) {
                    var layer = layers[i];

                    // Oh Adobe, why `hasSelectedArtwork` not working on nested layers???… Thanks to that we must manually check if that's the case.

                    exportable = true;
                    exportable && onlyWithPrefix === true && (exportable = layer.name.slice(0, onlyWithPrefixLength) === onlyWithPrefix);
                    exportable && skipWithPrefix === true && (exportable = layer.name.slice(0, skipWithPrefixLength) !== skipWithPrefix);

                    // If this layer is exportable, we add it to the list, otherwise we continue recursing.

                    if (exportable === false) {
                        continue;
                    }

                    // Now things gets really weird. The layer can contain other layers and page items, though the stuff you see in the
                    // layers panel look plain and simple, in reality they are the exact opposite.

                    var visibleSublayerCount = 0;
                    var selectedSublayers = [];

                    for (var j = 0, m = layer.layers.length; j < m; j++) {
                        var sublayer = layer.layers[j];
                        var sublayerExportableItems;

                        if (sublayer.visible) {
                            visibleSublayerCount++;

                            // Embrace yourself… and check if that sublayer is fully selected. Knowing that we can establish whether this layer
                            // is also fully selected or whether we're dealing with individual page items.

                            if ((sublayerExportableItems = recursor([sublayer], selectedOnly)).length === 1 && sublayerExportableItems[0] === sublayer) {
                                selectedSublayers.push(sublayerExportableItems[0]);
                            } else {
                                exportableItems.push.apply(exportableItems, sublayerExportableItems);
                            }
                        }
                    }

                    // Now we do similar thing with page items by finding out which ones are selected and which ones are not.

                    var visiblePageItemCount = 0;
                    var selectedPageItems = [];

                    for (j = 0, m = layer.pageItems.length; j < m; j++) {
                        var pageItem = layer.pageItems[j];

                        // Oh Adobe, fucking great consistency with `layer.visible` and `pageItem.hidden`, an infant
                        // makes more sense than your logic.

                        if (!pageItem.hidden) {
                            visiblePageItemCount++;
                            pageItem.selected && selectedPageItems.push(pageItem);
                        }
                    }

                    //alert([layer, 'sublayers', visibleSublayerCount, selectedSublayers.length, selectedSublayers, 'items', visiblePageItemCount, selectedPageItems, selectedPageItems.length]);

                    // We export the entire layer when all visible items are selected, otherwise only selected items.

                    if (visiblePageItemCount === 0 && visibleSublayerCount === 0) {
                        continue;
                    } else if (selectedPageItems.length === visiblePageItemCount && selectedSublayers.length === visibleSublayerCount) {
                        exportableItems.push(layer);
                    } else if (selectedPageItems.length > 0) {
                        exportableItems.push.apply(exportableItems, selectedPageItems);
                    } else if (selectedSublayers.length > 0) {
                        exportableItems.push.apply(exportableItems, selectedSublayers);
                    }
                }

                return exportableItems;
            };

            if (model.layer.target === ExportTarget.ALL) {
                exportableItems.push.apply(exportableItems, recursor(document.layers, false));
            } else if (model.layer.target === ExportTarget.SELECTED) {
                exportableItems.push.apply(exportableItems, recursor(document.layers, true));
            } else {
                throw new Error('Unknown layer export target.');
            }

            // Todo: take scaling business out into export function, we redoing a huge amount of work for
            // todo: every scale it's crazy.

            var scales = model.layer.scale && model.layer.scales.length > 0 ? model.layer.scales : [];
            var scaleCount = scales.length;

            for (i = 0, n = exportableItems.length; i < n; i++) {
                if (scaleCount > 0) {
                    for (j = 0, m = scaleCount; j < m; j++) {
                        this.exportItem(document, null, exportableItems[i], model.path, scales[j]);
                        progressCallback((i * m + j + 1) / n / m);
                    }
                } else {
                    this.exportItem(document, null, exportableItems[i], model.path);
                    progressCallback((i + 1) / n);
                }
            }
        } else {
            throw new Error('Unknown export category.');
        }
    }
};

module.exports = ExporterCommand;