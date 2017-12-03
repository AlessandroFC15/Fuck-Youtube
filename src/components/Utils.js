/*global YoutubeInterfaceManager, MirrorFinder */

var Utils;

(function () {
    "use strict";
    Utils = function () {
    };

    Utils.isYoutubeVideoLink = function (url) {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(url);
    };

    Utils.isXMLHttpRequestDone = function (request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    Utils.getHTMLDocumentFromText = function (text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

    Utils.getIDFromYoutubeVideoLink = function (url) {
        if (this.isYoutubeVideoLink(url)) {
            var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

            var match = url.match(regExp);

            return (match) ? match[7] : false;
        }
    }
}());
