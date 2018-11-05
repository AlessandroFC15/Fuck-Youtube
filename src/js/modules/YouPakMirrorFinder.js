import Utils from './Utils';
import { NoVideoFoundException, InvalidYouTubeVideoURLException } from './Exceptions';

/*global DOMParser, NoVideoFoundException, GenYouTubeMirrorFinder, Utils, InvalidYouTubeVideoURLException */

/**
 * This component is responsible for finding a video source that works (a mirror)
 * It attempts to do so by making a request to the YouPak website and finding their sources for the video.
 *
 * Inputs:
 *      - A YouTube video url
 *
 * Results:
 *      - Hopefully, we find some video links when calling the function findVideoLinksFromYouPak.
 */

export default class YouPakMirrorFinder {
    constructor() {}

    findMirrors(url, callback) {
        if (Utils.isYoutubeVideoLink(url)) {
            console.log('>> Trying YouPak <<');

            let request = this.createRequestToYouPak(url);

            request.onreadystatechange = function () {
                if (Utils.isXMLHttpRequestDone(request)) {
                    let htmlDoc = Utils.getHTMLDocumentFromText(request.responseText),
                        videoTag = htmlDoc.getElementsByTagName("video")[0],
                        videoSources;

                    if (videoTag === undefined) {
                        callback(new NoVideoFoundException());
                        return;
                    }

                    videoSources = videoTag.children;

                    if (videoSources.length === 0) {
                        callback(new NoVideoFoundException());
                        return;
                    }

                    console.log('Video Sources: ' + videoSources.length);

                    const links = Array.prototype.slice.call(videoSources).map(function (element) {
                        return element.src;
                    });

                    let numberLinksTested = 0;
                    let validLinkFound = false;

                    for (const link of links) {
                        let r = new XMLHttpRequest();

                        r.open("GET", link, true);

                        r.onreadystatechange = function () {
                            if (validLinkFound) {
                                return;
                            }

                            numberLinksTested += 1;

                            if (this.status === 200) {
                                validLinkFound = true;

                                callback(
                                    [
                                        {
                                            'resolution': 720,
                                            'link': this.responseURL
                                        }
                                    ]
                                );

                                return;
                            }

                            if (numberLinksTested === links.length) {
                                callback(new NoVideoFoundException());
                            }
                        };

                        r.send();
                    }
                }
            };

            request.send();
        } else {
            throw new InvalidYouTubeVideoURLException();
        }
    };

    createRequestToYouPak(url) {
        let request = new XMLHttpRequest();

        request.open("GET", url.replace("tube", "pak"), true);

        return request;
    };
}
