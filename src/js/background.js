import "babel-polyfill";
import axios from "axios";

import { version } from "../manifest";
import { mirrorApiUrl } from "./config";

const requestConfig = { headers: { source: `extension@${version}`}};

chrome.runtime.onMessage.addListener(
     ({ contentScriptQuery, videoId }, sender, sendResponse) => {
        if (contentScriptQuery === "queryVideoSrc") {
            axios.get(`${mirrorApiUrl}/getVideoSrc?youtubeVideoId=${videoId}`, requestConfig)
                .then(res => sendResponse(res.data.url))
                .catch(err => console.log(err) || sendResponse(null))
        }

        // This 'return true' indicates that the call is async
        return true;
    });



