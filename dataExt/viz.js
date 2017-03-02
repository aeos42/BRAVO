window.onload = function(){

    document.getElementById("viz").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("helloworld.html")});
    });

                                                   }
