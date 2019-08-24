import YoutubeInterfaceManager from './modules/YoutubeInterfaceManager';
import { getIdFromYoutubeUrl } from "./utils";

class YoutubeVideoUnblocker {
    constructor(document, url) {
        this.document = document;
        this.url = url;
        this.interfaceManager = null;
        this.observer = null;
        this.isVideoUnavailable = undefined;
    };

    execute() {
        if (YoutubeVideoUnblocker.isYoutubeVideoLink(this.url)) {
            this.interfaceManager = new YoutubeInterfaceManager(document);

            if (this.isNewYouTubeLayout()) {
                this.executeForNewYouTubeLayout();
            } else {
                this.executeForOldYouTubeLayout();
            }
        }
    }

    executeForOldYouTubeLayout() {
        const self = this;

        if (this.interfaceManager.isYoutubeVideoUnavailableOldLayout(this.document)) {
            this.interfaceManager.enableTheaterModeForOldLayout();

            this.interfaceManager.showLoadingFeedback();

            self.getAlternativeVideoSrc(getIdFromYoutubeUrl(self.url))
                .then(url => {
                    url
                        ? self.interfaceManager.createVideoFrameOldLayout(url)
                        : self.interfaceManager.showFailureMessageOldLayout();
                })
                .catch(err => {
                    self.interfaceManager.showFailureMessageOldLayout();
                })
        }
    };

    executeForNewYouTubeLayout() {
        const self = this;

        this.observer = new MutationObserver(function (mutations) {
            if (self.interfaceManager.isYoutubeVideoUnavailable(mutations)) {
                if (self.isVideoUnavailable === undefined) {
                    self.isVideoUnavailable = true;

                    self.interfaceManager.makeNecessaryAdjustmentsToInterface();

                    self.getAlternativeVideoSrc(getIdFromYoutubeUrl(self.url))
                        .then(url => {
                            url
                                ? self.interfaceManager.createVideoFrame(url)
                                : self.interfaceManager.showFailureMessage();
                        })
                        .catch(err => {
                            self.interfaceManager.showFailureMessage();
                        })
                }
            }
        });

        this.observer.observe(document.body, {
            attributes: true,
            childList: true,
            characterData: false,
            subtree: true,
            attributeOldValue: true
        });
    };

    prepareForUrlChanges() {
        const self = this;

        // Set a interval to check for url changes
        setInterval(function () {
            if (self.url !== window.location.href) {
                if (self.interfaceManager) {
                    self.interfaceManager.resetChanges();
                }

                self.url = window.location.href;
                self.isVideoUnavailable = undefined;

                if (self.observer) {
                    self.observer.disconnect();
                }

                self.execute();
            }
        }, 500);
    };

    isNewYouTubeLayout() {
        return this.document.getElementById('watch7-content') === null;
    };

    getAlternativeVideoSrc(videoId) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage({
                    contentScriptQuery: "queryVideoSrc",
                    videoId: videoId
                }, url => resolve(url))
            } catch (err) {
                reject(err)
            }
        })
    }

    static isYoutubeVideoLink(url) {
        return (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/watch\?(.*)(v=.+)(.*)$/).test(url);
    };
}

const youtubeVideoUnblocker = new YoutubeVideoUnblocker(document, window.location.toString());
youtubeVideoUnblocker.prepareForUrlChanges();

youtubeVideoUnblocker.execute();
