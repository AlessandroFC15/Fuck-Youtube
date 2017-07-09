/*global chrome, DOMParser*/

var YoutubeUnblocker = (function () {
    "use strict";

    var YoutubeUnblocker = function () {
        this.NoVideoFoundException = function () {
            if (chrome.i18n) {
                this.message = chrome.i18n.getMessage("noVideoFoundMessage");
            } else {
                this.message = '';
            }

            this.name = 'NoVideoFoundException';
        };
    };

    YoutubeUnblocker.prototype.isYoutubeVideoLink = function (url) {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(url);
    };

    /**
     * This function tells you if the youtube video is unavailable.
     * @param {HTMLDocument} document - The document of a youtube video page.
     */
    YoutubeUnblocker.prototype.isYoutubeVideoUnavailable = function (document) {
        var divPlayerUnavailable = document.getElementById("player-unavailable");

        // Para que o vídeo seja considerado indisponível, é necessário que a div acima exista e que ela não a possua
        // classe "hid", visto que esta classe tem como função esconder os elementos.
        return divPlayerUnavailable !== undefined && divPlayerUnavailable.className.indexOf("hid") === -1;
    };

    YoutubeUnblocker.prototype.hideElement = function (element) {
        if (element) {
            element.style.display = "none";
        }
    };

    /**
     * This function enables theater mode on a Youtube video page, centering the video frame and also hides the sidebar
     * @param {HTMLDocument} document - The document of a youtube video page.
     */
    YoutubeUnblocker.prototype.enableTheaterMode = function (document) {
        var theaterBackground = document.getElementById("theater-background");
        theaterBackground.style.background = "transparent";

        var divPage = document.getElementById("page");
        divPage.classList.add("watch-stage-mode");
        divPage.classList.add("watch-wide");
        divPage.style.marginTop = "7px";

        var divVideoInfo = document.getElementById("watch7-content");
        divVideoInfo.style.float = "none";
        divVideoInfo.style.margin = "auto";
        divVideoInfo.style.left = "0";
        divVideoInfo.classList.add("player-width");

        // We change the id, so that styles related to the old id don't apply anymore.
        divVideoInfo.id = "new-watch7-content";

        // Hiding the sidebar
        this.hideElement(document.getElementById("watch7-sidebar"));
    };

    // This function replaces the Youtube icon used to represent a unavailable video with the extension's main icon.
    YoutubeUnblocker.prototype.replaceIconVideoUnavailable = function () {
        var icon = document.getElementById("player-unavailable").getElementsByClassName("icon")[0];

        icon.setAttribute('previous_background_img', window.getComputedStyle(icon, null).backgroundImage);
        icon.style.backgroundImage = 'url(' + chrome.extension.getURL("/images/mainIcon.png") + ')';
    };

    // This function will remove the error alert shown by YouTube if it is present
    YoutubeUnblocker.prototype.removeErrorAlert = function () {
        this.hideElement(document.getElementById('error-box'));
    };

    YoutubeUnblocker.prototype.addSpinner = function () {
        var mainMessage = document.getElementById('unavailable-message');

        mainMessage.innerHTML = '<div class="ytp-spinner" data-layer="4" style="left: 0; margin-left: 0; display: inline-block;position: relative;width: 28px;height: 22px;top: 5px;"><div class="ytp-spinner-dots">' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-0"></div><div class="ytp-spinner-dot ytp-spinner-dot-1"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-2"></div><div class="ytp-spinner-dot ytp-spinner-dot-3"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-4"></div><div class="ytp-spinner-dot ytp-spinner-dot-5"></div>' +
            '<div class="ytp-spinner-dot ytp-spinner-dot-6"></div><div class="ytp-spinner-dot ytp-spinner-dot-7"></div></div>' +
            '<div class="ytp-spinner-message" style="display: none;">Se a reprodução não começar em instantes, reinicie seu dispositivo.</div></div>' + mainMessage.innerHTML;
    };

    YoutubeUnblocker.prototype.showLoadingFeedback = function () {
        this.replaceIconVideoUnavailable();

        this.removeErrorAlert();

        var mainMessage = document.getElementById('unavailable-message');
        mainMessage.innerHTML = chrome.i18n.getMessage("workingToFindAMirrorMessage").replace('F*ck Youtube', "<span style='display: inline-block; color: red;'>F*ck Youtube</span>");

        var submainMessage = document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("loadingMessage");

        this.addSpinner();
    };

    YoutubeUnblocker.prototype.createRequestToYouPak = function (url) {
        var request = new XMLHttpRequest();

        request.open("GET", url.replace("tube", "pak"), true);

        return request;
    };

    YoutubeUnblocker.prototype.isXMLHttpRequestDone = function (request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    YoutubeUnblocker.prototype.getHTMLDocumentFromText = function (text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

    YoutubeUnblocker.prototype.findVideoLinksFromYouPak = function (responseText) {
        var htmlDoc = this.getHTMLDocumentFromText(responseText);

        var videoTag = htmlDoc.getElementsByTagName("video")[0];

        if (videoTag === undefined) {
            throw new this.NoVideoFoundException();
        }

        var videoSources = videoTag.children;

        return Array.prototype.slice.call(videoSources).map(function (element) {
            return element.src;
        });
    };

    YoutubeUnblocker.prototype.hideLoadingScreen = function () {
        this.hideElement(document.getElementById("player-unavailable"));
    };

    YoutubeUnblocker.prototype.createVideoFrame = function (link) {
        var divPlayerAPI = document.getElementById("player-api");
        // This shows the previously hidden player holder.
        divPlayerAPI.classList.remove("off-screen-target");
        divPlayerAPI.innerHTML = '';

        console.log(document.getElementById('movie_player'));

        var videoTag = document.createElement("video");
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

        var srcTag = document.createElement("source");
        srcTag.src = link;
        srcTag.type = "video/mp4";

        videoTag.appendChild(srcTag);
        divPlayerAPI.appendChild(videoTag);
    };

    YoutubeUnblocker.prototype.addIconVideoUnavailable = function () {
        var icon = document.getElementById("player-unavailable").getElementsByClassName("icon")[0];
        icon.style.backgroundImage = icon.getAttribute('previous_background_img');
    };

    YoutubeUnblocker.prototype.removeSpinner = function () {
        this.hideElement(document.getElementsByClassName("ytp-spinner")[0]);
    };

    YoutubeUnblocker.prototype.showErrorAlert = function () {
        var alertsDiv = document.getElementById('error-box') || document.getElementById('editor-progress-alert-template');

        alertsDiv.style.display = 'block';
        alertsDiv.classList.remove('yt-alert-warn');
        alertsDiv.classList.add("yt-alert-error");

        var alertContent = alertsDiv.getElementsByClassName('yt-alert-content')[0];
        alertContent.innerText = chrome.i18n.getMessage("noVideoFoundMessage") + " :(";

        var alertWrapper = document.getElementsByClassName("alerts-wrapper")[0];
        if (alertWrapper) {
            alertWrapper.style.backgroundColor = "transparent";
        }
    };

    YoutubeUnblocker.prototype.showFailureMessage = function () {
        this.addIconVideoUnavailable();

        var mainMessage = document.getElementById('unavailable-message');
        mainMessage.innerText = chrome.i18n.getMessage("videoUnavailableMessage");

        var submainMessage = document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("sorryMessage");

        this.removeSpinner();

        this.showErrorAlert();
    };

    YoutubeUnblocker.prototype.execute = function () {
        var url = window.location.toString();

        if (this.isYoutubeVideoLink(url)) {
            if (this.isYoutubeVideoUnavailable(document)) {
                this.enableTheaterMode(document);

                this.showLoadingFeedback();

                var request = this.createRequestToYouPak(url);

                var youtubeUnblocker = this;

                // Because we're dealing with an async request, we have to implement the callback below.
                request.onreadystatechange = function () {

                    if (youtubeUnblocker.isXMLHttpRequestDone(request)) {
                        try {
                            var links = youtubeUnblocker.findVideoLinksFromYouPak(request.responseText);

                            var highestQualityVideoLink = links[links.length - 1];

                            youtubeUnblocker.createVideoFrame(highestQualityVideoLink);
                        } catch (exception) {
                            youtubeUnblocker.showFailureMessage();
                        }
                    }
                };

                request.send();
            }
        }
    };

    return YoutubeUnblocker;
}());

new YoutubeUnblocker().execute();