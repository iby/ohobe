/**
 * Aligns selected points in current selection to grid, by default 1×1 pixels.
 *
 * @param {number} [gridWidth]
 * @param {number} [gridHeight]
 */
function main(gridWidth, gridHeight) {
    gridWidth == null && (gridWidth = 1);
    gridHeight == null && (gridHeight = 1);

    var document = app.activeDocument;
    var selection = document.selection;
    var point;

    // Go through all selected points.

    for (var i = 0, n = selection.length; i < n; i++) {
        if (selection[i].typename === 'PathItem') {
            var pathPoints = selection[i].selectedPathPoints;

            for (var j = 0, m = pathPoints.length; j < m; j++) {
                point = pathPoints[j];
                point.anchor = [Math.round(point.anchor[0] / gridWidth) * gridWidth, Math.round(point.anchor[1] / gridHeight) * gridHeight];
                point.leftDirection = [Math.round(point.leftDirection[0] / gridWidth) * gridWidth, Math.round(point.leftDirection[1] / gridHeight) * gridHeight];
                point.rightDirection = [Math.round(point.rightDirection[0] / gridWidth) * gridWidth, Math.round(point.rightDirection[1] / gridHeight) * gridHeight];
            }
        } else {
            selection[i].left = Math.round(selection[i].left / gridHeight) * gridHeight;
            selection[i].top = Math.round((selection[i].top + selection[i].height) / gridWidth) * gridWidth - selection[i].height;
        }
    }
}

main();