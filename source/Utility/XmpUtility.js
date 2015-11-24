/*global ExternalObject, XMPConst, XMPMeta, XMPUtils*/

"use strict";

require('./Shim');

/**
 * Utility for loading and storing objects into xmp data. Thanks to amazing adobe documentation, here are
 * some links, which might prove being useful.
 *
 * @link http://www.adobe.com/devnet/xmp.html
 * @link https://forums.adobe.com/message/2036802
 * @link https://github.com/fraxen/illustratorscripts/blob/master/finalsave.jsx
 * @link https://indisnip.wordpress.com/2010/08/17/extract-metadata-with-adobe-xmp-part-2/
 * @link https://indisnip.wordpress.com/2010/09/07/storing-custom-data-into-indesign-file-xmp/
 * @link https://www.adobe.com/content/dam/Adobe/en/devnet/scripting/pdfs/javascript_tools_guide.pdf
 *
 * @constructor
 */
function XmpUtility() {
}

/**
 * @param {Object} document
 * @param {string} [namespace]
 */
XmpUtility.load = function (document, namespace) {
    if (!ExternalObject.AdobeXMPScript) {
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    }

    namespace == null && (namespace = 'ohobe');

    // Make a copy that we can work with and define ohobe namespace

    var documentXmp = new XMPMeta(document.XMPString);
    var ohobeNamespace = 'https://github.com/ianbytchek/ohobe#' + namespace;
    XMPMeta.registerNamespace(ohobeNamespace, namespace);

    // Insert nodes.

    var iterator = documentXmp.iterator(null, ohobeNamespace);
    var data = {};
    var property;

    while ((property = iterator.next()) != null) {
        if (property != '') {
            data[property.path.substring(namespace.length + 1)] = property.value;
        }
    }

    return data;
};

/**
 * @param document {Object}
 * @param namespace {string}
 * @param data {{}}
 */
XmpUtility.save = function (document, namespace, data) {
    if (!ExternalObject.AdobeXMPScript) {
        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
    }

    namespace == null && (namespace = 'ohobe');

    // Make a copy that we can work with and define ohobe namespace

    var documentXmp = new XMPMeta(document.XMPString);
    var ohobeXmp = new XMPMeta(documentXmp.serialize());
    var ohobeNamespace = 'https://github.com/ianbytchek/ohobe#' + namespace;
    XMPMeta.registerNamespace(ohobeNamespace, namespace);

    // Insert nodes.

    for (var key, keys = Object.keys(data), i = 0, n = keys.length; i < n; i++) {
        ohobeXmp.setProperty(ohobeNamespace, key = keys[i], data[key]);
    }

    // Append ohobe xmp to the original xmp.

    XMPUtils.appendProperties(ohobeXmp, documentXmp, XMPConst.APPEND_REPLACE_OLD_VALUES);
    document.XMPString = documentXmp.serialize(XMPConst.SERIALIZE_READ_ONLY_PACKET | XMPConst.SERIALIZE_USE_COMPACT_FORMAT);
};

module.exports = XmpUtility;