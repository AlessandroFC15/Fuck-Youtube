// Listen for messages
var warning;

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

                var content = document.getElementById('player-unavailable').getElementsByClassName('content')[0]

                content.appendChild(document.createElement('br'));
                content.appendChild(warning);
            }
        }

        sendResponse(document.getElementById('player-unavailable').className);
    } else if (msg.text === 'update_link') {
        warning.innerHTML = '<a href="'  + msg.link +'">Your mirror is ready, click here to watch it!</a>'
    }
});