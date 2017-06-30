// Listen for messages
var warning;

var hideWarningVideoUnavailable = function () {
    var divPlayerUnavailable = document.getElementById('player-unavailable');
    divPlayerUnavailable.style.display = 'none';
};

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg);
    console.log(sender);
    console.log('-------------');
    
    if (msg.text === 'report_back') {
        var classes = document.getElementById('player-unavailable').className;

        if (typeof classes !== 'undefined') {
            if (classes.indexOf('hid') === -1) {
                warning = document.createElement('h1');
                warning.className = 'message';
                warning.style.textAlign = 'center';
                warning.innerHTML = "You know what? Fuck Youtube. Wait a second, we're loading a mirror for you...";

                var content = document.getElementById('player-unavailable').getElementsByClassName('content')[0];

                content.appendChild(document.createElement('br'));
                content.appendChild(warning);
            }
        }

        sendResponse(document.getElementById('player-unavailable').className);
    } else if (msg.text === 'update_link') {
        hideWarningVideoUnavailable();
        
        var divPlayerAPI = document.getElementById('player-api');
        divPlayerAPI.classList.remove('off-screen-target');

        var videoTag = document.createElement('video');
        videoTag.controls = true;
        videoTag.autoplay = true;
        videoTag.name = "media";
        videoTag.style.width = '100%';

        var srcTag = document.createElement('source');
        srcTag.src = msg.link;
        srcTag.type = 'video/mp4';

        videoTag.appendChild(srcTag);
        divPlayerAPI.appendChild(videoTag);
    }
});