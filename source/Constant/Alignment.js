/*global ScriptUI*/

'use strict';

/**
 * @var {{LEFT, RIGHT, TOP, BOTTOM, FILL, CENTER, LEFT_TOP, FILL_FILL, FILL_TOP, LEFT_FILL, RIGHT_TOP, RIGHT_FILL}}
 */
var Alignment = ScriptUI.Alignment;

Alignment.FILL_FILL = [Alignment.FILL, Alignment.FILL];
Alignment.FILL_TOP = [Alignment.FILL, Alignment.TOP];
Alignment.LEFT_FILL = [Alignment.LEFT, Alignment.FILL];
Alignment.RIGHT_FILL = [Alignment.RIGHT, Alignment.FILL];
Alignment.LEFT_TOP = [Alignment.LEFT, Alignment.TOP];
Alignment.RIGHT_TOP = [Alignment.RIGHT, Alignment.TOP];

module.exports = Alignment;