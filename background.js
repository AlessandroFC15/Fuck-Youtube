var url = '', urlID, tabID;

var getLinksFromYouPak = function(youtubeUrl) {
    var xhr = new XMLHttpRequest();

    xhr.open("GET", youtubeUrl.replace('tube', 'pak'), false);
    xhr.send();

    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(xhr.responseText, "text/html");

    var sources = htmlDoc.getElementsByTagName('video')[0].children;

    return Array.prototype.slice.call(sources).map(function(element) {
        return element.src;
    });
};

function redirectToMirror(classes) {
	if (typeof classes !== 'undefined') {
		if (classes.indexOf('hid') === -1) {
			var links = getLinksFromYouPak(url);

            console.log(links);

            chrome.tabs.sendMessage(tabID, {text: 'update_link', link: links[2]}, null);
            // chrome.tabs.update(urlID, {url: links[2]});
		}
	}
}

chrome.tabs.onUpdated.addListener(function (tab) {
	chrome.tabs.get(tab, function(tab_real) {
		url = tab_real.url;
		urlID = tab_real.id;

        tabID = tab_real.id;

		chrome.tabs.sendMessage(tab, {text: 'report_back'}, redirectToMirror);
	});
});