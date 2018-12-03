import VideoPlayerManager from './VideoPlayerManager';
import Sanitizer from "./sanitizer";

/* globals chrome: FALSE, i18n: FALSE, VideoPlayerManager: FALSE, DOMException */
/** @namespace chrome.extension.getURL **/
/** @namespace chrome.i18n.getMessage **/
/** @namespace chrome.storage.local **/

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

export default class YoutubeInterfaceManager {
    static tagNameErrorMessageRenderer = 'yt-player-error-message-renderer';

    constructor(document) {
        this.document = document;
        this.videoPlayerManager = null;
        this.oldPlayerDiv = null;
        this.oldPlayerDivParent = null;
        this.feedbackVideoAlmostReady = null;
    }

    changeLoadingText() {
        let div, loadingMessage, newDivMessage;

        div = this.document.querySelector(`div.${YoutubeInterfaceManager.tagNameErrorMessageRenderer}`);
        div.style.display = "none";

        newDivMessage = this.document.createElement("div");
        newDivMessage.id = "createdErrorMessageDiv";
        newDivMessage.style.color = "white";
        newDivMessage.style.textAlign = "center";
        newDivMessage.className = YoutubeInterfaceManager.tagNameErrorMessageRenderer;

        if (div) {
            const text = `<h1 style="margin-top: 40px">${chrome.i18n.getMessage("workingToFindAMirrorMessage").replace('F*ck Youtube',
                "<span style='display: inline-block; color: #e70200;'>F*ck Youtube</span>")}</h1>`;

            newDivMessage.innerHTML = Sanitizer.escapeHTML(text);
        }

        loadingMessage = this.document.createElement('div');
        loadingMessage.className = "text";
        loadingMessage.style.fontSize = "15px";
        loadingMessage.style.padding = "15px";
        loadingMessage.innerText = chrome.i18n.getMessage("loadingMessage");

        newDivMessage.appendChild(loadingMessage);

        div.parentNode.appendChild(newDivMessage);
    };

    centerVideoPlayer() {
        const watchElement = this.document.getElementsByTagName('ytd-watch-flexy');

        if (watchElement.length > 0) {
            watchElement[0].setAttribute('theater-requested_', '');
            // watchElement[0].setAttribute('theater', '');
        } else {
            throw new DOMException();
        }
    };

    removeVideo() {
        const playerSkeleton = document.querySelector('#player.skeleton');

        if (playerSkeleton) {
            playerSkeleton.setAttribute('hidden', '');
        }

        if (this.videoPlayerManager) {
            this.videoPlayerManager.removeVideo();
        }
    };

    hideSidebar() {
        const sideBarDiv = this.document.getElementById('related');

        if (sideBarDiv) {
            sideBarDiv.setAttribute('hidden', '');
        }
    };

    showSidebar() {
        const sideBarDiv = this.document.getElementById('related');

        if (sideBarDiv) {
            sideBarDiv.removeAttribute('hidden');
        }
    };

    centerVideoInfo() {
        let divVideoInfoTop, divVideoInfoBottom;

        divVideoInfoTop = this.document.getElementById('info');
        if (divVideoInfoTop) {
            divVideoInfoTop.style.padding = "0";
        }

        divVideoInfoBottom = this.document.getElementById('meta');
        if (divVideoInfoBottom) {
            divVideoInfoBottom.style.padding = "0";
        }
    };

    resetChangesToVideoInfo() {
        let divVideoInfoTop, divVideoInfoBottom;

        divVideoInfoTop = this.document.getElementById('info');
        if (divVideoInfoTop) {
            divVideoInfoTop.style.padding = null;
        }

        divVideoInfoBottom = this.document.getElementById('meta');
        if (divVideoInfoBottom) {
            divVideoInfoBottom.style.padding = null;
        }
    };

    resetChanges() {
        this.exitTheaterMode();

        this.showYouTubeVideoDiv();

        this.removeVideo();

        this.showSidebar();

        this.resetChangesToVideoInfo();

        this.resetChangesToOldPlayerDiv();
    };

    exitTheaterMode() {
        const ytdWatch = document.querySelector('ytd-watch-flexy');

        if (ytdWatch) {
            ytdWatch.removeAttribute('theater-requested_');
            ytdWatch.removeAttribute('theater');
        }
    };

    showYouTubeVideoDiv() {
        const youtubePlayerDiv = this.document.querySelector('ytd-player');

        if (youtubePlayerDiv) {
            youtubePlayerDiv.style.display = 'block';
        }
    };

    makeNecessaryAdjustmentsToInterface() {
        this.enableTheaterModeForNewLayout();

        this.adjustLayoutErrorDiv();

        this.replaceIconVideoUnavailable();

        this.changeLoadingText();

        this.addLoadingSpinner();
    };

    adjustLayoutErrorDiv() {
        const errorDiv = this.document.querySelector(YoutubeInterfaceManager.tagNameErrorMessageRenderer);

        errorDiv.style.flexDirection = 'column';
    }

    removeOldPlayerDiv() {
        const videoPlayer = this.document.getElementsByClassName("html5-video-player");

        this.oldPlayerDiv = videoPlayer[0];
        this.oldPlayerDivParent = this.oldPlayerDiv.parentNode;

        this.oldPlayerDiv.remove();
    };

    resetChangesToOldPlayerDiv() {
        if (this.oldPlayerDiv) {
            if (!this.oldPlayerDiv.parentNode) {
                this.oldPlayerDivParent.appendChild(this.oldPlayerDiv);
            }
        }

        let playerTheaterContainer = document.getElementById('player-theater-container');
        playerTheaterContainer.style.minHeight = '0';
        playerTheaterContainer.style.marginBottom = '0';

        document.getElementById('player-container').style.minHeight = '0';
    };

    isYoutubeVideoUnavailable(mutations) {
        let element, mutation, i;

        for (i = 0; i < mutations.length; i++) {
            mutation = mutations[i];

            if (mutation.target.nodeName === "YTD-APP" && mutation.type === 'childList'
                && mutation.addedNodes.length === 1) {
                if (document.getElementsByTagName('yt-player-error-message-renderer').length > 0) {
                    console.log(">> Aqui crl <<");

                    return true
                }
            }
        }

        return false;
    };

    hideElement(element) {
        if (element) {
            element.style.display = "none";
        }
    };

    // This function enables theater mode on a Youtube video page, centering the video frame and also hides the sidebar
    enableTheaterModeForNewLayout() {
        this.centerVideoPlayer();

        this.hideSidebar();

        this.centerVideoInfo();

        /* theaterBackground = this.document.getElementById("theater-background");
         theaterBackground.style.background = "transparent";
         */
    };

    // This function replaces the Youtube icon used to represent a unavailable video with the extension's main icon.
    replaceIconVideoUnavailable() {
        let iconDiv, oldIconImg, newIconImg;

        iconDiv = this.document.querySelector(YoutubeInterfaceManager.tagNameErrorMessageRenderer);
        oldIconImg = iconDiv.querySelector('yt-icon');
        oldIconImg.style.display = 'none';

        newIconImg = this.document.createElement('img');
        newIconImg.src = chrome.extension.getURL("/assets/128.png");
        newIconImg.setAttribute('unavailable-src', '/yts/img/meh7-vflGevej7.png');
        newIconImg.style.marginTop = '50px';

        iconDiv.insertBefore(newIconImg, iconDiv.firstChild);
    };

    addIconVideoUnavailable() {
        const icon = this.document.querySelector('.yt-playability-error-supported-renderers img');

        icon.src = icon.getAttribute('unavailable-src');
    };

    addLoadingSpinner() {
        let spinner,
            loadingFeedbackDiv = this.document.getElementsByTagName(YoutubeInterfaceManager.tagNameErrorMessageRenderer);

        spinner = this.document.createElement('div');
        spinner.className = "ytp-spinner";
        spinner.id = "createdSpinner";
        spinner.style.display = "inline-block";
        spinner.style.position = "relative";
        spinner.style.width = "20px";
        spinner.style.top = "-100px";
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

    removeSpinner() {
        this.document.getElementById('createdSpinner').remove();
    };

    hideLoadingScreen() {
        this.hideElement(this.document.getElementById("player-unavailable"));
    };

    createVideoFrame(link) {
        let fuckYoutubePlayerDiv, divPlayerAPI, errorDiv, self = this, youtubePlayerDiv, outerDiv;

        outerDiv = this.document.querySelector('#player-container');

        this.removeSpinner();

        errorDiv = this.document.querySelector('yt-playability-error-supported-renderers');
        errorDiv.removeAttribute('hidden');

        let minHeight = '500px';

        fuckYoutubePlayerDiv = this.document.getElementById("player");
        fuckYoutubePlayerDiv.removeAttribute('hidden');
        fuckYoutubePlayerDiv.style.marginTop = '0';
        fuckYoutubePlayerDiv.style.width = "100%";
        fuckYoutubePlayerDiv.style.minHeight = minHeight;
        fuckYoutubePlayerDiv.style.backgroundColor = "rgb(35,35,35)";

        document.getElementById('player-container').style.minHeight = minHeight;

        let playerTheaterContainer = document.getElementById('player-theater-container');

        playerTheaterContainer.style.minHeight = minHeight;
        playerTheaterContainer.style.marginBottom = "20px";

        youtubePlayerDiv = this.document.querySelector('ytd-player');
        youtubePlayerDiv.style.display = 'none';
        outerDiv.insertAdjacentElement('afterbegin', fuckYoutubePlayerDiv);

        divPlayerAPI = this.document.getElementById("player-api");
        // This shows the previously hidden player holder.
        divPlayerAPI.classList.remove("off-screen-target");
        divPlayerAPI.innerHTML = '';

        // By creating the video player manager, we create the video frame
        this.videoPlayerManager = new VideoPlayerManager(link, divPlayerAPI, this);

        // We will only hide the loading screen, when the video is ready to play.
        this.videoPlayerManager.video.oncanplay = function () {
            self.hideLoadingScreen();
            self.removeFeedbackVideoAlmostReady();

            chrome.storage.local.get('volumeChosen', function (data) {
                if (data.volumeChosen) {
                    self.videoPlayerManager.video.volume = data.volumeChosen;
                }
            });
        };
    };

    // This function will remove the error alert shown by YouTube if it is present
    removeErrorAlert() {
        this.hideElement(this.document.getElementById('error-box'));
    };

    showFailureMessage() {
        let mainMessage;

        this.addIconVideoUnavailable();

        mainMessage = this.document.querySelector('#createdErrorMessageDiv');
        mainMessage.innerHTML = Sanitizer.escapeHTML`<p style="font-size: 20px; margin-top: 20px">${chrome.i18n.getMessage("noVideoFoundMessage")} :(</p></br>`;

        this.removeSpinner();

        // this.showErrorAlert();
    };

    addFeedbackVideoAlmostReady() {
        this.feedbackVideoAlmostReady = document.createElement('p');

        this.feedbackVideoAlmostReady.innerHTML = Sanitizer.escapeHTML(chrome.i18n.getMessage("videoAlmostReadyMessage") + "<br>" + chrome.i18n.getMessage("lastWaitingMessage"));
        this.feedbackVideoAlmostReady.style.position = "absolute";
        this.feedbackVideoAlmostReady.style.width = "100%";
        this.feedbackVideoAlmostReady.style.top = "40%";
        this.feedbackVideoAlmostReady.style.fontSize = "18px";
        this.feedbackVideoAlmostReady.style.color = "hsla(0, 0%, 100%, .8)";
        this.feedbackVideoAlmostReady.style.textAlign = "center";

        let parentDiv = document.getElementById('videoTag').parentNode.parentNode;

        parentDiv.appendChild(this.feedbackVideoAlmostReady);
    };

    removeFeedbackVideoAlmostReady() {
        this.feedbackVideoAlmostReady.remove();
    };

    // -------------------- OLD LAYOUT ------------------ //

    enableTheaterModeForOldLayout() {
        let theaterBackground, divPage, divVideoInfo;

        theaterBackground = this.document.getElementById("theater-background");
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
        this.hideElement(this.document.getElementById("watch7-sidebar"));
    };

    showLoadingFeedback() {
        let mainMessage, submainMessage;

        this.replaceIconVideoUnavailableOldLayout();

        this.removeErrorAlert();

        mainMessage = this.document.getElementById('unavailable-message');
        mainMessage.innerHTML = Sanitizer.escapeHTML(chrome.i18n.getMessage("workingToFindAMirrorMessage").replace('F*ck Youtube', "<span style='display: inline-block; color: #ff4646;'>F*ck Youtube</span>"));

        submainMessage = this.document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("loadingMessage");

        this.addLoadingSpinnerOldLayout();
    };

    // This function replaces the Youtube icon used to represent a unavailable video with the extension's main icon.
    replaceIconVideoUnavailableOldLayout() {
        const icon = this.document.getElementById("player-unavailable").getElementsByClassName("icon")[0];

        icon.setAttribute('previous_background_img', window.getComputedStyle(icon, null).backgroundImage);

        icon.style.backgroundImage = 'url(' + chrome.extension.getURL("/assets/128.png") + ')';
        icon.style.backgroundPosition = "center";
    };

    addLoadingSpinnerOldLayout() {
        let mainMessage = this.document.getElementById('unavailable-message');

        let spinner = this.document.createElement('div');
        spinner.className = "ytp-spinner";
        spinner.style.display = "inline-block";
        spinner.style.position = "relative";
        spinner.style.width = "22px";
        spinner.style.top = "-8px";
        spinner.style.marginRight = "10px";
        spinner.style.left = "0";
        spinner.style.marginLeft = "0px";
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

        mainMessage.insertAdjacentElement('afterbegin', spinner);
    };

    createVideoFrameOldLayout(link) {
        let divPlayerAPI, self = this;

        divPlayerAPI = this.document.getElementById("player-api");
        // This shows the previously hidden player holder.
        divPlayerAPI.classList.remove("off-screen-target");
        divPlayerAPI.innerHTML = '';

        // By creating the video player manager, we create the video frame
        this.videoPlayerManager = new VideoPlayerManager(link, divPlayerAPI, this);

        // We will only hide the loading screen, when the video is ready to play.
        this.videoPlayerManager.video.oncanplay = function () {
            self.hideLoadingScreen();
        };
    };

    showFailureMessageOldLayout() {
        let mainMessage, submainMessage;

        this.addIconVideoUnavailableOldLayout();

        mainMessage = this.document.getElementById('unavailable-message');
        mainMessage.innerText = chrome.i18n.getMessage("videoUnavailableMessage");

        submainMessage = this.document.getElementById('unavailable-submessage');
        submainMessage.innerText = chrome.i18n.getMessage("sorryMessage");

        this.removeSpinnerOldLayout();

        this.showErrorAlert();
    };

    addIconVideoUnavailableOldLayout() {
        const icon = this.document.getElementById("player-unavailable").getElementsByClassName("icon")[0];
        icon.style.backgroundImage = icon.getAttribute('previous_background_img');
    };

    removeSpinnerOldLayout() {
        this.hideElement(this.document.getElementsByClassName("ytp-spinner")[0]);
    };

    showErrorAlert() {
        let alertsDiv, alertContent, alertWrapper;

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

    isYoutubeVideoUnavailableOldLayout() {
        const divPlayerUnavailable = this.document.getElementById("player-unavailable");

        // Para que o vídeo seja considerado indisponível, é necessário que a div acima exista e que ela não a possua
        // classe "hid", visto que esta classe tem como função esconder os elementos.
        return divPlayerUnavailable && divPlayerUnavailable.className.indexOf("hid") === -1;
    };
}
