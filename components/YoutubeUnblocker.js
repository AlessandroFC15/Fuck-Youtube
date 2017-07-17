/*global YoutubePageManager, YouPakRequestManager */

var YoutubeUnblocker;
(function () {
    "use strict";

    YoutubeUnblocker = function (document, url) {
        this.pageManager = new YoutubePageManager(document);
        this.requestManager = new YouPakRequestManager(url);
    };

    YoutubeUnblocker.prototype.execute = function () {
        var url = window.location.toString(),
            request,
            self = this;

        if (this.pageManager.isYoutubeVideoLink(url)) {
            if (this.pageManager.isYoutubeVideoUnavailable(document)) {
                this.pageManager.enableTheaterMode(document);

                this.pageManager.showLoadingFeedback();

                request = this.requestManager.createRequestToYouPak();

                // Because we're dealing with an async request, we have to implement the callback below.
                request.onreadystatechange = function () {
                    var links,
                        highestQualityVideoLink;

                    if (self.requestManager.isXMLHttpRequestDone(request)) {
                        try {
                            links = self.requestManager.findVideoLinksFromYouPak(request.responseText);

                            highestQualityVideoLink = links[links.length - 1];

                            self.pageManager.createVideoFrame(highestQualityVideoLink);
                        } catch (exception) {
                            self.pageManager.showFailureMessage();
                        }
                    }
                };

                request.send();
            }
        }
    };

    new YoutubeUnblocker(document, window.location.toString()).execute();
}());
