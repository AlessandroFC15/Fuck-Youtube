var YoutubeDataAPI;

(function () {
    "use strict";

    YoutubeDataAPI = function (responseText) {
        this.response = responseText;
    };

    YoutubeDataAPI.prototype.getJSONData = function () {
        var begin,
            end,
            data,
            jsonData,
            beginText = 'window["ytInitialPlayerResponse"] = (';

        begin = this.response.indexOf(beginText);
        end = this.response.indexOf(');', begin);

        data = this.response.substring(begin + beginText.length, end).trim();
        jsonData = JSON.parse(data);

        return jsonData;
    };
}());
