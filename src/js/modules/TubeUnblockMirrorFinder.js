import Utils from './Utils';
import { NoVideoFoundException, InvalidYouTubeVideoURLException } from './Exceptions';

/**
 * This component is responsible for finding a video source that works (a mirror)
 * It attempts to do so by making a request to a website called TubeUnblock
 *
 * Inputs:
 *      - A YouTube video url
 *
 * Results:
 *      - Hopefully, we find some video links when calling the function findMirrors.
 */

export default class TubeUnblockMirrorFinder {
    constructor() {
        this.baseUrl = "https://tubeunblock.me"
    }

    async findMirrors(youtubeVideoURL, callback) {
        const self = this;
        let mirrors = [];

        console.log('Trying TubeUnblock...');

        if (Utils.isYoutubeVideoLink(youtubeVideoURL)) {
            const tubeUnblockLink = youtubeVideoURL.replace("www.youtube.com", "tubeunblock.me");

            const request = await Utils.makeRequest(tubeUnblockLink);

            const htmlDoc = Utils.getHTMLDocumentFromText(request.responseText);

            // 1st Step
            // Find a link located in the source attribute of a specific iframe

            const iframePlayer = htmlDoc.getElementById('iframePlayer');

            if (! iframePlayer) {
                callback(new NoVideoFoundException());
                return;
            }

            const embedSrc = self.baseUrl + iframePlayer.getAttribute('src');

            // 2nd Step
            // Make a request to that link and look for the mirror in the response.
            // The link can be found among a Javascript code inside the response.
            // So, we need to do use ugly regex to get that.

            const newRequest = await Utils.makeRequest(embedSrc);

            const mirrorData = /updateSrc\(\[(.*?)\]\)/g.exec(newRequest.responseText);

            if (! mirrorData[1]) {
                callback(new NoVideoFoundException());
                return;
            }

            const videoSrc = /src: "(.*?)"/g.exec(mirrorData[1]);

            if (videoSrc[1]) {
                mirrors.push({
                    'resolution': 360,
                    'link': self.baseUrl + videoSrc[1]
                });

                callback(mirrors);
            } else {
                callback(new NoVideoFoundException());
            }
        } else {
            callback(new NoVideoFoundException());
        }
    };
}
