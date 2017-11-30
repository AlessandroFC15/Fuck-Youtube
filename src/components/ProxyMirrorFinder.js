/* global Utils, InvalidYouTubeVideoURLException, NoVideoFoundException */

/**
 * This component is responsible for finding a video source that works (a mirror)
 * It attempts to do so by making a request to a proxy offered by @unixfox and finding their sources for the video.
 *
 * Inputs:
 *      - A YouTube video url
 *
 * Results:
 *      - Hopefully, we find some video links when calling the function findMirrors.
 */

var ProxyMirrorFinder;
(function () {
    "use strict";

    ProxyMirrorFinder = function () {
        this.baseUrl = "https://fr.ytproxy.unixfox.eu"
    };

    ProxyMirrorFinder.prototype.findMirrors = function (youtubeVideoURL, callback) {
        console.log('Trying proxy...');

        if (Utils.isYoutubeVideoLink(youtubeVideoURL)) {
            var request = new XMLHttpRequest(),
                self = this;

            var idYoutubeVideo = Utils.getIDFromYoutubeVideoLink(youtubeVideoURL);

            if (! idYoutubeVideo) {
                callback(new NoVideoFoundException());
            }

            request.open("GET", this.baseUrl + "/target/" + idYoutubeVideo, true);

            request.onreadystatechange = function () {
                var responseData,
                    mirrors = [];

                if (Utils.isXMLHttpRequestDone(request)) {
                    responseData = JSON.parse(request.responseText);

                    console.log(responseData);

                    if (responseData.state === "success") {
                        mirrors.push({
                            'resolution': 360,
                            'link': self.baseUrl + responseData.link
                        });

                        callback(mirrors);
                    } else {
                        callback(new NoVideoFoundException());
                    }
                }
            };

            request.send();
        } else {
            throw new InvalidYouTubeVideoURLException();
        }
    };
}());
