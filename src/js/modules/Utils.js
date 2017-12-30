/*global YoutubeInterfaceManager, MirrorFinder */

export default class Utils {
    constructor() {};

    static isYoutubeVideoLink(url) {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(url);
    };

    static isXMLHttpRequestDone(request) {
        // According to the documentation available at https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState,
        // the number 4 represents DONE (" The operation is complete. ")
        return request.readyState === 4;
    };

    static getHTMLDocumentFromText(text) {
        return new DOMParser().parseFromString(text, "text/html");
    };

    static getIDFromYoutubeVideoLink (url) {
        if (this.isYoutubeVideoLink(url)) {
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;

            const match = url.match(regExp);

            return (match) ? match[7] : false;
        }
    }
}