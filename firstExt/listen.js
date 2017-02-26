// Do NOT forget that the method is ASYNCHRONOUS
console.log('hey it worked')

chrome.tabs.query({
    active: true,               // Select active tabs
    lastFocusedWindow: true     // In the current window
}, function(array_of_Tabs) {
    // Since there can only be one active tab in one active window,
    //  the array has only one element
    var tab = array_of_Tabs[0];
    // Example:
    var url = tab.url;
    // ... do something with url variable
    console.log(tab + ' ' + url)
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){

    console.log(changeInfo.url);
    console.log(tabId);
});

chrome.tabs.onActivated.addListener(function(info) {
    console.log("Tab ID: " + info.tabId);
});

chrome.tabs.onCreated.addListener(function(createdTab) {
    console.log("New Tab ID: " + createdTab.id);
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log("closed tab:  " + tabId);
});
