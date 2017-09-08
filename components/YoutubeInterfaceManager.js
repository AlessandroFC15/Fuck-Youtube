/* globals chrome: FALSE, i18n: FALSE, VideoPlayerManager: FALSE */
/** @namespace chrome.extension.getURL **/
/** @namespace chrome.i18n.getMessage **/

/**
 * This component is responsible for all the changes made in the Youtube interface, such as adding/removing elements,
 * as well as checking if elements exists or not.
 *
 * Inputs:
 *      - A HTMLDocument object representing hopefully a YouTube video page.
 *
 * Results:
 *      - This component will make the necessary changes to the interface as requested by the user.
 */

var YoutubeInterfaceManager;
(function () {
    "use strict";

    YoutubeInterfaceManager = function (document) {
        this.document = document;
        this.videoPlayerManager = null;
    };

    YoutubeInterfaceManager.prototype.changeLoadingText = function () {
        var div, loadingMessage;

        div = this.document.querySelector('div.ytd-player-error-message-renderer');

        if (div) {
            div.innerHTML = chrome.i18n.getMessage("workingToFindAMirrorMessage").replace('F*ck Youtube',
                    "<span style='display: inline-block; color: #ff4646;'>F*ck Youtube</span>") + '</div>';
        }

        loadingMessage = this.document.createElement('div');
        loadingMessage.className = "text";
        loadingMessage.innerText = chrome.i18n.getMessage("loadingMessage");

        div.appendChild(loadingMessage);
    };

    YoutubeInterfaceManager.prototype.centerVideoPlayer = function () {
        var watchElement = this.document.getElementsByTagName('ytd-watch');

        if (watchElement.length > 0) {
            watchElement[0].setAttribute('theater-requested_', '');
            watchElement[0].setAttribute('theater', '');
        } else {
            throw new DOMException();
        }
    };

    YoutubeInterfaceManager.prototype.removeVideo = function () {
        document.querySelector('#player').setAttribute('hidden', '');

        if (this.videoPlayerManager) {
            this.videoPlayerManager.video.remove();
        }
    };

    YoutubeInterfaceManager.prototype.hideSidebar = function () {
        var sideBarDiv = this.document.getElementById('related');

        if (sideBarDiv) {
            sideBarDiv.setAttribute('hidden', '');
        }
    };

    YoutubeInterfaceManager.prototype.showSidebar = function () {
        var sideBarDiv = this.document.getElementById('related');

        if (sideBarDiv) {
            sideBarDiv.removeAttribute('hidden');
        }
    };

    YoutubeInterfaceManager.prototype.centerVideoInfo = function () {
        var divVideoInfoTop, divVideoInfoBottom;

        divVideoInfoTop = this.document.getElementById('info');
        if (divVideoInfoTop) {
            divVideoInfoTop.style.padding = "0";
        }

        divVideoInfoBottom = this.document.getElementById('meta');
        if (divVideoInfoBottom) {
            divVideoInfoBottom.style.padding = "0";
        }
    };

    YoutubeInterfaceManager.prototype.resetChangesToVideoInfo = function () {
        var divVideoInfoTop, divVideoInfoBottom;

        divVideoInfoTop = this.document.getElementById('info');
        if (divVideoInfoTop) {
            divVideoInfoTop.style.padding = null;
        }

        divVideoInfoBottom = this.document.getElementById('meta');
        if (divVideoInfoBottom) {
            divVideoInfoBottom.style.padding = null;
        }
    };

    YoutubeInterfaceManager.prototype.resetChanges = function () {
        this.removeVideo();

        this.showSidebar();

        this.resetChangesToVideoInfo();
    };

    YoutubeInterfaceManager.prototype.makeNecessaryAdjustmentsToInterface = function () {
        this.enableTheaterMode();

        this.replaceIconVideoUnavailable();

        this.changeLoadingText();

        this.addLoadingSpinner();
    };

    YoutubeInterfaceManager.prototype.isYoutubeVideoUnavailable = function (mutations) {
        var element, mutation, i;

        for (i = 0; i < mutations.length; i++) {
            mutation = mutations[i];

            if (mutation.target.nodeName === "YTD-PLAYABILITY-ERROR-SUPPORTED-RENDERERS") {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    return true;
                } else if (mutation.type === "attributes" && mutation.attributeName === "hidden") {
                    element = document.getElementsByTagName('ytd-playability-error-supported-renderers')[0];

                    if (!element.hidden) {
                        return true;
                    }
                }
            } else if (mutation.target.nodeName === "YT-PAGE-NAVIGATION-PROGRESS" &&
                mutation.type === "attributes" && mutation.attributeName === "hidden" && mutation.oldValue === null) {
                element = document.getElementsByTagName('ytd-playability-error-supported-renderers')[0];

                if (!element.hidden) {
                    return true;
                }
            }
        }

        return false;
    };

    YoutubeInterfaceManager.prototype.hideElement = function (element) {
        if (element) {
            element.style.display = "none";
        }
    };

    // This function enables theater mode on a Youtube video page, centering the video frame and also hides the sidebar
    YoutubeInterfaceManager.prototype.enableTheaterMode = function () {
        this.centerVideoPlayer();

        this.hideSidebar();

        this.centerVideoInfo();

        /* theaterBackground = this.document.getElementById("theater-background");
         theaterBackground.style.background = "transparent";
         */
    };

    // This function replaces the Youtube icon used to represent a unavailable video with the extension's main icon.
    YoutubeInterfaceManager.prototype.replaceIconVideoUnavailable = function () {
        var iconDiv, oldIconImg, newIconImg;

        iconDiv = this.document.querySelector('.ytd-player-error-message-renderer');
        oldIconImg = iconDiv.querySelector('img');
        oldIconImg.remove();

        newIconImg = this.document.createElement('img');
        newIconImg.src = chrome.extension.getURL("/images/mainIcon.png");
        iconDiv.appendChild(newIconImg);
    };

    YoutubeInterfaceManager.prototype.addIconVideoUnavailable = function () {
        var icon = this.document.getElementById("player-unavailable").getElementsByClassName("icon")[0];
        icon.style.backgroundImage = icon.getAttribute('previous_background_img');
    };

    YoutubeInterfaceManager.prototype.addLoadingSpinner = function () {
        var spinner, loadingText, loadingFeedbackDiv = this.document.getElementsByTagName('ytd-player-error-message-renderer');

        spinner = this.document.createElement('div');
        spinner.className = "ytp-spinner";
        spinner.id = "createdSpinner";
        spinner.style.display = "inline-block";
        spinner.style.position = "relative";
        spinner.style.width = "20px";
        spinner.style.top = "50px";
        spinner.style.left = "20px";
        spinner.innerHTML = '<div class="ytp-spinner-container">' +
            '<div class="ytp-spinner-rotator">' +
            '<div class="ytp-spinner-left">' +
            '<div class="ytp-spinner-circle"></div>' +
            '</div>' +
            '<div class="ytp-spinner-right">' +
            '<div class="ytp-spinner-circle"></div>' +
            '</div>' +
            '</div>' +
            '</div>';

        loadingFeedbackDiv[0].appendChild(spinner);
    };

    YoutubeInterfaceManager.prototype.removeSpinner = function () {
        this.document.getElementById('createdSpinner').remove();
    };

    YoutubeInterfaceManager.prototype.hideLoadingScreen = function () {
        this.hideElement(this.document.getElementById("player-unavailable"));
    };

    YoutubeInterfaceManager.prototype.createVideoFrame = function (link) {
        var outerDiv, divPlayerAPI, errorDiv, self = this, ytd_watch_div;

        this.removeSpinner();

        errorDiv = this.document.querySelector('ytd-playability-error-supported-renderers');
        errorDiv.removeAttribute('hidden');

        /*  ytd_watch_div = this.document.querySelector('ytd-watch');
         ytd_watch_div.setAttribute("hidden", '');
         */
        outerDiv = this.document.getElementById("player");
        outerDiv.removeAttribute('hidden');

        divPlayerAPI = this.document.getElementById("player-api");
        // This shows the previously hidden player holder.
        divPlayerAPI.classList.remove("off-screen-target");
        divPlayerAPI.innerHTML = '';

        //console.log(this.document.getElementById('movie_player'));

        // By creating the video player manager, we create the video frame
        this.videoPlayerManager = new VideoPlayerManager(link, divPlayerAPI, this);

        // We will only hide the loading screen, when the video is ready to play.
        this.videoPlayerManager.video.oncanplay = function () {
            self.hideLoadingScreen();
        };
    };

    // This function will remove the error alert shown by YouTube if it is present
    YoutubeInterfaceManager.prototype.removeErrorAlert = function () {
        this.hideElement(this.document.getElementById('error-box'));
    };

    YoutubeInterfaceManager.prototype.showErrorAlert = function () {
        var alertsDiv, alertContent, alertWrapper;

        alertsDiv = this.document.getElementById('error-box') || this.document.getElementById('editor-progress-alert-template');

        alertsDiv.style.display = 'block';
        alertsDiv.classList.remove('yt-alert-warn');
        alertsDiv.classList.add("yt-alert-error");

        alertContent = alertsDiv.getElementsByClassName('yt-alert-content')[0];
        alertContent.innerText = chrome.i18n.getMessage("noVideoFoundMessage") + " :(";

        alertWrapper = this.document.getElementsByClassName("alerts-wrapper")[0];

        if (alertWrapper) {
            alertWrapper.style.backgroundColor = "transparent";
        }
    };

    YoutubeInterfaceManager.prototype.showFailureMessage = function () {
        var mainMessage, submainMessage;

        this.addIconVideoUnavailable();

        mainMessage = this.document.getElementById('unavailable-message');
        mainMessage.innerText = chrome.i18n.getMessage("videoUnavailableMessage");

        submainMessage = this.document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("sorryMessage");

        this.removeSpinner();

        this.showErrorAlert();
    };
}());
