/*global app, Folder*/

"use strict";

require('./Utility/Shim');

var XmpUtility = require('./Utility/XmpUtility');
var Component = require('./Constant/Component');

var document = app.documents.length > 0 ? app.activeDocument : null;
var namespace = 'ohobe-artboard-export';

/**
 * @param {{}} configuration
 */
function showDialogue(configuration) {

    // Normalise configuration.

    if (configuration.path == null || configuration.path === '') {
        configuration.path = (new Folder(document.fullName)).parent.fullName + '/export';
    }

    var dialogue = new Window('dialog', 'Artboard Export – Ohobe');
    var height = 26;
    var group;

    // Output location.

    group = dialogue.add(Component.GROUP);
    group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
    group.orientation = 'column';

    dialogue.pathLabel = group.add(Component.STATIC_TEXT, undefined, 'Output directory for exported artboards:');

    group = dialogue.add(Component.GROUP);
    group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
    group.orientation = 'row';

    dialogue.pathTextfield = group.add(Component.EDIT_TEXT, undefined, Folder.decode(configuration.path));
    dialogue.pathTextfield.size = [400, height];

    dialogue.pathButton = group.add(Component.BUTTON, undefined, 'Choose');
    dialogue.pathButton.size = [100, height];

    // Separator and progress.

    group = dialogue.add(Component.GROUP);
    group.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];
    group.orientation = 'column';
    group.spacing = 20;

    group.separator = group.add(Component.PANEL);
    group.separator.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];

    dialogue.progressBar = group.add(Component.PROGRESS_BAR);
    dialogue.progressBar.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.TOP];

    // Control buttons.

    group = group.add(Component.GROUP);
    group.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
    group.orientation = 'row';

    dialogue.exportButton = group.add(Component.BUTTON, undefined, 'Export');
    dialogue.exportButton.size = [125, height * 1.25];
    dialogue.exportButton.active = true;

    dialogue.cancelButton = group.add(Component.BUTTON, undefined, 'Cancel');
    dialogue.cancelButton.size = [125, height * 1.25];

    // Events.

    dialogue.pathButton.onClick = function () {
        var folder = Folder(configuration.path).selectDlg(configuration.path);

        if (folder != null) {
            configuration.path = folder;
            dialogue.pathTextfield.text = Folder.decode(folder);
        }
    };

    dialogue.exportButton.onClick = function () {
        run(dialogue, configuration);
    };

    dialogue.cancelButton.onClick = function () {
        dialogue.close();
    };

    dialogue.show();
}

function run(dialogue, configuration) {
    var exportOptions = new ExportOptionsPNG24();
    exportOptions.antiAliasing = true;
    exportOptions.transparency = false;
    exportOptions.artBoardClipping = true;

    var artboards = document.artboards;
    var artboard;

    for (var i = 0, n = artboards.length; i < n; i++) {
        document.artboards.setActiveArtboardIndex(i);
        artboard = document.artboards[i];
        document.exportFile(new File(configuration.path + '/' + artboard.name + '.png'), ExportType.PNG24, exportOptions);
        dialogue.progressBar.value = (i + 1) / n * 100;
        dialogue.update();
    }

    XmpUtility.save(document, namespace, configuration);
    dialogue.close();
}

(function () {
    if (document == null) {
        return;
    }

    var settings = XmpUtility.load(document, namespace);

    showDialogue(settings);
})();