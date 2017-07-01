"use strict";

var main = function () {
    var url = window.location.toString();

    if (isYoutubeLink(url)) {
        if (isVideoUnavailable()) {
            showLoadingFeedback();

            var links = getLinksFromYouPak(url);

            hideWarningVideoUnavailable();

            createVideoFrame(links[2]);
        }
    }
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
    var warning = document.createElement("h1");
    warning.className = "message";
    warning.style.textAlign = "center";
    warning.innerHTML = "You know what? Fuck Youtube. Wait a second, we're loading a mirror for you...";

    var content = document.getElementById("player-unavailable").getElementsByClassName("content")[0];

    content.appendChild(document.createElement("br"));
    content.appendChild(warning);
};

var getLinksFromYouPak = function (youtubeUrl) {
    var youPakUrl = youtubeUrl.replace("tube", "pak");

    var htmlDoc = getHTMLDocumentFromUrl(youPakUrl);

    var sources = htmlDoc.getElementsByTagName("video")[0].children;

    return Array.prototype.slice.call(sources).map(function (element) {
        return element.src;
    });
};

var getHTMLDocumentFromUrl = function (url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();

    return new DOMParser().parseFromString(xhr.responseText, "text/html");
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