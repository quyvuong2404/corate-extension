"use strict";

var mode, domain, oauth = null;
var mouseUpTarget, mouseDownTarget;
var localMode = 'corate-mode';

(function(){
    if (window.top === window) {
        console.log('Corate say hello');
        domain = top.location.href;
        mode = getMode();console.log(mode);
        sendMode('getmode', mode);
        if (mode == true) {
            if (oauth == null) {
                getOauth();
            }
        }
    }
})();

// trigger event mouse-up
window.addEventListener('mouseup', function(e){
    mouseUpTarget = e.target;
    if (mode === true) {
        if (oauth != null) {
            setTimeout(function(){
                doQuote();
            }, 200);
        }
    }
});

window.addEventListener('mousedown', function(e){
    mouseDownTarget = e.target;
});


function getText() {
    if (oauth != null) {
        sendMode("gettext", domain);
    }
}

function getOauth() {
    sendMode('oauth', null);
    // chrome.runtime.sendMessage({type: 'oauth'}, function(response){});
}

function getDomainMode() {
    if (localStorage.getItem(localMode) != null) {
        return localStorage.getItem(localMode);
    } else {
        return false;
    }
}

function setDomainMode(m) {
    localStorage.setItem(localMode, m);
    if (m == false) {
        turnOff();
    } else {
        turnOn();
    }
}

function sendMode(type, m) {
    chrome.runtime.sendMessage({type: type, mode: m}, function(response){
        switch(type) {
            case 'gettext':console.log(response);
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
            break;

            case 'replace':
                replaceAction(response, m.text);
            break;

            case 'oauth':
                console.log(response.token);
                if (response.authenticated == 1) {
                    oauth = response;
                    getText();
                } else {
                    oauth = null;
                }
            break;

            case 'getmode':
                console.log('mode', m);
            break;
        }
    });
}

function getMode() {
    var m = getDomainMode();
    if (m === "true") {
        m = true;
    } else {
        m = false;
    }
    return m;
}


// make a connection to background
function connectBackground(p) {
    return chrome.extension.connect({ name:  p });
}

// switch mode
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse){
    switch(msg.type) {
        case "switchmode":
            mode = msg.mode;
            setDomainMode(mode);
        break;

        case "getoauth":
            oauth = msg.mode;
        break;
    }
});

function turnOff() {
    var highlightedElement = $('.corate-highlight-text');
    highlightedElement.removeClass('corate-highlight-text').addClass('corate-non-bg');
}

function turnOn() {
    if (oauth != null) {
        var replacedElement = $('.corate').not('.corate-removed');
        replacedElement.removeClass('corate-non-bg').addClass('corate-highlight-text');
    }
}

// get highlighted text
function getSelectedText() {
    var content = "";
    var selectedPath = [];
    var text = "";
    var htmltext = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {// console.log(mouseDownTarget, mouseUpTarget);
            text = sel.toString();console.log(text);
            if (text) {
                /*console.log('start node ',sel.anchorNode.parentNode, sel.anchorOffset);
                console.log('end node ',sel.focusNode.parentNode, sel.focusOffset);
                var startNode = sel.anchorNode.parentNode;
                var endNode = sel.focusNode.parentNode;
                console.log(startNode !== endNode ? 'not same parent node':'same parent node');*/
                var range = sel.getRangeAt(0);
                content = range.cloneContents();
                /*var n = content.childNodes.length;console.log(n);
                var inlineTag = ['b','big','i','small','tt','abbr','acronym','cite','code','dfn','em','kbd','strong','samp','time','var','a','bdo','br','img','map','object','q','script','span','sub','sup'];
                for (var i = 0; i < n; i++) {
                    if (content.childNodes[i].nodeName !== '#text') {
                        console.log('child frag ',content.childNodes[i],content.childNodes[i].nodeName,content.childNodes[i].textContent);
                    } else {
                        console.log('child frag ',content.childNodes[i],content.childNodes[i].nodeName,content.childNodes[i].textContent, content.childNodes[i].textContent === null);
                    }
                }*/
                var span = document.createElement('span');
                span.appendChild(content);console.log(span.childNodes, span.children);
                htmltext = span.innerHTML;console.log(text);
                var selectedNode = sel.getRangeAt(0).commonAncestorContainer;
                // console.log('selected node', selectedNode);
                var parentEl = selectedNode.nodeType === 3 ? selectedNode.parentNode : selectedNode;
                // console.log('parent selected node', parentEl);
                
                // console.log(parentEl, parentEl.nodeType == 3);
                selectedPath = getNodePath(document.body, parentEl);
            }
        }
    }
    return {
        text: text,
        path: selectedPath.toString(),
        htmltext: htmltext
    };
}

// send to background
function sendMessage(selectedText) {
    var data = { 
        text: selectedText.text, 
        url: window.location.href,
        title: document.title,
        nodePath: selectedText.path,
        htmltext: selectedText.htmltext
    };
    // sendToServer(data);
    sendMode('replace', data);
}

function indexOf(arrLike, target) {
    return Array.prototype.indexOf.call(arrLike, target);
}

function getNodePath(root, target) {
    var current = target;
    var path = [];
    while(current !== root) {
        path.unshift(indexOf(current.parentNode.childNodes, current));
        current = current.parentNode;
    }
    return path;
}

function locateNodeFromPath(root, path) {
    var current = root;
    for(var i = 0, len = path.length; i < len; i++) {
        current = current.childNodes[path[i]];
    }
    return current;
}

function replaceAction(id, selectedText) {
    var span = highlightElement(selectedText, id);
    replaceHighlightedText(span);
}

// highlight action
function doQuote() {
    var selectedText = getSelectedText();
    if (selectedText.text) {console.log(selectedText);
        sendMessage(selectedText);
    }
}

function replaceHighlightedText(replacedElement) {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(replacedElement);
}

function highlightElement(hText, id) {
    var text = document.createTextNode(hText);
    var span = document.createElement('span');
    span.setAttribute('class', 'corate corate-highlight-text');
    span.setAttribute('id', id);
    span.appendChild(text);
    var removeIcon = document.createElement('a');
    removeIcon.setAttribute('href', '#');
    removeIcon.setAttribute('class', 'corate-remove-quote');
    removeIcon.innerHTML = 'X';
    addRemoveAction(id);
    span.appendChild(removeIcon);
    return span;
}

function addRemoveAction(id) {
    $(document).on('click', '#'+id+' a.corate-remove-quote', function(e){
        e.preventDefault();
        var thisElement = this;
        var parent = $(thisElement).parent();
        var idQ = parent.attr('id');console.log(idQ);
        sendMode('deletequote', idQ);
        // removeQuote(idQ);
        parent.removeClass('corate-highlight-text').addClass('corate-non-bg').addClass('corate-removed');
    });
}