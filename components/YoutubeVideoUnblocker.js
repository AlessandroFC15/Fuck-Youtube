/*global YoutubeInterfaceManager, MirrorFinder */

var YoutubeVideoUnblocker;

(function () {
    "use strict";

    var youtubeVideoUnblocker;

    YoutubeVideoUnblocker = function (document, url) {
        this.url = url;
        this.interfaceManager = null;
        this.observer = null;
        this.isVideoUnavailable = undefined;
        this.mirrorFinder = new MirrorFinder();
    };

    YoutubeVideoUnblocker.prototype.execute = function () {
        if (YoutubeVideoUnblocker.isYoutubeVideoLink(this.url)) {
            this.interfaceManager = new YoutubeInterfaceManager(document);

            if (this.isNewYouTubeLayout()) {
                this.executeForNewYouTubeLayout();
            } else {
                this.executeForOldYouTubeLayout();
            }
        }
    };

    YoutubeVideoUnblocker.prototype.executeForOldYouTubeLayout = function () {
        var request, self = this;

        if (this.interfaceManager.isYoutubeVideoUnavailableOldLayout(document)) {

            this.interfaceManager.enableTheaterModeForOldLayout();

            this.interfaceManager.showLoadingFeedback();

            this.mirrorFinder = new MirrorFinder(self.url);
            request = this.mirrorFinder.createRequestToYouPak();

            // Because we're dealing with an async request, we have to implement the callback below.
            request.onreadystatechange = function () {
                var links,
                    highestQualityVideoLink;

                if (self.mirrorFinder.isXMLHttpRequestDone(request)) {
                    try {
                        links = self.mirrorFinder.findVideoLinksFromYouPak(request.responseText);

                        highestQualityVideoLink = links[links.length - 1];

                        self.interfaceManager.createVideoFrameOldLayout(highestQualityVideoLink);
                    } catch (exception) {
                        self.interfaceManager.showFailureMessageOldLayout();
                    }
                }
            };

            request.send();
        }
    };

    YoutubeVideoUnblocker.prototype.executeForNewYouTubeLayout = function () {
        var request, self = this,
            links,
            highestQualityVideoLink;

        this.observer = new MutationObserver(function (mutations) {
            if (self.interfaceManager.isYoutubeVideoUnavailable(mutations)) {
                if (self.isVideoUnavailable === undefined) {
                    self.isVideoUnavailable = true;

                    self.interfaceManager.makeNecessaryAdjustmentsToInterface();

                    self.mirrorFinder.findMirrors(self.url, function (response) {
                        console.log(response);

                        if (response instanceof Error) {
                            self.interfaceManager.showFailureMessage();
                        } else {
                            highestQualityVideoLink = response['720'];

                            self.interfaceManager.createVideoFrame(highestQualityVideoLink);
                        }
                    });
                }
            }
        });

        this.observer.observe(document.body, {
            attributes: true,
            childList: true,
            characterData: false,
            subtree: true,
            attributeOldValue: true
        });
    };

    YoutubeVideoUnblocker.prototype.prepareForUrlChanges = function () {
        var self = this;

        // Set a interval to check for url changes
        setInterval(function () {
            if (self.url !== window.location.href) {
                if (self.interfaceManager) {
                    self.interfaceManager.resetChanges();
                }

                self.url = window.location.href;
                self.isVideoUnavailable = undefined;

                if (self.observer) {
                    self.observer.disconnect();
                }

                self.execute();
            }
        }, 500);
    };

    YoutubeVideoUnblocker.isYoutubeVideoLink = function (url) {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(url);
    };

    YoutubeVideoUnblocker.prototype.isNewYouTubeLayout = function () {
        return document.getElementById('watch7-content') === null;
    };

    youtubeVideoUnblocker = new YoutubeVideoUnblocker(document, window.location.toString());
    youtubeVideoUnblocker.prepareForUrlChanges();

    // youtubeVideoUnblocker.execute();
    console.log(new GenYouTubeMirrorFinder().findMirrors);

    chrome.runtime.sendMessage({
        action: "findMirrors",
        genYouTubeMirrorFinderCallback: new GenYouTubeMirrorFinder().findMirrors
    }, function (response) {
        console.log(response);
    });
}());
