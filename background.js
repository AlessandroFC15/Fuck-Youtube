var url = '', urlID, tabID;

var getHTMLDocumentFromUrl = function (url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();

    return new DOMParser().parseFromString(xhr.responseText, "text/html");
};

var getLinksFromYouPak = function (youtubeUrl) {
    var youPakUrl = youtubeUrl.replace('tube', 'pak');

    var htmlDoc = getHTMLDocumentFromUrl(youPakUrl);

    var sources = htmlDoc.getElementsByTagName('video')[0].children;

    return Array.prototype.slice.call(sources).map(function (element) {
        return element.src;
    });
};

var redirectToMirror = function (classes) {
    if (typeof classes !== 'undefined') {
        if (classes.indexOf('hid') === -1) {
            var links = getLinksFromYouPak(url);

            chrome.tabs.sendMessage(tabID, {text: 'update_link', link: links[2]}, null);
        }
    }
};

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status && changeInfo.status == 'complete') {
        chrome.tabs.get(tabId, function (tab_real) {
            url = tab_real.url;
            urlID = tab_real.id;

            tabID = tab_real.id;

            chrome.tabs.sendMessage(tabId, {text: 'report_back'}, redirectToMirror);
        });
    }
});