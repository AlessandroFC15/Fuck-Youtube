/*global QUnit, VideoShortcutManager, $, KeyboardEvent*/

(function () {
    "use strict";

    var videoTag = getVideoTag();

    function getVideoTag() {
        var url, doc, videoTag, srcTag;

        url = "https://redirector.googlevideo.com/videoplayback?sparams=dur,ei,id,ip,ipbits,itag,lmt,mime,mm,mn,ms,mv,pl,ratebypass,source,expire&key=yt6&itag=22&mm=31&source=youtube&ei=s8ZkWcAOh4K6As3foKgO&ip=107.178.194.35&expire=1499798291&ratebypass=yes&ipbits=0&dur=481.628&id=o-AAcwuskiyq-RM9UsdOGXEs3yxSLDvReZWA0xobXrkHoE&pl=28&signature=8AB9E7B3821823843BC595316E3413FC7AC6D77B.447D0BF633D2243596E4EBB12D451778036223F0&lmt=1496912067739813&mime=video/mp4&ms=au&mt=1499776572&mv=m&mn=sn-vgqskn7z";

        doc = document.implementation.createHTMLDocument("");

        videoTag = document.createElement("video");
        videoTag.controls = true;
        videoTag.autoplay = false;
        videoTag.name = "media";

        srcTag = doc.createElement("source");
        srcTag.src = url;
        srcTag.type = "video/mp4";

        videoTag.appendChild(srcTag);

        return videoTag;
    }

    function simulateKeyPress(keycode, shiftKey, targetElement) {
        var event;
        
        if (shiftKey === undefined) {
            shiftKey = false;
        }

        event = new KeyboardEvent("keydown", {shiftKey: shiftKey});

        Object.defineProperty(event, "which", {"value": keycode});
        Object.defineProperty(event, "keyCode", {"value": keycode});

        if (targetElement) {
            Object.defineProperty(event, "target", {value: targetElement});
        }

        document.dispatchEvent(event);

        console.log(event);
    }

    function testVideoBehavior(options) {
        options.videoTag.currentTime = options.initialTime;
        simulateKeyPress(options.keyPressed, options.shiftKey, options.targetElement);
        options.assert.equal(options.videoTag.currentTime, options.expectedTime);
    }

    videoTag.addEventListener('loadedmetadata', function () {
        QUnit.test("Test for shortcuts responsible for going forward", function (assert) {
            var shortcutManager = new VideoShortcutManager(videoTag),
                keys = shortcutManager.getKeyCodes(),
                keyToGoForward5Seconds = keys.rightArrow,
                keyToGoForward10Seconds = keys.l,
                videoFrame;

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

            videoFrame = document.createElement("div");
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
