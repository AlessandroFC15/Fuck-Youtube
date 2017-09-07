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
        this.mirrorFinder = null;
    };

    YoutubeVideoUnblocker.prototype.execute = function () {
        var self = this, request;

        if (this.isYoutubeVideoLink()) {
            this.interfaceManager = new YoutubeInterfaceManager(document);

            console.log('yt video');

            this.observer = new MutationObserver(function (mutations) {
                if (self.interfaceManager.isYoutubeVideoUnavailable(mutations)) {
                    if (self.isVideoUnavailable === undefined) {
                        self.isVideoUnavailable = true;

                        console.log("UNAVAILABLE");

                        self.interfaceManager.makeNecessaryAdjustmentsToInterface();

                        self.mirrorFinder = new MirrorFinder(self.url);
                        request = self.mirrorFinder.createRequestToYouPak();

                        // Because we're dealing with an async request, we have to implement the callback below.
                        request.onreadystatechange = function () {
                            var links,
                                highestQualityVideoLink;

                            if (self.mirrorFinder.isXMLHttpRequestDone(request)) {
                                try {
                                    links = self.mirrorFinder.findVideoLinksFromYouPak(request.responseText);

                                    highestQualityVideoLink = links[links.length - 1];

                                    console.log(highestQualityVideoLink);
                                    self.interfaceManager.createVideoFrame(highestQualityVideoLink);
                                } catch (exception) {
                                    console.log(exception);
                                    //self.interfaceManager.showFailureMessage();
                                }
                            }
                        };

                        request.send();


                    } else {
                        console.log("Vídeo já passou pelo processo");
                    }
                }
            });

            // pass in the target node, as well as the observer options
            this.observer.observe(document.body, {
                attributes: true,
                childList: true,
                characterData: false,
                subtree: true,
                attributeOldValue: true
            });
        }
    };

    YoutubeVideoUnblocker.prototype.prepareForUrlChanges = function () {
        var self = this;

        // Set a interval to check for url changes
        setInterval(function () {
            if (self.url !== window.location.href) {
                if (self.interfaceManager) {
                    if (self.interfaceManager.videoPlayerManager) {
                        console.log('mudou');
                        self.interfaceManager.videoPlayerManager.video.remove();
                        document.querySelector('#player').setAttribute('hidden', true);
                    }
                }

                // page has changed, set new page as 'current'
                self.url = window.location.href;
                self.isVideoUnavailable = undefined;

                if (self.observer) {
                    self.observer.disconnect();
                }

                self.execute();
            }
        }, 500);
    };

    YoutubeVideoUnblocker.prototype.isYoutubeVideoLink = function () {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(this.url);
    };

    youtubeVideoUnblocker = new YoutubeVideoUnblocker(document, window.location.toString());
    youtubeVideoUnblocker.prepareForUrlChanges();
    youtubeVideoUnblocker.execute();
}());
