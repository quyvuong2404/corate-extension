var mode = null;
var serverDomain = 'http://localhost:3000';
// var serverDomain = 'http://nodejs.gpat.vn:3000';
var oauth = null;

"use strict";

// (function(){})();

// document.addEventListener('DOMContentLoaded', function(){});
// window.onload = function(){}


/*function removeQuote(idQ) {
    $.ajax({
        url: serverDomain + "/api/delete",
        data: {idQ: idQ},
        type: "POST",
        dataType: "json",
        success: function(data){
            console.log(data);
        },
        error: function(error){
            console.log(error);
        }
    })
}*/

// get authenticated infor from server
/*function getOauth(callback) {
    $.ajax({
        url: serverDomain + "/api/oauth",
        type: "GET",
        dataType: "json",
        success: function(data) {console.log(data);
            callback(data);
        },
        error: function(error) {
            console.log(error);
        }
    });
}*/

/*function getText(url, callback) {
    $.ajax({
        url:  serverDomain + "/api/on",
        type: "POST",
        data: {url: url},
        dataType: "json",
        success: function(data){
            callback(data);
        },
        error: function(error){
            console.log(error);
        }
    });
}*/

/*function sendToServer(data, callback) {
    var xhr = new XMLHttpRequest();
    var url = serverDomain + "/api/create";
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onload = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            if (!response.error) {console.log(response.id);
                callback(response.id);
            }
        }
    }
    xhr.send('text='+data.text
            +'&url='+data.url
            +'&title='+data.title
            +'&nodePath='+data.nodePath
            +'&id='+oauth.id
            +'&htmltext='+oauth.htmltext);
}*/

// change icon
function changeIcon(iconName) {console.log('change icon', iconName);
    chrome.tabs.getSelected(null, function(tab){
        chrome.browserAction.setIcon({
            path: iconName,
            tabId: tab.id
        });
    });
}

// send to inject
function sendToInject(data) {
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.sendMessage(tab.id, data);
    });
}


chrome.browserAction.onClicked.addListener(function(tab){
    mode = !mode;console.log(mode);console.log(oauth);
    if (mode) {
        changeIcon('icon-on.png');
        /*if (oauth == null) {
            getOauth(function(response){
                oauth = response;console.log(oauth);
                sendToInject({type: 'switchmode', mode: mode});
                sendToInject({type: "getoauth", mode: oauth});
            });
        } else {
            sendToInject({type: "getoauth", mode: oauth});
            sendToInject({type: 'switchmode', mode: mode});
        }*/
    } else {
        changeIcon('icon-off.png');
    }
    sendToInject({type: 'switchmode', mode: mode});
});

// receive message from inject when page onload
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "getmode":
            mode = request.mode;console.log('get mode', mode);
            if (mode === true) {
                changeIcon('icon-on.png');
            } else {
                changeIcon('icon-off.png');
            }
        break;

        /*case "oauth":
            getOauth(function(result){console.log(result);
                oauth = result;
                sendResponse(result);
            });
        break;*/

        /*case "deletequote":
            removeQuote(request.mode);
        break;*/

        /*case "gettext":
            getText(request.mode, function(result){console.log(result);
                sendResponse(result);
            });
        break;*/

        /*case "replace":
            sendToServer(request.mode, function(response){console.log(response);
                sendResponse(response);
            });
        break;*/
    }
});