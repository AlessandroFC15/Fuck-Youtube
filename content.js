"use strict";

var main = function () {
    var url = window.location.toString();

    if (isYoutubeVideoLink(url)) {
        if (isYoutubeVideoUnavailable(document)) {
            showLoadingFeedback();

            var request = createRequestToYouPak(url);

            // Because we're dealing with an async request, we have to implement the callback below.
            request.onreadystatechange = function() {
                if (isXMLHttpRequestDone(request)) {
                    try {
                        var links = findVideoLinksFromYouPak(request.responseText);

                        var highestQualityVideoLink = links[links.length - 1];

                        createVideoFrame(highestQualityVideoLink);
                    } catch (exception) {
                        showFailureMessage(exception);
                    }
                }
            };

            request.send();
        }
    }
};

var isYoutubeVideoLink = function (url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/.test(url);
};

/**
 * This function tells you if the youtube video is unavailable.
 * @param {HTMLDocument} document - The document of a youtube video page.
 */
var isYoutubeVideoUnavailable = function (document) {
    var divPlayerUnavailable = document.getElementById("player-unavailable");

    // Para que o vídeo seja considerado indisponível, é necessário que a div acima exista e que ela não a possua
    // classe "hid", visto que esta classe tem como função esconder os elementos.
    return divPlayerUnavailable !== undefined && divPlayerUnavailable.className.indexOf("hid") === -1;
};

var showLoadingFeedback = function () {
    replaceIconVideoUnavailable();

    var mainMessage = document.getElementById('unavailable-message');
    mainMessage.innerHTML = chrome.i18n.getMessage("workingToFindAMirrorMessage").replace('F*ck Youtube', "<span style='display: inline-block; color: red;'>F*ck Youtube</span>");

    var submainMessage = document.getElementById('unavailable-submessage');
    submainMessage.innerText = chrome.i18n.getMessage("loadingMessage") + '...';

    addSpinner();
};

// This functions replaces the Youtube icon used to represent a unavailable video with the extension's main icon.
var replaceIconVideoUnavailable = function () {
    var icon = document.getElementById("player-unavailable").getElementsByClassName("icon")[0];

    icon.setAttribute('previous_background_img', window.getComputedStyle(icon, null)['backgroundImage']);
    icon.style.backgroundImage = 'url(' + chrome.extension.getURL("/images/mainIcon.png") + ')';
};

var addIconVideoUnavailable = function () {
    var icon = document.getElementById("player-unavailable").getElementsByClassName("icon")[0];
    icon.style.backgroundImage = icon.getAttribute('previous_background_img');
};

var removeSpinner = function () {
    var spinner = document.getElementsByClassName("ytp-spinner")[0];

    if (spinner) {
        spinner.style.display = 'none';
    }
};

var addSpinner = function () {
    var mainMessage = document.getElementById('unavailable-message');

    mainMessage.innerHTML = '<div class="ytp-spinner" data-layer="4" style="left: 0; margin-left: 0; display: inline-block;position: relative;width: 28px;height: 22px;top: 5px;"><div class="ytp-spinner-dots">' +
        '<div class="ytp-spinner-dot ytp-spinner-dot-0"></div><div class="ytp-spinner-dot ytp-spinner-dot-1"></div>' +
        '<div class="ytp-spinner-dot ytp-spinner-dot-2"></div><div class="ytp-spinner-dot ytp-spinner-dot-3"></div>' +
        '<div class="ytp-spinner-dot ytp-spinner-dot-4"></div><div class="ytp-spinner-dot ytp-spinner-dot-5"></div>' +
        '<div class="ytp-spinner-dot ytp-spinner-dot-6"></div><div class="ytp-spinner-dot ytp-spinner-dot-7"></div></div>' +
        '<div class="ytp-spinner-message" style="display: none;">Se a reprodução não começar em instantes, reinicie seu dispositivo.</div></div>' + mainMessage.innerHTML;
};

// ------------------

var showFailureMessage = function (exception) {
    addIconVideoUnavailable();

    var mainMessage = document.getElementById('unavailable-message');
    mainMessage.innerText = "This video is unavailable!";

    var submainMessage = document.getElementById('unavailable-submessage');
    submainMessage.innerText = "We couldn't find a mirror. Sorry about that :(";

    removeSpinner();

    showErrorAlert();
};

var showErrorAlert = function () {
    var alertsDiv = document.getElementById('error-box') || document.getElementById('editor-progress-alert-template');

    alertsDiv.style.display = 'block';
    alertsDiv.classList.remove('yt-alert-warn');
    alertsDiv.classList.add("yt-alert-error");

    var alertContent = alertsDiv.getElementsByClassName('yt-alert-content')[0];
    alertContent.innerText = chrome.i18n.getMessage("noVideoFoundMessage") + " :(";
};

var createRequestToYouPak = function (url) {
    var request = new XMLHttpRequest();

    request.open("GET", url.replace("tube", "pak"), true);

    return request;
};

var isXMLHttpRequestDone = function (request) {
    // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
    // the number 4 represents DONE (" The operation is complete. ")
    return request.readyState == 4
};

var findVideoLinksFromYouPak = function (responseText) {
    var htmlDoc = getHTMLDocumentFromText(responseText);

    var videoTag = htmlDoc.getElementsByTagName("video")[0];

    if (videoTag === undefined) {
        throw new NoVideoFoundException()
    }

    var videoSources = videoTag.children;

    return Array.prototype.slice.call(videoSources).map(function (element) {
        return element.src;
    });
};

var getHTMLDocumentFromText = function (text) {
    return new DOMParser().parseFromString(text, "text/html");
};

var hideLoadingScreen = function () {
    document.getElementById("player-unavailable").style.display = "none";
};

var createVideoFrame = function (link) {
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

    // We will only hide the loading screen, when the video is ready to play.
    videoTag.oncanplay = function() {
        hideLoadingScreen();
    };

    var srcTag = document.createElement("source");
    srcTag.src = link;
    srcTag.type = "video/mp4";

    videoTag.appendChild(srcTag);
    divPlayerAPI.appendChild(videoTag);
};

// Exceptions

var NoVideoFoundException = function () {
    if (chrome.i18n) {
        this.message = chrome.i18n.getMessage("noVideoFoundMessage");
    } else {
        this.message = '';
    }

    this.name = 'NoVideoFoundException';
};

main();

