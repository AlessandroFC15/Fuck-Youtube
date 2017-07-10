/*global YoutubePageManager, YouPakRequestManager */

var YoutubeUnblocker;
(function () {
    "use strict";

    YoutubeUnblocker = function (document, url) {
        this.pageManager = new YoutubePageManager(document);
        this.requestManager = new YouPakRequestManager(url);
    };

    YoutubeUnblocker.prototype.execute = function () {
        var url = window.location.toString();

        if (this.pageManager.isYoutubeVideoLink(url)) {
            if (this.pageManager.isYoutubeVideoUnavailable(document)) {
                this.pageManager.enableTheaterMode(document);

                this.pageManager.showLoadingFeedback();

                var request = this.requestManager.createRequestToYouPak();

                var that = this;

                // Because we're dealing with an async request, we have to implement the callback below.
                request.onreadystatechange = function () {
                    if (that.requestManager.isXMLHttpRequestDone(request)) {
                        try {
                            var links = that.requestManager.findVideoLinksFromYouPak(request.responseText);

                            var highestQualityVideoLink = links[links.length - 1];

                            that.pageManager.createVideoFrame(highestQualityVideoLink);
                        } catch (exception) {
                            that.pageManager.showFailureMessage();
                        }
                    }
                };

                request.send();
            }
        }
    };
}());

new YoutubeUnblocker(document, window.location.toString()).execute();