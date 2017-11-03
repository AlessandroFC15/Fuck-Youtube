// The links provided by the GenYoutube platform usually come with a parameter called title that makes the video
// get downloaded. This method aims to remove that parameter and return a link without that parameter
var removeTitleParameterFromLink = function (videoMirror) {
    function replaceRegex(match, p1, p2, offset, string) {
        if ((p1 === "?") || (p1 === p2)) {
            return p1;
        } else {
            return "";
        }
    }

    return videoMirror.replace(/(&|\?)title=.*?(&|$)/, replaceRegex);
};

var isXMLHttpRequestDone = function (request) {
    // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
    // the number 4 represents DONE (" The operation is complete. ")
    return request.readyState === 4;
};

var getHTMLDocumentFromText = function (text) {
    return new DOMParser().parseFromString(text, "text/html");
};

chrome.runtime.onMessage.addListener(
    function (req, sender, sendResponse) {
        console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
            "from the extension");
        if (req.action === "findMirrors") {
            console.log('findMirrors');

            var request = new XMLHttpRequest(),
                self = this, youtubeVideoURL = "https://www.youtube.com/watch?v=weeI1G46q0o";

            request.open("GET", youtubeVideoURL.replace("youtube", "genyoutube"), true);

            request.onreadystatechange = function () {
                if (isXMLHttpRequestDone(request)) {
                    var htmlDoc = getHTMLDocumentFromText(request.responseText),
                        hdVideoIcon = htmlDoc.getElementsByClassName("glyphicon-hd-video")[0],
                        sdVideoIcon = htmlDoc.getElementsByClassName("glyphicon-sd-video")[0],
                        mirrors = {},
                        linkTag;

                    if (hdVideoIcon) {
                        linkTag = hdVideoIcon.parentNode.parentNode;

                        mirrors['720'] = removeTitleParameterFromLink(linkTag.href);
                    }

                    if (sdVideoIcon) {
                        linkTag = sdVideoIcon.parentNode.parentNode;

                        mirrors['360'] = removeTitleParameterFromLink(linkTag.href);
                    }

                    console.log(mirrors);

                    if (Object.keys(mirrors).length === 0) {
                        //  callback(new NoVideoFoundException());
                        return;
                    }
                }
            };

            request.send();
        }
    });

(function () {
    console.log('eventPage');

    // var genYouTubeMirrorFinder = new GenYouTubeMirrorFinder();


}());

