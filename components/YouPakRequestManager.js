/*global DOMParser, NoVideoFoundException */

var YouPakRequestManager;
(function () {
    "use strict";

    YouPakRequestManager = function (url) {
        this.url = url;
    };

    YouPakRequestManager.prototype.createRequestToYouPak = function () {
        var request = new XMLHttpRequest();

        request.open("GET", this.url.replace("tube", "pak"), true);

        return request;
    };

    YouPakRequestManager.prototype.isXMLHttpRequestDone = function (request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    YouPakRequestManager.prototype.getHTMLDocumentFromText = function (text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

    YouPakRequestManager.prototype.findVideoLinksFromYouPak = function (responseText) {
        var htmlDoc = this.getHTMLDocumentFromText(responseText),
            videoTag = htmlDoc.getElementsByTagName("video")[0],
            videoSources = videoTag.children;

        if (videoTag === undefined) {
            throw new NoVideoFoundException();
        }

        return Array.prototype.slice.call(videoSources).map(function (element) {
            return element.src;
        });
    };
}());
