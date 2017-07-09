/*global chrome, DOMParser, NoVideoFoundException */

var YoutubePageManager;
(function () {
    "use strict";

    /**
     * This component is responsible for all the changes made in the Youtube interface, such as adding/removing elements,
     * as well as checking if elements exists or not..
     * @param {HTMLDocument} document - The document of a page.
     */
    YoutubePageManager = function (document) {
        this.document = document;
    };

    YoutubePageManager.prototype.isYoutubeVideoLink = function (url) {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(url);
    };

    /**
     * This function tells you if the youtube video is unavailable.
     * @param {HTMLDocument} document - The document of a youtube video page.
     */
    YoutubePageManager.prototype.isYoutubeVideoUnavailable = function () {
        var divPlayerUnavailable = this.document.getElementById("player-unavailable");

        // Para que o vídeo seja considerado indisponível, é necessário que a div acima exista e que ela não a possua
        // classe "hid", visto que esta classe tem como função esconder os elementos.
        return divPlayerUnavailable !== undefined && divPlayerUnavailable.className.indexOf("hid") === -1;
    };

    YoutubePageManager.prototype.hideElement = function (element) {
        if (element) {
            element.style.display = "none";
        }
    };

    /**
     * This function enables theater mode on a Youtube video page, centering the video frame and also hides the sidebar
     */
    YoutubePageManager.prototype.enableTheaterMode = function () {
        var theaterBackground = this.document.getElementById("theater-background");
        theaterBackground.style.background = "transparent";

        var divPage = this.document.getElementById("page");
        divPage.classList.add("watch-stage-mode");
        divPage.classList.add("watch-wide");
        divPage.style.marginTop = "7px";

        var divVideoInfo = this.document.getElementById("watch7-content");
        divVideoInfo.style.float = "none";
        divVideoInfo.style.margin = "auto";
        divVideoInfo.style.left = "0";
        divVideoInfo.classList.add("player-width");

        // We change the id, so that styles related to the old id don't apply anymore.
        divVideoInfo.id = "new-watch7-content";

        // Hiding the sidebar
        this.hideElement(this.document.getElementById("watch7-sidebar"));
    };

    // This function replaces the Youtube icon used to represent a unavailable video with the extension's main icon.
    YoutubePageManager.prototype.replaceIconVideoUnavailable = function () {
        var icon = this.document.getElementById("player-unavailable").getElementsByClassName("icon")[0];

        icon.setAttribute('previous_background_img', window.getComputedStyle(icon, null).backgroundImage);
        icon.style.backgroundImage = 'url(' + chrome.extension.getURL("/images/mainIcon.png") + ')';
    };

    // This function will remove the error alert shown by YouTube if it is present
    YoutubePageManager.prototype.removeErrorAlert = function () {
        this.hideElement(this.document.getElementById('error-box'));
    };

    YoutubePageManager.prototype.addSpinner = function () {
        var mainMessage = this.document.getElementById('unavailable-message');

        mainMessage.innerHTML = '<div class="ytp-spinner" data-layer="4" style="left: 0; margin-left: 0; display: inline-block;position: relative;width: 28px;height: 22px;top: 5px;"><div class="ytp-spinner-dots">' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-0"></div><div class="ytp-spinner-dot ytp-spinner-dot-1"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-2"></div><div class="ytp-spinner-dot ytp-spinner-dot-3"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-4"></div><div class="ytp-spinner-dot ytp-spinner-dot-5"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-6"></div><div class="ytp-spinner-dot ytp-spinner-dot-7"></div></div>' +
            '<div class="ytp-spinner-message" style="display: none;">Se a reprodução não começar em instantes, reinicie seu dispositivo.</div></div>' + mainMessage.innerHTML;
    };

    YoutubePageManager.prototype.showLoadingFeedback = function () {
        this.replaceIconVideoUnavailable();

        this.removeErrorAlert();

        var mainMessage = this.document.getElementById('unavailable-message');
        mainMessage.innerHTML = chrome.i18n.getMessage("workingToFindAMirrorMessage").replace('F*ck Youtube', "<span style='display: inline-block; color: red;'>F*ck Youtube</span>");

        var submainMessage = this.document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("loadingMessage");

        this.addSpinner();
    };

    YoutubePageManager.prototype.hideLoadingScreen = function () {
        this.hideElement(this.document.getElementById("player-unavailable"));
    };

    YoutubePageManager.prototype.createVideoFrame = function (link) {
        var divPlayerAPI = this.document.getElementById("player-api");
        // This shows the previously hidden player holder.
        divPlayerAPI.classList.remove("off-screen-target");
        divPlayerAPI.innerHTML = '';

        console.log(this.document.getElementById('movie_player'));

        var videoTag = this.document.createElement("video");
        videoTag.controls = true;
        videoTag.autoplay = true;
        videoTag.name = "media";
        videoTag.style.width = "100%";
        videoTag.id = "videoTag";

        window.postMessage({type: "ENABLE_VIDEO_SHORTCUTS", videoTagId: videoTag.id}, "*");

        var that = this;

        // We will only hide the loading screen, when the video is ready to play.
        videoTag.oncanplay = function () {
            that.hideLoadingScreen();
        };

        var srcTag = this.document.createElement("source");
        srcTag.src = link;
        srcTag.type = "video/mp4";

        videoTag.appendChild(srcTag);
        divPlayerAPI.appendChild(videoTag);
    };

    YoutubePageManager.prototype.addIconVideoUnavailable = function () {
        var icon = this.document.getElementById("player-unavailable").getElementsByClassName("icon")[0];
        icon.style.backgroundImage = icon.getAttribute('previous_background_img');
    };

    YoutubePageManager.prototype.removeSpinner = function () {
        this.hideElement(this.document.getElementsByClassName("ytp-spinner")[0]);
    };

    YoutubePageManager.prototype.showErrorAlert = function () {
        var alertsDiv = this.document.getElementById('error-box') || this.document.getElementById('editor-progress-alert-template');

        alertsDiv.style.display = 'block';
        alertsDiv.classList.remove('yt-alert-warn');
        alertsDiv.classList.add("yt-alert-error");

        var alertContent = alertsDiv.getElementsByClassName('yt-alert-content')[0];
        alertContent.innerText = chrome.i18n.getMessage("noVideoFoundMessage") + " :(";

        var alertWrapper = this.document.getElementsByClassName("alerts-wrapper")[0];
        if (alertWrapper) {
            alertWrapper.style.backgroundColor = "transparent";
        }
    };

    YoutubePageManager.prototype.showFailureMessage = function () {
        this.addIconVideoUnavailable();

        var mainMessage = this.document.getElementById('unavailable-message');
        mainMessage.innerText = chrome.i18n.getMessage("videoUnavailableMessage");

        var submainMessage = this.document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("sorryMessage");

        this.removeSpinner();

        this.showErrorAlert();
    };

}());

var YouPakRequestManager;
(function () {
    "use strict";

    YouPakRequestManager = function (url) {
        this.url = url;
    };

    YouPakRequestManager.prototype.createRequestToYouPak = function () {
        var request = new XMLHttpRequest();

        request.open("GET", this.url.replace("tube", "pak"), true);

        return request;
    };

    YouPakRequestManager.prototype.isXMLHttpRequestDone = function (request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    YouPakRequestManager.prototype.getHTMLDocumentFromText = function (text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

    YouPakRequestManager.prototype.findVideoLinksFromYouPak = function (responseText) {
        var htmlDoc = this.getHTMLDocumentFromText(responseText);

        var videoTag = htmlDoc.getElementsByTagName("video")[0];

        if (videoTag === undefined) {
            throw new NoVideoFoundException();
        }

        var videoSources = videoTag.children;

        return Array.prototype.slice.call(videoSources).map(function (element) {
            return element.src;
        });
    };
}());

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