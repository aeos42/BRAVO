window.onload = function(){

    document.getElementById("viz1").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("viz1.html")});});
    document.getElementById("viz2").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("viz2.html")});});
    document.getElementById("viz3").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("viz3.html")});});
    document.getElementById("viz4").addEventListener("click", function(){
        chrome.tabs.create({url:chrome.extension.getURL("viz4.html")});});
};
