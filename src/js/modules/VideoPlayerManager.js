import VideoShortcutManager from './VideoShortcutManager';
import Sanitizer from './sanitizer';

/* globals VideoShortcutManager: FALSE, chrome */

/**
 * This component is responsible for behavior present in the video player that will be embedded within
 * the YouTube page.
 *
 * Inputs:
 *      - A video source
 *      - The outer div that the video player will be contained within
 *      - An interface manager, therefore, a YoutubeInterfaceManager object
 *
 * Results:
 *      - This component will create the video element and be responsible for all the behavior related to it.
 */

export default class VideoPlayerManager {
    constructor(videoLink, outerDiv, interfaceManager) {
        this.interfaceManager = interfaceManager;
        this.outerDiv = outerDiv;
        this.video = this.createVideoElement(videoLink);
        this.shortcutManager = new VideoShortcutManager(this.video);

        this.enableVisualFeedbacks();

        this.enableLastVolumeChosenToBeSaved();

        this.outerDiv.appendChild(this.video);
    };

    createVideoFunctions(video) {
        function roundBy2Decimals(number) {
            return Math.round(number * 100) / 100;
        }

        video.goForward = function (seconds) {
            this.currentTime += seconds;
        };

        video.goBack = function (seconds) {
            this.currentTime -= seconds;
        };

        video.togglePlayPause = function () {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }

            this.dispatchEvent(new Event("togglePlayPause"));
        };

        video.goToSpecificTime = function (seconds) {
            this.currentTime = seconds;
        };

        video.increaseVolumeBy5Percent = function () {
            this.volume = Math.min(roundBy2Decimals(this.volume + 0.05), 1);
        };

        video.decreaseVolumeBy5Percent = function () {
            this.volume = Math.max(0, roundBy2Decimals(this.volume - 0.05));
        };

        video.increaseSpeed = function () {
            this.playbackRate = Math.min(this.playbackRate + 0.25, 2);
        };

        video.decreaseSpeed = function () {
            this.playbackRate = Math.max(0.25, this.playbackRate - 0.25);
        };

        video.toggleMuteUnmuteAudio = function () {
            this.muted = !this.muted;
        };

        video.isFullScreenModeEnabled = function () {
            const fullScreenElement = this.ownerDocument.webkitFullscreenElement;

            // TO-DO: Will only work on Chrome

            return fullScreenElement !== null && fullScreenElement.tagName === "VIDEO";
        };

        video.toggleFullScreenMode = function () {
            if (this.isFullScreenModeEnabled()) {
                this.exitFullScreenMode();
            } else {
                this.enterFullScreenMode();
            }
        };

        video.enterFullScreenMode = function () {
            if (this.webkitRequestFullscreen) {
                // Chrome & Opera
                this.webkitRequestFullScreen();
            } else if (this.mozRequestFullScreen) {
                // Firefox
                this.mozRequestFullScreen();
            } else if (this.msRequestFullscreen) {
                // Internet Explorer 11
                this.msRequestFullscreen();
            }
        };

        video.exitFullScreenMode = function () {
            if (this.ownerDocument.webkitExitFullscreen) {
                // Chrome & Opera
                this.ownerDocument.webkitExitFullscreen();
            } else if (this.ownerDocument.mozCancelFullScreen) {
                // Firefox
                this.ownerDocument.mozCancelFullScreen();
            } else if (this.ownerDocument.msExitFullscreen) {
                // Internet Explorer 11
                this.ownerDocument.msExitFullscreen();
            }
        };
    };

    createVideoElement(videoLink) {
        const videoTag = this.outerDiv.ownerDocument.createElement("video"),
            srcTag = this.outerDiv.ownerDocument.createElement("source"),
            self = this;

        videoTag.controls = true;
        videoTag.autoplay = true;
        videoTag.name = "media";
        videoTag.style.width = "100%";
        videoTag.id = "videoTag";
        videoTag.className = "video-stream html5-main-video";
        videoTag.onloadstart = function (){
            self.interfaceManager.addFeedbackVideoAlmostReady();
        };

        this.createVideoFunctions(videoTag);

        this.enableFullScreenModeOnDoubleClick(videoTag);

        this.enablePlayPauseVideoControlOnClick(videoTag);

        srcTag.src = videoLink;
        srcTag.type = "video/mp4";
        srcTag.onerror = function () {
            self.interfaceManager.showFailureMessage();
        };

        videoTag.appendChild(srcTag);

        return videoTag;
    };

    enableVisualFeedbacks() {
        this.createAllFeedbackIcons();

        this.enablePlayPauseFeedback();
    };

    enablePlayPauseFeedback() {
        const self = this;

        this.video.addEventListener("togglePlayPause", function () {
            function updateVisualFeedback(isVideoPaused) {
                const feedback = self.interfaceManager.document.querySelector(isVideoPaused ? "#pauseFeedback" : "#playFeedback");

                feedback.style.cssText = '';

                setTimeout(function () {
                    feedback.style.cssText = "display: none;";
                }, 500);
            }

            updateVisualFeedback(this.paused);
        });
    };

    createAllFeedbackIcons() {
        const pauseFeedback = this.createFeedbackIcon('pauseFeedback', "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"),
            playFeedback = this.createFeedbackIcon('playFeedback', "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z");

        this.outerDiv.appendChild(pauseFeedback);
        this.outerDiv.appendChild(playFeedback);
    };

    createFeedbackIcon(id, svgPath) {
        let div = this.interfaceManager.document.createElement("div");

        div.innerHTML = Sanitizer.escapeHTML`<div id="${id}" class="ytp-bezel" role="status" data-layer="4" style="display: none;"> 
                                                <div class="ytp-bezel-icon">
                                                    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                                                        <use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-id-${id}"></use> 
                                                        <path class="ytp-svg-fill" d="${svgPath}" id="ytp-id-${id}"></path>
                                                    </svg>
                                                </div>
                                             </div>`;

        return div.childNodes[0];
    };

    removeVideo() {
        if (this.shortcutManager.video) {
            this.shortcutManager.video.parentNode.removeChild(this.shortcutManager.video);
            this.shortcutManager.video = null;
        }

        try {
            this.outerDiv.removeChild(this.video);
        } catch (exception) {
            console.log(exception);
        }
    };

    enablePlayPauseVideoControlOnClick(video) {
        video.addEventListener('click', function () {
            this.togglePlayPause();
        });
    };

    enableFullScreenModeOnDoubleClick(video) {
        video.addEventListener('dblclick', function () {
            video.toggleFullScreenMode();
        });
    };

    enableLastVolumeChosenToBeSaved () {
        const self = this;

        this.video.addEventListener("volumechange", function (event) {
            if (event.isTrusted) {
                chrome.storage.local.set({'volumeChosen': self.video.volume});
            }
        });
    };
}
