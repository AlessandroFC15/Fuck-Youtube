var url = '', urlID;

function redirectToMirror(classes) {
	if (typeof classes !== 'undefined') {
		if (classes.indexOf('hid') === -1) {
			chrome.tabs.update(urlID, {url: url.replace('tube', 'pak')});
		}
	}
}

chrome.tabs.onUpdated.addListener(function (tab) {
	chrome.tabs.get(tab, function(tab_real) {
		url = tab_real.url;
		urlID = tab_real.id;
		chrome.tabs.sendMessage(tab, {text: 'report_back'}, redirectToMirror);
	});
});