window.onload = function(){

    document.getElementById("viz1").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("viz1.html")});
    });

                                                   }
