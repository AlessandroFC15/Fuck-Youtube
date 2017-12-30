import GenYouTubeMirrorFinder from './GenYouTubeMirrorFinder';
import YouPakMirrorFinder from './YouPakMirrorFinder';
import ProxyMirrorFinder from './ProxyMirrorFinder';

/*global DOMParser, NoVideoFoundException, YouPakMirrorFinder, GenYouTubeMirrorFinder, chrome */

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

export default class MirrorFinder {
    constructor() {
        this.genYouTubeMirrorFinder = new GenYouTubeMirrorFinder();
        this.youPakMirrorFinder = new YouPakMirrorFinder();
        this.proxyMirrorFinder = new ProxyMirrorFinder();
    }

    findMirrors(url, callback) {
        const self = this;

        this.youPakMirrorFinder.findMirrors(url, function (response) {
            if (response instanceof Error) {
                // In case of an error in YouPak, we will try to get from GenYouTube
                self.genYouTubeMirrorFinder.findMirrors(url, function (response) {
                    // In case of an error in YouPak, we will try to get from another proxy
                    callback(response);

                    /*if (response instanceof Error) {
                        self.proxyMirrorFinder.findMirrors(url, function (response) {
                            callback(response);
                        })
                    } else {
                        callback(response);
                    }*/
                });
            } else {
                callback(response);
            }
        });



        /**/
    };
}