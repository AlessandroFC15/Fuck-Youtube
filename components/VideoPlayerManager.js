/*globals VideoShortcutManager*/

var VideoPlayerManager;
(function () {
    "use strict";

    VideoPlayerManager = function (youtubePageManager, videoLink) {
        this.youtubePageManager = youtubePageManager;
        this.videoLink = videoLink;
        this.videoTag = this.createVideoFrame();
        this.shortcutManager = null;

        if (this.videoTag) {
            this.controlsBar = this.createVideoControls();
        }
    };

    VideoPlayerManager.prototype.createVideoFrame = function () {
        var video = this.youtubePageManager.document.createElement("video"),
            source = this.youtubePageManager.document.createElement("source"),
            videoDiv = this.youtubePageManager.document.createElement('div'),
            self = this;

        video.controls = false;
        video.autoplay = false;
        video.name = "media";
        video.style.width = "100%";
        video.id = "videoTag";
        // We will only hide the loading screen, when the video is ready to play.
        video.oncanplay = function () {
            self.youtubePageManager.hideLoadingScreen();
        };

        this.shortcutManager = new VideoShortcutManager(video);
        this.shortcutManager.enableYouTubeShortcuts();

        video.addEventListener('click', function () {
            this.togglePlayPause();
        });

        video.addEventListener("togglePlayPause", function () {
            function updateVisualFeedback(isVideoPaused) {
                var feedback = self.youtubePageManager.document.querySelector(isVideoPaused ? "#pauseFeedback" : "#playFeedback");

                feedback.style.cssText = '';

                setTimeout(function () {
                    feedback.style.cssText = "display: none;";
                }, 500);
            }

            self.youtubePageManager.document.querySelector('#playPauseBtn').updateButton(this.paused);

            updateVisualFeedback(this.paused);
        });

        source.src = this.videoLink;
        source.type = "video/mp4";
        source.onerror = function () {
            self.youtubePageManager.showFailureMessage();
            return null;
        };

        video.appendChild(source);
        videoDiv.appendChild(video);

        this.createPlayPauseFeedback(videoDiv);

        return videoDiv;
    };

    VideoPlayerManager.prototype.createVideoControls = function () {
        var outerDiv = this.youtubePageManager.document.createElement('div'),
            chromeControls = this.youtubePageManager.document.createElement("div"),
            leftControls = this.youtubePageManager.document.createElement("div"),
            playPauseButton = this.createPlayPauseButton(),
            volumeControl = this.createVolumeControl();

        outerDiv.className = "ytp-chrome-bottom";
        outerDiv.style.width = "calc(100% - 20px)";
        outerDiv.style.left = "10px";
        outerDiv.style.zIndex = "2147483647";
        outerDiv.style.cssText += "; display: block !important;";

        chromeControls.className = "ytp-chrome-controls";
        leftControls.className = "ytp-left-controls";

        leftControls.appendChild(playPauseButton);
        chromeControls.appendChild(leftControls);
        outerDiv.appendChild(chromeControls);

        return outerDiv;
    };

    VideoPlayerManager.prototype.createPlayPauseButton = function () {
        var self = this,
            playPauseButton = this.youtubePageManager.document.createElement("button");

        function getPlayButtonDesign() {
            return '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">' +
                '<use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink"' +
                'xlink:href="#ytp-id-39"></use>' +
                '<path class="ytp-svg-fill" d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"' +
                'id="ytp-id-39"></path>' +
                '</svg>';
        }

        function getPauseButtonDesign() {
            return '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">' +
                '<use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink"' +
                'xlink:href="#ytp-id-40"></use>' +
                '<path class="ytp-svg-fill" d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"' +
                'id="ytp-id-40"></path>' +
                '</svg>';
        }

        playPauseButton.id = "playPauseBtn";
        playPauseButton.className = "ytp-play-button ytp-button";
        playPauseButton.label = "Play";
        playPauseButton.innerHTML = getPlayButtonDesign();

        playPauseButton.onclick = function () {
            self.videoTag.togglePlayPause();
        };

        playPauseButton.updateButton = function (isVideoPaused) {
            if (isVideoPaused) {
                this.innerHTML = getPlayButtonDesign();
            } else {
                this.innerHTML = getPauseButtonDesign();
            }
        };

        return playPauseButton;
    };

    VideoPlayerManager.prototype.createPlayPauseFeedback = function (videoDiv) {
        var pauseFeedback = getIconFeedback('pauseFeedback', "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"),
            playFeedback = getIconFeedback('playFeedback', "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z");

        function getIconFeedback(id, svgPath) {
            var div = document.createElement("div");

            div.innerHTML = '<div id="' + id + '" class="ytp-bezel" role="status" data-layer="4" style="display: none;">' +
                '<div class="ytp-bezel-icon">' +
                '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">' +
                '<use class="ytp-svg-shadow" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ytp-id-' + id + '"></use>' +
                '<path class="ytp-svg-fill" d="' + svgPath + '" id="ytp-id-' + id + '"></path>' +
                '</svg>' +
                '</div>' +
                '</div>';

            return div.childNodes[0];
        }

        videoDiv.appendChild(pauseFeedback);
        videoDiv.appendChild(playFeedback);
    };

    VideoPlayerManager.prototype.createVolumeControl = function () {
        var span = this.youtubePageManager.document.createElement('span'),
            audioButton = this.youtubePageManager.document.createElement('button'),
            volumePanel = this.youtubePageManager.document.createElement('div');

        audioButton.className = "ytp-mute-button ytp-button";
        audioButton.title = "Mute";

        volumePanel.className = "ytp-volume-panel";
    };
})();
