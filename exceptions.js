/*global chrome, Error*/

var NoVideoFoundException, InvalidYouTubeVideoURLException;
(function () {
    "use strict";

    NoVideoFoundException = function () {
        if (chrome.i18n) {
            this.message = chrome.i18n.getMessage("noVideoFoundMessage");
        } else {
            this.message = '';
        }

        this.name = 'NoVideoFoundException';
    };

    NoVideoFoundException.prototype = new Error;

    InvalidYouTubeVideoURLException = function () {
        this.name = 'InvalidYouTubeVideoURLException';
        this.message = "The url provided does not correspond to a YouTube video url";
    };

    InvalidYouTubeVideoURLException.prototype = new Error;

}());
