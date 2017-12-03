/*global DOMParser, NoVideoFoundException, YouPakMirrorFinder, GenYouTubeMirrorFinder, chrome */

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

var MirrorFinder;
(function () {
    "use strict";

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.action === "findMirrors") {
                var mirrorFinder = new MirrorFinder();

                mirrorFinder.findMirrors(request.url, sendResponse);
            }

            // This 'return true' indicates that the call is async
            return true;
        });

    MirrorFinder = function () {
        this.genYouTubeMirrorFinder = new GenYouTubeMirrorFinder();
        this.youPakMirrorFinder = new YouPakMirrorFinder();
        // this.proxyMirrorFinder = new ProxyMirrorFinder();
    };

    MirrorFinder.prototype.findMirrors = function (url, callback) {
        var self = this;

        this.genYouTubeMirrorFinder.findMirrors(url, function (response) {
            if (response instanceof Error) {
                // In case of an error in GenYouTube, we will try to get from YouPak
                self.youPakMirrorFinder.findMirrors(url, function (response) {
                    callback(response);

                    /*// In case of an error in YouPak, we will try to get from another proxy
                    if (response instanceof Error) {
                        self.proxyMirrorFinder.findMirrors(url, function (response) {
                            callback(response);
                        })
                    } else {
                        callback(response);
                    }*/
                });
            } else {
                callback(response);
            }
        });
    };
}());
