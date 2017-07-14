/*global YoutubeUnblocker, YouPakRequestManager, YoutubePageManager, NoVideoFoundException, QUnit, $ */

(function () {
    "use strict";

    QUnit.test("Test to check if it is youtube video link", function (assert) {
        var youtubeUnblocker = new YoutubeUnblocker(),
            validLinks,
            invalidLinks,
            i;

        validLinks = [
            'https://www.youtube.com/watch?v=5kI1HsfF31A',
            'http://www.youtube.com/watch?v=5kI1HsfF31A',
            'www.youtube.com/watch?v=5kI1HsfF31A',
            'youtube.com/watch?v=5kI1HsfF31A',
            'youtu.be/watch?v=5kI1HsfF31A',
            'https://www.youtube.com/watch?v=4KIdLTLt3zI',
            'https://www.youtube.com/watch?v=sfLV6urfZjw&t=575s',
            "https://www.youtube.com/watch?v=2j6RT3CDIMw&feature=youtu.be",
            "https://www.youtube.com/watch?feature=youtu.be&v=MIG4HL37X3M",
            "https://www.youtube.com/watch?t=575s&v=MIG4HL37X3M"
        ];

        for (i = 0; i < validLinks.length; i++) {
            assert.equal(youtubeUnblocker.pageManager.isYoutubeVideoLink(validLinks[i]), true, validLinks[i] + " is valid!");
        }

        invalidLinks = [
            'https://www.youtube.com/wach?v=4KIdLTLt3zI', // Typo in watch
            'https://www.youtube.com', // No id specified
            'https://www.youtube.com/watch', // No extra parameters specified
            'https://www.youtube.com/watch?v=', // 'No id specified
            'https://ww.youtube.com/watch?v=Iz8YqU7dIZA', // Typo in www
            'https://www.youtube/watch?v=Iz8YqU7dIZA', // No .com
            'https://www.youtube.com/watch?c=Iz8YqU7dIZA', // 'c' instead of 'v'
            'https://www.youtu.be.com/watch?v=Iz8YqU7dIZA'
        ];

        for (i = 0; i < invalidLinks.length; i++) {
            assert.equal(youtubeUnblocker.pageManager.isYoutubeVideoLink(invalidLinks[i]), false, invalidLinks[i] + " is NOT valid!");
        }
    });

    QUnit.test("Test to check if a youtube video is unavailable", function (assert) {
        var testVideosUrls = function (listVideoUrls, shouldBeUnavailable) {
                var done = assert.async(listVideoUrls.length),

                    successCallback = function (response) {
                        var htmlDoc = new YouPakRequestManager().getHTMLDocumentFromText(response);

                        assert.equal(new YoutubePageManager(htmlDoc).isYoutubeVideoUnavailable(htmlDoc), shouldBeUnavailable);
                        done();
                    },

                    i;

                for (i = 0; i < listVideoUrls.length; i++) {
                    $.ajax({
                        url: listVideoUrls[i],
                        method: 'GET',
                        success: successCallback
                    });
                }
            },

            unavailableVideosUrls = [
                "https://www.youtube.com/watch?v=5kI1HsfF31A",                                      // UFC Embedded
                "https://www.youtube.com/watch?v=SRcpuD9isZg",                                      // UFC Embedded
                "https://www.youtube.com/watch?v=2j6RT3CDIMw&feature=youtu.be",                     // UFC Embedded
                "https://www.youtube.com/watch?v=9TtIo1mIITY",                                      // UFC Embedded
                "https://www.youtube.com/watch?v=-nd3_-BOPDw",                                      // UFC Embedded
                "https://www.youtube.com/watch?v=bBNx7_TlNhE&feature=youtu.be",                     // UFC Embedded
                "https://www.youtube.com/watch?v=2wyy6qutrk4&feature=youtu.be"                    // Random video
            ],

            availableVideosUrls = [
                "https://www.youtube.com/watch?v=DK_0jXPuIr0",                                      // Justin Bieber Music
                "https://www.youtube.com/watch?v=fRh_vgS2dFE",                                      // Justin Bieber Music
                "https://www.youtube.com/watch?v=kjUQjq1CBi0",                                      // Justin Bieber Music
                "https://www.youtube.com/watch?v=154himd-3ZE",                                      // Justin Bieber Music
                "https://www.youtube.com/watch?v=7Oxz060iedY"                                       // Eric Thomas Video
            ];

        testVideosUrls(unavailableVideosUrls, true);
        testVideosUrls(availableVideosUrls, false);
    });

    QUnit.test("Test to collect video sources from YouPak", function (assert) {
        var testYouPakLinks = function (listLinks, shouldBeValid) {
                var done = assert.async(listLinks.length),

                    successCallback = function (response) {
                        var links;

                        if (shouldBeValid) {
                            links = new YouPakRequestManager().findVideoLinksFromYouPak(response);

                            assert.ok(links && links.length >= 1);
                        } else {
                            assert.throws(function () {
                                new YouPakRequestManager().findVideoLinksFromYouPak(response);
                            }, NoVideoFoundException);
                        }

                        done();
                    },

                    i;

                for (i = 0; i < listLinks.length; i++) {
                    $.ajax({
                        url: listLinks[i],
                        method: 'GET',
                        success: successCallback
                    });
                }
            },

            validYouPakLinks = [
                "https://www.youpak.com/watch?v=KGCfSvwFiCw",
                "https://www.youpak.com/watch?v=5kI1HsfF31A",
                "https://www.youpak.com/watch?v=SRcpuD9isZg"
            ],

            invalidYouPakLinks = [
                "https://www.youpak.com/watch?v=2wyy6qutrk4&feature=youtu.be",
                "https://www.youpak.com/watch?v=2wyy6qx"
            ];

        testYouPakLinks(validYouPakLinks, true);

        testYouPakLinks(invalidYouPakLinks, false);
    });

    QUnit.test("Test to check if the design is correct", function (assert) {
        var testIfDesignIsCorrect = function (listVideoUrls) {
            var testIfSidebarIsHidden = function (htmlDoc) {
                    assert.equal(htmlDoc.getElementById("watch7-sidebar").style.display, "none", "Sidebar is hidden!");
                },

                testIfVideoPlayerIsCentered = function (htmlDoc) {
                    var divPage = htmlDoc.getElementById("page");
                    assert.equal(divPage.classList.contains("watch-stage-mode") &&
                        divPage.classList.contains("watch-wide"), true, "Video player holder is centered!");
                },

                testIfVideoContentInfoIsCentered = function (htmlDoc) {
                    var divVideoInfo = htmlDoc.getElementById("new-watch7-content");
                    assert.equal(divVideoInfo.style.margin === "auto" &&
                        divVideoInfo.style.float === "none" &&
                        divVideoInfo.style.left === "0px" &&
                        divVideoInfo.classList.contains("player-width"), true, "Video content info is centered!");
                },

                done = assert.async(listVideoUrls.length),

                successCallback = function (response) {
                    var htmlDoc = new YouPakRequestManager().getHTMLDocumentFromText(response);

                    new YoutubePageManager(htmlDoc).enableTheaterMode(htmlDoc);

                    testIfSidebarIsHidden(htmlDoc);

                    testIfVideoPlayerIsCentered(htmlDoc);

                    testIfVideoContentInfoIsCentered(htmlDoc);

                    done();
                },

                i;
            for (i = 0; i < listVideoUrls.length; i++) {
                $.ajax({
                    url: listVideoUrls[i],
                    method: 'GET',
                    success: successCallback
                });
            }
            },

            videosUrls = [
            "https://www.youtube.com/watch?v=5kI1HsfF31A",                                      // UFC Embedded
            "https://www.youtube.com/watch?v=SRcpuD9isZg",                                      // UFC Embedded
            "https://www.youtube.com/watch?v=2j6RT3CDIMw&feature=youtu.be",                     // UFC Embedded
            "https://www.youtube.com/watch?v=9TtIo1mIITY",                                      // UFC Embedded
            "https://www.youtube.com/watch?v=-nd3_-BOPDw",                                      // UFC Embedded
            "https://www.youtube.com/watch?v=bBNx7_TlNhE&feature=youtu.be",                     // UFC Embedded
            "https://www.youtube.com/watch?v=2wyy6qutrk4&feature=youtu.be"                     // Random video
        ];

        testIfDesignIsCorrect(videosUrls);
    });
}());

