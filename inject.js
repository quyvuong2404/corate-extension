"use strict";

var mode, domain, oauth = null;
var localMode;

window.onload = function() {
    if (window.top === window) {
        domain = top.location.href;
        localMode = 'corate-mode';
        mode = getMode();
        sendMode('getmode', mode);
        if (mode == true) {
            if (oauth == null) {
                getOauth();
            }
        }
        console.log('Corate say hello');
    }
}

// trigger event mouse-up
window.addEventListener('mouseup', function(){
    if (mode === true) {
        if (oauth != null) {
            setTimeout(function(){
                doQuote();
            }, 200);
        }
    }
});

function getText() {
    if (oauth != null) {
        sendMode("gettext", domain);
    }
}

function getOauth() {
    chrome.runtime.sendMessage({type: 'oauth'}, function(response){console.log(response.token);
        if (response.authenticated == 1) {
            oauth = response;
            getText();
        } else {
            oauth = null;
        }
    });
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
        if (oauth != null) {
            getText();
        }
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
                        var span = highlightElement(text, id);
                        document.body.innerHTML = document.body.innerHTML.replace(text, '<span id="'+id+'" style="background: yellow">'+text+'</span>');
                        $('span#'+id).replaceWith(span);
                        // var myHilitor = new Hilitor();
                        // myHilitor.apply(text);
                    }
                }
            break;

            case 'replace':
                replaceAction(response.res, m.text);
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

// send to background
function sendMessage(selectedText) {
    var data = { 
        text: selectedText, 
        url: window.location.href,
        title: document.title
    };
    sendMode('replace', data);
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
            getText();
        break;
    }
});

function turnOff() {
    var highlightedElement = $('.corate-highlight-text');
    highlightedElement.replaceWith(highlightedElement.text());
}

// get highlighted text
function getSelectedText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

function replaceAction(id, selectedText) {
    var myHilitor = new Hilitor();
    myHilitor.apply(selectedText);
    // var span = highlightElement(selectedText, id);
    // replaceHighlightedText(span);
}

// highlight action
function doQuote() {
    var selectedText = getSelectedText();
    if (selectedText) {
        sendMessage(selectedText);
        /*var r = window.getSelection().getRangeAt(0).getBoundingClientRect();
        if (!r.isCollapsed) {
            var relative = document.body.parentNode.getBoundingClientRect();
            var ele = document.getElementById('task-quote');
            ele.style.display = 'inline-block';
            ele.style.top = (r.bottom - relative.top) - (r.bottom - r.top) - ele.clientHeight + 'px';
            ele.style.right = -(r.right - relative.right) + (r.right - r.left) - ele.clientWidth + 'px';
        }*/
    }
}

function replaceHighlightedText(replacedElement) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(replacedElement);
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.text = replacedElement;
    }
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
    // removeIcon.onclick = function() {}
    removeIcon.addEventListener('click', function(e){
        e.preventDefault();
        var thisElement = this;
        var parent = thisElement.parentNode;
        var text = parent.innerHTML;
        var grandPa = parent.parentNode;
        var idQ = parent.id;console.log(idQ);
        sendMode('deletequote', idQ);
        parent.className = 'corate corate-non-bg';
        // $(parent).remove('.corate-remove-quote');
        // $(parent).replaceWith(text);
        // grandPa.replaceChild(document.createTextNode(text), parent);
    });
    span.appendChild(removeIcon);
    return span;
}