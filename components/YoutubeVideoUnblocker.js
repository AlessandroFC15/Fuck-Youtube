/*global YoutubeInterfaceManager, MirrorFinder */

var YoutubeVideoUnblocker;

(function () {
    "use strict";

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {

            if (mutation.type === "childList") {
                console.log(mutation);

                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeName == "YTD-APP") {
                        // Quando isso aqui acontecer, daí que podemos continuar a fazer as paradas

                        console.log(node);


                    }
                });
            }
        });
    });

    // configuration of the observer:
    var config = {attributes: true, childList: true, characterData: true};

    // pass in the target node, as well as the observer options
    observer.observe(document.body, config);

    YoutubeVideoUnblocker = function (document, url) {

        this.url = url;
        this.interfaceManager = new YoutubeInterfaceManager(document);
        this.mirrorFinder = new MirrorFinder(url);
    };

    YoutubeVideoUnblocker.prototype.execute = function () {
        var request,
            self = this;

        if (this.isYoutubeVideoLink()) {
            if (this.interfaceManager.isYoutubeVideoUnavailable()) {
                this.interfaceManager.enableTheaterMode(document);

                /*

                this.interfaceManager.showLoadingFeedback();

                request = this.mirrorFinder.createRequestToYouPak();

                // Because we're dealing with an async request, we have to implement the callback below.
                request.onreadystatechange = function () {
                    var links,
                        highestQualityVideoLink;

                    if (self.mirrorFinder.isXMLHttpRequestDone(request)) {
                        try {
                            links = self.mirrorFinder.findVideoLinksFromYouPak(request.responseText);

                            highestQualityVideoLink = links[links.length - 1];

                            self.interfaceManager.createVideoFrame(highestQualityVideoLink);
                        } catch (exception) {
                            console.log(exception);
                            self.interfaceManager.showFailureMessage();
                        }
                    }
                };

                 request.send();*/
            }
        }
    };

    YoutubeVideoUnblocker.prototype.isYoutubeVideoLink = function () {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(this.url);
    };

    new YoutubeVideoUnblocker(document, window.location.toString()).execute();
}());
