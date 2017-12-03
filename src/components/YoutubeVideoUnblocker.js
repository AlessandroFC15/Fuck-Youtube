/*global YoutubeInterfaceManager, MirrorFinder, chrome */

var YoutubeVideoUnblocker;

(function () {
    "use strict";

    var youtubeVideoUnblocker;

    YoutubeVideoUnblocker = function (document, url) {
        this.url = url;
        this.interfaceManager = null;
        this.observer = null;
        this.isVideoUnavailable = undefined;
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
        var self = this;

        if (this.interfaceManager.isYoutubeVideoUnavailableOldLayout(document)) {

            this.interfaceManager.enableTheaterModeForOldLayout();

            this.interfaceManager.showLoadingFeedback();

            // We send a message to an event page to retrieve the video mirrors because we found a limitation, in
            // which we are not allowed to make a HTTP request (to GenYouTube) from a HTTPS context (a YouTube page).
            // Therefore, we have to make the request from a background script, an event page and not from the
            // content script.
            chrome.runtime.sendMessage({
                action: "findMirrors",
                url: self.url
            }, function (response) {
                var highestQualityVideoLink;

                console.log(response);

                if (response instanceof Error) {
                    self.interfaceManager.showFailureMessageOldLayout();
                } else {
                     highestQualityVideoLink = response[0]['link'];

                    self.interfaceManager.createVideoFrameOldLayout(highestQualityVideoLink);
                }
            });
        }
    };

    YoutubeVideoUnblocker.prototype.executeForNewYouTubeLayout = function () {
        var self = this;

        this.observer = new MutationObserver(function (mutations) {
            if (self.interfaceManager.isYoutubeVideoUnavailable(mutations)) {
                if (self.isVideoUnavailable === undefined) {
                    self.isVideoUnavailable = true;

                    self.interfaceManager.makeNecessaryAdjustmentsToInterface();

                    // We send a message to an event page to retrieve the video mirrors because we found a limitation, in
                    // which we are not allowed to make a HTTP request (to GenYouTube) from a HTTPS context (a YouTube page).
                    // Therefore, we have to make the request from a background script, an event page and not from the
                    // content script.
                    chrome.runtime.sendMessage({
                        action: "findMirrors",
                        url: self.url
                    }, function (response) {
                        var highestQualityVideoLink;

                        if (response === undefined || response['name'] === "NoVideoFoundException") {
                            self.interfaceManager.showFailureMessage();
                        } else {
                            highestQualityVideoLink = response[0]['link'];

                            self.interfaceManager.createVideoFrame(highestQualityVideoLink);

                            self.interfaceManager.removeOldPlayerDiv();
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

    youtubeVideoUnblocker.execute();
}());
