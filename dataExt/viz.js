window.onload = function(){

    document.getElementById("viz1").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("viz1.html")});});
    document.getElementById("viz2").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("viz2.html")});});
    document.getElementById("activeTrace").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("activeTrace.html")});});
};
