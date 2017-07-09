/**
 * This file is responsible for enabling most of the shortcuts present in YouTube videos.
 */

var createVideoFunctions = function (video) {
    "use strict";
    var roundBy2Decimals = function (number) {
        return Math.round(number * 100) / 100;
    };

    video.goBack = function (seconds) {
        this.currentTime -= seconds;
    };

    video.goForward = function (seconds) {
        this.currentTime += seconds;
    };

    video.togglePlayPause = function () {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
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
};

var getKeyCodes = function () {
    "use strict";
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

var enableYouTubeShortcuts = function (video) {
    "use strict";
    createVideoFunctions(video);

    window.addEventListener("keydown", function (event) {
        var keys = getKeyCodes();

        var isNumberPressed = function (keyPressed, number) {
            return keyPressed === keys["numPad" + number.toString()] || keyPressed === keys[number.toString()];
        };

        var isVideoFrameSelected = function (keyPressEvent) {
            return keyPressEvent.target.id === "player-api";
        };

        if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
            var keyPressed = event.which || event.keyCode;

            if (isVideoFrameSelected(event)) {
                if (keyPressed === keys.home) {
                    video.goToSpecificTime(0);
                } else if (keyPressed === keys.end) {
                    video.goToSpecificTime(video.duration);
                    event.preventDefault();
                } else if (keyPressed === keys.upArrow) {
                    video.increaseVolumeBy5Percent();
                    event.preventDefault();
                } else if (keyPressed === keys.downArrow) {
                    video.decreaseVolumeBy5Percent();
                    event.preventDefault();
                }
            }

            if (keyPressed === keys.spacebar || keyPressed === keys.k) {
                video.togglePlayPause();
                event.preventDefault();
            } else if (keyPressed === keys.rightArrow) {
                video.goForward(5);
            } else if (keyPressed === keys.l) {
                video.goForward(10);
            } else if (keyPressed === keys.leftArrow) {
                video.goBack(5);
            } else if (keyPressed === keys.j) {
                video.goBack(10);
            } else if (isNumberPressed(keyPressed, 0)) {
                video.goToSpecificTime(0);
            } else if (isNumberPressed(keyPressed, 1)) {
                video.goToSpecificTime(video.duration * 0.1);
            } else if (isNumberPressed(keyPressed, 2)) {
                video.goToSpecificTime(video.duration * 0.2);
            } else if (isNumberPressed(keyPressed, 3)) {
                video.goToSpecificTime(video.duration * 0.3);
            } else if (isNumberPressed(keyPressed, 4)) {
                video.goToSpecificTime(video.duration * 0.4);
            } else if (isNumberPressed(keyPressed, 5)) {
                video.goToSpecificTime(video.duration * 0.5);
            } else if (isNumberPressed(keyPressed, 6)) {
                video.goToSpecificTime(video.duration * 0.6);
            } else if (isNumberPressed(keyPressed, 7)) {
                video.goToSpecificTime(video.duration * 0.7);
            } else if (isNumberPressed(keyPressed, 8)) {
                video.goToSpecificTime(video.duration * 0.8);
            } else if (isNumberPressed(keyPressed, 9)) {
                video.goToSpecificTime(video.duration * 0.9);
            } else if (keyPressed === keys.f) {
                // This request to fullscreen will only work on Chrome.
                video.webkitRequestFullScreen();
            } else if (event.shiftKey && keyPressed === keys.period) {
                video.increaseSpeed();
            } else if (event.shiftKey && keyPressed === keys.comma) {
                video.decreaseSpeed();
            } else if (keyPressed === keys.m) {
                video.toggleMuteUnmuteAudio();
            }
        }

        // console.log(event);
    });
};

// The other content script will send a message when the video tag is created and ready, letting this file know that
// it is safe to enable all the shortcuts.
window.addEventListener("message", function (event) {
    "use strict";

    // We only accept messages from ourselves
    if (event.source !== window) {
        return;
    }

    if (event.data.type && (event.data.type === "ENABLE_VIDEO_SHORTCUTS")) {
        var videoTag = document.getElementById(event.data.videoTagId);

        enableYouTubeShortcuts(videoTag);
    }

}, false);


