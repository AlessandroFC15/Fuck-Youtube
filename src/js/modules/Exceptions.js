export class NoVideoFoundException extends Error {
    constructor() {
        super();

        if (chrome.i18n) {
            this.message = chrome.i18n.getMessage("noVideoFoundMessage");
        } else {
            this.message = '';
        }

        this.name = 'NoVideoFoundException';
    };
}

export class InvalidYouTubeVideoURLException extends Error {
    constructor() {
        super();

        this.name = 'InvalidYouTubeVideoURLException';
        this.message = "The url provided does not correspond to a YouTube video url";
    }
}