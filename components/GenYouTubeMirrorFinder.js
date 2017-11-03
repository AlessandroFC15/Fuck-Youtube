/* global YoutubeVideoUnblocker, InvalidYouTubeVideoURLException, NoVideoFoundException */

/**
 * This component is responsible for finding a video source that works (a mirror)
 * It attempts to do so by making a request to the GenYouTube website and finding their sources for the video.
 *
 * Inputs:
 *      - A YouTube video url
 *
 * Results:
 *      - Hopefully, we find some video links when calling the function findMirrors.
 */

var GenYouTubeMirrorFinder;
(function () {
    "use strict";

    GenYouTubeMirrorFinder = function () {
    };

    GenYouTubeMirrorFinder.prototype.findMirrors = function (youtubeVideoURL, callback) {
        if (YoutubeVideoUnblocker.isYoutubeVideoLink(youtubeVideoURL)) {
            var request = new XMLHttpRequest(),
                self = this;

            request.open("GET", youtubeVideoURL.replace("youtube", "genyoutube"), true);

            request.onreadystatechange = function () {
                if (self.isXMLHttpRequestDone(request)) {
                    var htmlDoc = self.getHTMLDocumentFromText(request.responseText),
                        hdVideoIcon = htmlDoc.getElementsByClassName("glyphicon-hd-video")[0],
                        sdVideoIcon = htmlDoc.getElementsByClassName("glyphicon-sd-video")[0],
                        mirrors = {},
                        linkTag;

                    if (hdVideoIcon) {
                        linkTag = hdVideoIcon.parentNode.parentNode;

                        mirrors['720'] = self.removeTitleParameterFromLink(linkTag.href);
                    }

                    if (sdVideoIcon) {
                        linkTag = sdVideoIcon.parentNode.parentNode;

                        mirrors['360'] = self.removeTitleParameterFromLink(linkTag.href);
                    }

                    console.log(mirrors);

                    if (Object.keys(mirrors).length === 0) {
                        callback(new NoVideoFoundException());
                        return;
                    }

                    callback(mirrors);
                }
            };

            request.send();
        } else {
            throw new InvalidYouTubeVideoURLException();
        }
    };

    // The links provided by the GenYoutube platform usually come with a parameter called title that makes the video
    // get downloaded. This method aims to remove that parameter and return a link without that parameter
    GenYouTubeMirrorFinder.prototype.removeTitleParameterFromLink = function (videoMirror) {
        function replaceRegex(match, p1, p2, offset, string) {
            if ((p1 === "?") || (p1 === p2)) {
                return p1;
            } else {
                return "";
            }
        }

        return videoMirror.replace(/(&|\?)title=.*?(&|$)/, replaceRegex);
    };

    GenYouTubeMirrorFinder.prototype.isXMLHttpRequestDone = function (request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    GenYouTubeMirrorFinder.prototype.getHTMLDocumentFromText = function (text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

    /*MirrorFinder.prototype.findVideoLinksFromYouPak = function (responseText) {
     var htmlDoc = this.getHTMLDocumentFromText(responseText),
     videoTag = htmlDoc.getElementsByTagName("video")[0],
     videoSources = videoTag.children;

     if (videoTag === undefined) {
     throw new NoVideoFoundException();
     }

     return Array.prototype.slice.call(videoSources).map(function (element) {
     return element.src;
     });
     };*/
}());
