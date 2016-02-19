/*chrome.tabs.query({active:true, currentWindow: true}, function(tab) {console.log('paste1');
	chrome.tabs.sendMessage(tab[0].id, {method: "getSelection"}, function(response){
		if (response.data) {
	    	var text = document.getElementById('text'); 
			text.innerHTML = response.data;
	    }
    });
});*/
window.onload = function() {// send to background
	document.getElementById('paste').onclick = function() {
		chrome.runtime.sendMessage({flag: 'start'}, function(response){
			if (response.data) {
		    	var text = document.getElementById('text'); 
				text.innerHTML = response.data;
		    }
		});
	}
}