/*global GenYouTubeMirrorFinder, InvalidYouTubeVideoURLException, NoVideoFoundException, QUnit, $ */


(function () {
    "use strict";

    QUnit.test("Test with links that are not valid YouTube video links", function (assert) {
        var genYouTubeMirrorFinder = new GenYouTubeMirrorFinder(),
            invalidLinks = [
                "http://www.globo.com/",
                "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static",
                "https://www.youtube.com/results?search_query=justin+bieber+",
                "https://www.youtube.com/",
                "https://www.youtube.com/feed/subscriptions",
                "https://www.youtube.com/watch?v=",
                "https://www.youtube.co/watch?v=weeI1G46q0o",
                "https://www.youtbe.com/watch?v=weeI1G46q0o",
            ];

        for (var i = 0; i < invalidLinks.length; i++) {
            assert.throws(function () {
                    genYouTubeMirrorFinder.findMirrors(invalidLinks[i]);
                },
                InvalidYouTubeVideoURLException);
        }
    });

    QUnit.test("Test with links that are valid YouTube video links and we should find at least one mirror", function (assert) {

        function checkMirrors(mirrors) {
            assert.ok(mirrors && Object.keys(mirrors).length === 2);
            done();
        }

        var genYouTubeMirrorFinder = new GenYouTubeMirrorFinder(),
            validLinks = [
                "https://www.youtube.com/watch?v=weeI1G46q0o",
                "https://www.youtube.com/watch?v=tt2k8PGm-TI",
                "https://www.youtube.com/watch?v=GDoUVaOj9P0", // Justin Bieber - The Most
                "https://www.youtube.com/watch?v=KC6tnRIxdhk", // UFC Embedded 217
            ],
            done = assert.async(validLinks.length);

        for (var i = 0; i < validLinks.length; i++) {
            genYouTubeMirrorFinder.findMirrors(validLinks[i], checkMirrors);
        }
    });

    QUnit.test("Test with links that are invalid YouTube video links and an error should be raised", function (assert) {

        function assertException(exception) {
            assert.ok(exception instanceof NoVideoFoundException);
            done();
        }

        var genYouTubeMirrorFinder = new GenYouTubeMirrorFinder(),
            invalidLinks = [
                "https://www.youtube.com/watch?v=2wyy6qutrk4",
                "https://www.youtube.com/watch?v=2wyy16qutrk",
                "https://www.youtube.com/watch?v=lBkHkHWaXEA"
            ],
            done = assert.async(invalidLinks.length);

        for (var i = 0; i < invalidLinks.length; i++) {
            genYouTubeMirrorFinder.findMirrors(invalidLinks[i], assertException);
        }
    });

    QUnit.test("Test the method to remove the title parameter from a url", function (assert) {
        var genYouTubeMirrorFinder = new GenYouTubeMirrorFinder(),
            testData = [
                { // Title parameter at the end of url
                    'input': "globo.com/videoplayback?id=0&title=ala",
                    'output': "globo.com/videoplayback?id=0"
                },
                { // Title in the middle of other parameters
                    'input': "globo.com/videoplayback?id=0&title=ala&rate=1",
                    'output': "globo.com/videoplayback?id=0&rate=1"
                },

                { // Title parameter at the beginning
                    'input': "globo.com/videoplayback?title=ala&rate=1",
                    'output': "globo.com/videoplayback?rate=1"
                },

                { // Title parameter as the only parameter
                    'input': "globo.com/videoplayback?title=ala",
                    'output': "globo.com/videoplayback?"
                },

                { // Url with the string 'title' but should not be replaced
                    'input': "globo.com/videoplayback?subtitle=ala",
                    'output': "globo.com/videoplayback?subtitle=ala"
                },
            ];

        for (var i = 0; i < testData.length; i++) {
            assert.equal(genYouTubeMirrorFinder.removeTitleParameterFromLink(testData[i].input), testData[i].output);
        }
    });
}());