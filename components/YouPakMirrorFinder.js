/*global DOMParser, NoVideoFoundException, GenYouTubeMirrorFinder, YoutubeVideoUnblocker */

/**
 * This component is responsible for finding a video source that works (a mirror)
 * It attempts to do so by making a request to the YouPak website and finding their sources for the video.
 *
 * Inputs:
 *      - A YouTube video url
 *
 * Results:
 *      - Hopefully, we find some video links when calling the function findVideoLinksFromYouPak.
 */

var YouPakMirrorFinder;
(function () {
    "use strict";

    YouPakMirrorFinder = function () {
    };

    YouPakMirrorFinder.prototype.findMirrors = function (url, callback) {
        if (YoutubeVideoUnblocker.isYoutubeVideoLink(url)) {
            var request = this.createRequestToYouPak(url),
                self = this;

            request.onreadystatechange = function () {
                if (self.isXMLHttpRequestDone(request)) {
                    var htmlDoc = self.getHTMLDocumentFromText(request.responseText),
                        videoTag = htmlDoc.getElementsByTagName("video")[0],
                        videoSources = videoTag.children;

                    if (videoTag === undefined) {
                        callback(new NoVideoFoundException());
                        return;
                    }

                    var links = Array.prototype.slice.call(videoSources).map(function (element) {
                        return element.src;
                    });

                    callback({'720': links[0]});
                }
            };

            request.send();
        } else {
            throw new InvalidYouTubeVideoURLException();
        }
    };

    YouPakMirrorFinder.prototype.createRequestToYouPak = function (url) {
        var request = new XMLHttpRequest();

        request.open("GET", url.replace("tube", "pak"), true);

        return request;
    };

    YouPakMirrorFinder.prototype.isXMLHttpRequestDone = function (request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    YouPakMirrorFinder.prototype.getHTMLDocumentFromText = function (text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

}());
