/*global QUnit, VideoShortcutManager, $, KeyboardEvent*/

(function () {
    "use strict";

    var getVideoTag = function () {
        var url = "https://redirector.googlevideo.com/videoplayback?sparams=dur,ei,id,ip,ipbits,itag,lmt,mime,mm,mn,ms,mv,pl,ratebypass,source,expire&key=yt6&itag=22&mm=31&source=youtube&ei=s8ZkWcAOh4K6As3foKgO&ip=107.178.194.35&expire=1499798291&ratebypass=yes&ipbits=0&dur=481.628&id=o-AAcwuskiyq-RM9UsdOGXEs3yxSLDvReZWA0xobXrkHoE&pl=28&signature=8AB9E7B3821823843BC595316E3413FC7AC6D77B.447D0BF633D2243596E4EBB12D451778036223F0&lmt=1496912067739813&mime=video/mp4&ms=au&mt=1499776572&mv=m&mn=sn-vgqskn7z";

        var doc = document.implementation.createHTMLDocument("");

        var videoTag = document.createElement("video");
        videoTag.controls = true;
        videoTag.autoplay = false;
        videoTag.name = "media";

        var srcTag = doc.createElement("source");
        srcTag.src = url;
        srcTag.type = "video/mp4";

        videoTag.appendChild(srcTag);

        return videoTag;
    };

    var simulateKeyPress = function (keycode, shiftKey, targetElement) {
        if (shiftKey === undefined) {
            shiftKey = false;
        }

        var e = new KeyboardEvent("keydown", {shiftKey: shiftKey});

        Object.defineProperty(e, "which", {"value": keycode});
        Object.defineProperty(e, "keyCode", {"value": keycode});

        if (targetElement) {
            Object.defineProperty(e, "target", {value: targetElement});
        }

        document.dispatchEvent(e);

        console.log(e);
    };

    var testVideoBehavior = function (options) {
        options.videoTag.currentTime = options.initialTime;
        simulateKeyPress(options.keyPressed, options.shiftKey, options.targetElement);
        options.assert.equal(options.videoTag.currentTime, options.expectedTime);
    };

    var videoTag = getVideoTag();

    videoTag.addEventListener('loadedmetadata', function() {
        QUnit.test("Test for shortcuts responsible for going forward", function (assert) {
            var shortcutManager = new VideoShortcutManager(videoTag);
            var keys = shortcutManager.getKeyCodes();

            var keyToGoForward5Seconds = keys.rightArrow;
            var keyToGoForward10Seconds = keys.l;

            testVideoBehavior({ videoTag: videoTag,
                                initialTime: 0,
                                expectedTime: 10,
                                keyPressed: keyToGoForward10Seconds,
                                assert: assert });

            testVideoBehavior({ videoTag: videoTag,
                                initialTime: 10,
                                expectedTime: 20,
                                keyPressed: keyToGoForward10Seconds,
                                assert: assert });

            // Trying to go forward when there's no more video to play.
            testVideoBehavior({ videoTag: videoTag,
                                initialTime: videoTag.duration,
                                expectedTime: videoTag.duration,
                                keyPressed: keyToGoForward10Seconds,
                                assert: assert });

            // Trying to go forward when there's little room to move.
            testVideoBehavior({ videoTag: videoTag,
                                initialTime: videoTag.duration - 5,
                                expectedTime: videoTag.duration,
                                keyPressed: keyToGoForward10Seconds,
                                assert: assert });

            // ----------------------

            var videoFrame = document.createElement("div");
            videoFrame.id = shortcutManager.videoFrameId;

            // Test when right arrow is pressed and the video frame is selected

            testVideoBehavior({ videoTag: videoTag,
                                initialTime: 0,
                                expectedTime: 5,
                                keyPressed: keyToGoForward5Seconds,
                                targetElement: videoFrame,
                                assert: assert });
        });
    });



}());