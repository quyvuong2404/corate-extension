// var serverDomain = 'http://localhost:3000';
// var serverDomain = 'http://nodejs.gpat.vn:3000';

function removeQuote(idQ) {
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
}

// get authenticated infor from server
function getOauth() {
    $.ajax({
        url: serverDomain + "/api/oauth",
        type: "GET",
        dataType: "json",
        success: function(data) {console.log(data);
            oauth = data;
            getText();
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function getText() {
    if (oauth != null) {
        $.ajax({
            url:  serverDomain + "/api/on",
            type: "POST",
            data: {url: domain},
            dataType: "json",
            success: function(response){
                console.log(response);
                    if (response.found) {
                        for (var i = 0; i < response.text.length; i++) {
                            var text = response.text[i].text;
                            var id = response.text[i].id;
                            var containerPath = response.text[i].path;
                            var containerNode = locateNodeFromPath(document.body, containerPath.split(','));
                            console.log(containerNode);
                            highlightSearchTerms(id, containerNode, text, true, false);
                            addRemoveAction(id);
                        }
                    }
            },
            error: function(error){
                console.log(error);
            }
        });
    }
}

function sendToServer(data) {
    var xhr = new XMLHttpRequest();
    var url = serverDomain + "/api/create";
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.onload = function() {
        if(xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            if (!response.error) {console.log(response.id);
                replaceAction(response, data.htmltext);
            }
        }
    }
    xhr.send('text='+data.text
            +'&url='+data.url
            +'&title='+data.title
            +'&nodePath='+data.nodePath
            +'&id='+oauth.id
            +'&htmltext='+oauth.htmltext);
}