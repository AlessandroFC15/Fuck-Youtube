import MirrorFinder from './modules/MirrorFinder';

// here we use SHARED message handlers, so all the contexts support the same
// commands. in background, we extend the handlers with two special
// notification hooks. but this is NOT typical messaging system usage, since
// you usually want each context to handle different commands. for this you
// don't need handlers factory as used below. simply create individual
// `handlers` object for each context and pass it to msg.init() call. in case
// you don't need the context to support any commands, but want the context to
// cooperate with the rest of the extension via messaging system (you want to
// know when new instance of given context is created / destroyed, or you want
// to be able to issue command requests from this context), you may simply
// omit the `hadnlers` parameter for good when invoking msg.init()

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('Background received request');

        console.log(request);

        if (request.action === "findMirrors") {
            const mirrorFinder = new MirrorFinder();

            mirrorFinder.findMirrors(request.url, sendResponse);
        }

        // This 'return true' indicates that the call is async
        return true;
    });



