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

    YoutubeInterfaceManager.prototype.isInterfaceReadyForEnablingTheaterMode = function (mutation) {
        var array = [].slice.call(mutation.addedNodes);

        return array.some(function (element) {
            return element.nodeName === "YTD-APP";
        });
    };

    YoutubeInterfaceManager.prototype.isInterfaceReadyForShowingLoadingFeedback = function (mutation) {
        return mutation.target.tagName === "YTD-PLAYABILITY-ERROR-SUPPORTED-RENDERERS" && mutation.addedNodes.length > 0;
    };

    YoutubeInterfaceManager.prototype.isInterfaceReadyToChangeLoadingText = function (mutation) {
        return mutation.target.tagName === "DIV" && mutation.target.id === "container";
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

    YoutubeInterfaceManager.prototype.makeNecessaryAdjustmentsToInterface = function () {
        //this.enableTheaterMode();
        this.replaceIconVideoUnavailable();
        this.changeLoadingText();
        //this.addLoadingSpinner();
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
        var watchElement, divPage, divVideoInfo;

        watchElement = this.document.getElementsByTagName('ytd-watch');

        if (watchElement.length > 0) {
            watchElement[0].setAttribute('theater-requested_', '');
            watchElement[0].setAttribute('theater', '');
        } else {
            throw new DOMException();
        }

        /* theaterBackground = this.document.getElementById("theater-background");
         theaterBackground.style.background = "transparent";

         divPage = this.document.getElementById("page");
         divPage.classList.add("watch-stage-mode");
         divPage.classList.add("watch-wide");
         divPage.style.marginTop = "7px";

         divVideoInfo = this.document.getElementById("watch7-content");
         divVideoInfo.style.float = "none";
         divVideoInfo.style.margin = "auto";
         divVideoInfo.style.left = "0";
         divVideoInfo.classList.add("player-width");

         // We change the id, so that styles related to the old id don't apply anymore.
         divVideoInfo.id = "new-watch7-content";

         // Hiding the sidebar
         this.hideElement(this.document.getElementById("watch7-sidebar"));*/
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
        var loadingFeedbackDiv = this.document.getElementsByTagName('ytd-player-error-message-renderer');

        var spinner = this.document.createElement('div');
        spinner.className = "ytp-spinner";
        spinner.style.display = "inline-block";
        spinner.style.position = "relative";
        spinner.style.top = "70px";
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
        this.hideElement(this.document.getElementsByClassName("ytp-spinner")[0]);
    };

    YoutubeInterfaceManager.prototype.hideLoadingScreen = function () {
        this.hideElement(this.document.getElementById("player-unavailable"));
    };

    YoutubeInterfaceManager.prototype.createVideoFrame = function (link) {
        var outerDiv, divPlayerAPI, errorDiv, self = this, ytd_watch_div;

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
