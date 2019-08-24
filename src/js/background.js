import "babel-polyfill";
import axios from "axios";

import { mirrorApiUrl } from "./config";

chrome.runtime.onMessage.addListener(
     ({ contentScriptQuery, videoId }, sender, sendResponse) => {
        if (contentScriptQuery === "queryVideoSrc") {
            axios.get(`${mirrorApiUrl}/getVideoSrc?youtubeVideoId=${videoId}`)
                .then(res => sendResponse(res.data.url))
                .catch(err => console.log(err) || sendResponse(null))
        }

        // This 'return true' indicates that the call is async
        return true;
    });



