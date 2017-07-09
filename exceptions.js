/*global chrome*/

var NoVideoFoundException;
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
}());
