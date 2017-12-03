/*global DOMParser, NoVideoFoundException, GenYouTubeMirrorFinder, Utils, InvalidYouTubeVideoURLException */

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
        if (Utils.isYoutubeVideoLink(url)) {
            var request = this.createRequestToYouPak(url);

            request.onreadystatechange = function () {
                if (Utils.isXMLHttpRequestDone(request)) {
                    var htmlDoc = Utils.getHTMLDocumentFromText(request.responseText),
                        videoTag = htmlDoc.getElementsByTagName("video")[0],
                        videoSources;

                    if (videoTag === undefined) {
                        callback(new NoVideoFoundException());
                        return;
                    }

                    videoSources = videoTag.children;

                    if (videoSources.length === 0) {
                        callback(new NoVideoFoundException());
                        return;
                    }

                    var links = Array.prototype.slice.call(videoSources).map(function (element) {
                        return element.src;
                    });

                    callback(
                        [
                            {
                                'resolution': 720,
                                'link': links[0]
                            }
                        ]
                    );
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
}());
