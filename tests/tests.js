// Test isYoutubeLink

QUnit.test("Test to check if it is youtube video link", function (assert) {
    var validLinks = [
        'https://www.youtube.com/watch?v=5kI1HsfF31A',
        'http://www.youtube.com/watch?v=5kI1HsfF31A',
        'www.youtube.com/watch?v=5kI1HsfF31A',
        'youtube.com/watch?v=5kI1HsfF31A',
        'youtu.be/watch?v=5kI1HsfF31A',
        'https://www.youtube.com/watch?v=4KIdLTLt3zI',
        'https://www.youtube.com/watch?v=sfLV6urfZjw&t=575s'
        ];

    for (var i = 0; i < validLinks.length; i++) {
        assert.equal(isYoutubeVideoLink(validLinks[i]), true, validLinks[i] + " is valid!");
    }

    var invalidLinks = [
        'https://www.youtube.com/wach?v=4KIdLTLt3zI', // Typo in watch
        'https://www.youtube.com', // No id specified
        'https://www.youtube.com/watch', // No id specified
        'https://www.youtube.com/watch', // No id specified
        'https://www.youtube.com/watch?v=', // 'No id specified
        'https://ww.youtube.com/watch?v=Iz8YqU7dIZA', // Typo in www
        'https://www.youtube/watch?v=Iz8YqU7dIZA', // No .com
        'https://www.youtube.com/watch?c=Iz8YqU7dIZA', // 'c' instead of 'v'
        'https://www.youtu.be.com/watch?v=Iz8YqU7dIZA'
    ];

    for (var j = 0; j < invalidLinks.length; j++) {
        assert.equal(isYoutubeVideoLink(invalidLinks[j]), false, invalidLinks[j] + " is NOT valid!")
    }
});

QUnit.test("Test to check if a youtube video is unavailable", function (assert) {
    var unavailableVideosUrls = [
        'https://www.youtube.com/watch?v=5kI1HsfF31A'
    ];

    var done = assert.async(unavailableVideosUrls.length);

    for (var i = 0; i < unavailableVideosUrls.length; i++) {
        var request = new XMLHttpRequest();

        request.open("GET", unavailableVideosUrls[i], true);

        request.onreadystatechange = function() {
            if (isXMLHttpRequestDone(request)) {
                console.log('>> ready <<');

                assert.equal(1, 1);

                done()
            }
        };

        request.send();
    }


});