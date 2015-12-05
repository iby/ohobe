/*global app*/

'use strict';

require('./Utility/Shim');

var ExporterCommand = require('./Command/ExporterCommand');
var ExporterDialogue = require('./View/ExporterDialogue');
var ExporterModel = require('./Model/ExporterModel');
var Action = require('./Constant/Action');

(function () {
    var document = app.documents.length > 0 ? app.activeDocument : null;

    // No active document, no fun.

    if (document == null) {
        return;
    }

    var model = new ExporterModel().load(document);
    var command = new ExporterCommand();
    var dialogue = new ExporterDialogue(model, actionCallback);

    function actionCallback(action, model) {
        try {
            action === Action.EXPORT && command.run(document, model, progressCallback);
            model.save(document);
        } catch (error) {
            alert(error);
        }
    }

    function progressCallback(progress) {
        dialogue.progressBlock.progressBar.value = progress * 100;
        dialogue.update();
    }

    dialogue.show();
})();