/* 
 * This component is responsible for enabling shortcuts usage for a given video frame.
 * It attempts to simulate what YouTube does for its videos.
 * Inputs:
 *      - A <video> tag
 * Results:
 *      - The <video> tag passed as input now supports certain keyboard commands to control its behavior.
 */

var VideoShortcutManager;
(function () {
    "use strict";

    VideoShortcutManager = function (videoTag) {
        this.video = videoTag;
        this.document = videoTag.ownerDocument;
        this.videoFrameId = "player-api";
    };

    VideoShortcutManager.prototype.createVideoFunctions = function () {
        var roundBy2Decimals = function (number) {
            return Math.round(number * 100) / 100;
        };

        this.video.goBack = function (seconds) {
            this.currentTime -= seconds;
        };

        this.video.goForward = function (seconds) {
            this.currentTime += seconds;
        };

        this.video.togglePlayPause = function () {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        };

        this.video.goToSpecificTime = function (seconds) {
            this.currentTime = seconds;
        };

        this.video.increaseVolumeBy5Percent = function () {
            this.volume = Math.min(roundBy2Decimals(this.volume + 0.05), 1);
        };

        this.video.decreaseVolumeBy5Percent = function () {
            this.volume = Math.max(0, roundBy2Decimals(this.volume - 0.05));
        };

        this.video.increaseSpeed = function () {
            this.playbackRate = Math.min(this.playbackRate + 0.25, 2);
        };

        this.video.decreaseSpeed = function () {
            this.playbackRate = Math.max(0.25, this.playbackRate - 0.25);
        };

        this.video.toggleMuteUnmuteAudio = function () {
            this.muted = !this.muted;
        };
    };

    VideoShortcutManager.prototype.getKeyCodes = function () {
        return {
            "spacebar": 32,
            "k": 75,
            "j": 74,
            "l": 76,
            "f": 70,
            "m": 77,

            "end": 35,
            "home": 36,

            "downArrow": 40,
            "rightArrow": 39,
            "upArrow": 38,
            "leftArrow": 37,

            "numPad0": 96,
            "numPad1": 97,
            "numPad2": 98,
            "numPad3": 99,
            "numPad4": 100,
            "numPad5": 101,
            "numPad6": 102,
            "numPad7": 103,
            "numPad8": 104,
            "numPad9": 105,

            "0": 48,
            "1": 49,
            "2": 50,
            "3": 51,
            "4": 52,
            "5": 53,
            "6": 54,
            "7": 55,
            "8": 56,
            "9": 57,

            "comma": 188,
            "period": 190
        };
    };

    VideoShortcutManager.prototype.enableYouTubeShortcuts = function () {
        this.createVideoFunctions();

        var that = this;

        this.document.addEventListener("keydown", function (event) {
            var keys = that.getKeyCodes();

            var isNumberPressed = function (keyPressed, number) {
                return keyPressed === keys["numPad" + number.toString()] || keyPressed === keys[number.toString()];
            };

            var isVideoFrameSelected = function (keyPressEvent) {
                return keyPressEvent.target.id === that.videoFrameId;
            };

            if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
                var keyPressed = event.which || event.keyCode;

                if (isVideoFrameSelected(event)) {
                    if (keyPressed === keys.home) {
                        that.video.goToSpecificTime(0);
                    } else if (keyPressed === keys.end) {
                        that.video.goToSpecificTime(that.video.duration);
                        event.preventDefault();
                    } else if (keyPressed === keys.upArrow) {
                        that.video.increaseVolumeBy5Percent();
                        event.preventDefault();
                    } else if (keyPressed === keys.downArrow) {
                        that.video.decreaseVolumeBy5Percent();
                        event.preventDefault();
                    }
                }

                if (keyPressed === keys.spacebar || keyPressed === keys.k) {
                    that.video.togglePlayPause();
                    event.preventDefault();
                } else if (keyPressed === keys.rightArrow) {
                    that.video.goForward(5);
                } else if (keyPressed === keys.l) {
                    that.video.goForward(10);
                } else if (keyPressed === keys.leftArrow) {
                    that.video.goBack(5);
                } else if (keyPressed === keys.j) {
                    that.video.goBack(10);
                } else if (isNumberPressed(keyPressed, 0)) {
                    that.video.goToSpecificTime(0);
                } else if (isNumberPressed(keyPressed, 1)) {
                    that.video.goToSpecificTime(that.video.duration * 0.1);
                } else if (isNumberPressed(keyPressed, 2)) {
                    that.video.goToSpecificTime(that.video.duration * 0.2);
                } else if (isNumberPressed(keyPressed, 3)) {
                    that.video.goToSpecificTime(that.video.duration * 0.3);
                } else if (isNumberPressed(keyPressed, 4)) {
                    that.video.goToSpecificTime(that.video.duration * 0.4);
                } else if (isNumberPressed(keyPressed, 5)) {
                    that.video.goToSpecificTime(that.video.duration * 0.5);
                } else if (isNumberPressed(keyPressed, 6)) {
                    that.video.goToSpecificTime(that.video.duration * 0.6);
                } else if (isNumberPressed(keyPressed, 7)) {
                    that.video.goToSpecificTime(that.video.duration * 0.7);
                } else if (isNumberPressed(keyPressed, 8)) {
                    that.video.goToSpecificTime(that.video.duration * 0.8);
                } else if (isNumberPressed(keyPressed, 9)) {
                    that.video.goToSpecificTime(that.video.duration * 0.9);
                } else if (keyPressed === keys.f) {
                    // This request to fullscreen will only work on Chrome.
                    that.video.webkitRequestFullScreen();
                } else if (event.shiftKey && keyPressed === keys.period) {
                    that.video.increaseSpeed();
                } else if (event.shiftKey && keyPressed === keys.comma) {
                    that.video.decreaseSpeed();
                } else if (keyPressed === keys.m) {
                    that.video.toggleMuteUnmuteAudio();
                }
            }
        });
    };

}());
