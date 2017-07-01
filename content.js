"use strict";

var main = function () {
    var url = window.location.toString();

    if (isYoutubeLink(url)) {
        if (isVideoUnavailable()) {
            showLoadingFeedback();

            var request = createRequestToYoupak(url);

            // Because we're dealing with an async request, we have to implement the callback below.
            request.onreadystatechange = function() {
                if (isXMLHttpRequestDone(request)) {
                    var links = findVideoLinksFromYouPak(request);

                    hideWarningVideoUnavailable();

                    createVideoFrame(links[2]);
                }
            };

            request.send();
        }
    }
};

var isXMLHttpRequestDone = function (request) {
    // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
    // the number 4 represents DONE (" The operation is complete. ")

    return request.readyState == 4
};

var createRequestToYoupak = function (url) {
    var request = new XMLHttpRequest();

    request.open("GET", url.replace("tube", "pak"), true);

    return request;
};

var isYoutubeLink = function (url) {
    return /(\w*)youtube.com\/watch\?(\w*)/.test(url);
};

var isVideoUnavailable = function () {
    var divPlayerUnavailable = document.getElementById("player-unavailable");

    // Para que o vídeo seja considerado indisponível, é necessário que a div acima exista e que ela não a possua
    // classe "hid", visto que esta classe tem como função esconder os elementos.
    return divPlayerUnavailable !== undefined && divPlayerUnavailable.className.indexOf("hid") === -1;
};

var showLoadingFeedback = function () {
    var content = document.getElementById("player-unavailable").getElementsByClassName("content")[0];

    var icon = document.getElementById("player-unavailable").getElementsByClassName("icon")[0];
    icon.style.display = 'none';

    var mainMessage = document.getElementById('unavailable-message');
    mainMessage.innerText += " But don't you worry. F*ck Youtube's got your back!";

    var submainMessage = document.getElementById('unavailable-submessage');
    submainMessage.innerText = 'Loading video...'

    content.innerHTML += '<div class="ytp-spinner" data-layer="4"><div class="ytp-spinner-dots"><div class="ytp-spinner-dot ytp-spinner-dot-0"></div><div class="ytp-spinner-dot ytp-spinner-dot-1"></div><div class="ytp-spinner-dot ytp-spinner-dot-2"></div><div class="ytp-spinner-dot ytp-spinner-dot-3"></div><div class="ytp-spinner-dot ytp-spinner-dot-4"></div><div class="ytp-spinner-dot ytp-spinner-dot-5"></div><div class="ytp-spinner-dot ytp-spinner-dot-6"></div><div class="ytp-spinner-dot ytp-spinner-dot-7"></div></div><div class="ytp-spinner-message" style="display: none;">Se a reprodução não começar em instantes, reinicie seu dispositivo.</div></div>';
};

var findVideoLinksFromYouPak = function (request) {
    var htmlDoc = getHTMLDocumentFromRequest(request);

    var sources = htmlDoc.getElementsByTagName("video")[0].children;

    return Array.prototype.slice.call(sources).map(function (element) {
        return element.src;
    });
};

var getHTMLDocumentFromRequest = function (request) {
    return new DOMParser().parseFromString(request.responseText, "text/html");
};

var hideWarningVideoUnavailable = function () {
    var divPlayerUnavailable = document.getElementById("player-unavailable");
    divPlayerUnavailable.style.display = "none";
};

var createVideoFrame = function (link) {
    var divPlayerAPI = document.getElementById("player-api");
    // This shows the previously hidden player holder.
    divPlayerAPI.classList.remove("off-screen-target");

    var videoTag = document.createElement("video");
    videoTag.controls = true;
    videoTag.autoplay = true;
    videoTag.name = "media";
    videoTag.style.width = "100%";

    var srcTag = document.createElement("source");
    srcTag.src = link;
    srcTag.type = "video/mp4";

    videoTag.appendChild(srcTag);
    divPlayerAPI.appendChild(videoTag);
};

main();