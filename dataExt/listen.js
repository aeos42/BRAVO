var data = {"tabs":[],"activeChanged":[],"starts":[],"ends":[],"url":[]};
/*
 *                                       data
 *      tabs      |   activeChanged |   starts      |   ends        |   url
 *      ------------------------------------------------------------------------
 *      dataId  <-|-> dataId      <-|-> dataId    <-|-> dataId    <-|-> dataId
 *      tabId   <-|-> tabId       <-|-> tabId     <-|-> tabId     <-|-> tabId
 *                |   changeTime    |   startTime   |   endTime     |   urlName
 */
var dataId;
var dataIndex;
var dataMap;

// Triggers when a new tab is created
chrome.tabs.onCreated.addListener(function(createdTab) {
/*
 *  When a new tab is created, we need to add
 *  new entries to the following objects
 *      tabs
 *      starts
 *      url
 */

    // If tabs is empty the dataId will be 1
    if (data["tabs"].length === 0) {
        dataId = 1;
    }
    // Othe1rwise the dataId will be one more than the last dataId
    else {
        dataId = data.tabs[data["tabs"].length - 1].dataId + 1;
    }
    //push the various data attributes of the tab into data
    data["tabs"].push({"dataId":dataId,"tabId":createdTab.id});
    data["starts"].push({"dataId":dataId,"tabId":createdTab.id,"startTime":Date()});
    data["url"].push({"dataId":dataId,"tabId":createdTab.id,"urlName":"chrome://newtab/"});
});

// Triggers when the the selected tab changes
chrome.tabs.onActivated.addListener(function(info) {
    /*
     *  When the tab selection changes, we need to add
     *  a new entry to the activeChanged object.
     *  We also need to check to make sure there is a data
     *  entry for the tab already.
     *
     */

    dataMap = data.tabs.map(function(d) { return d['tabId']; });
    dataIndex = dataMap.lastIndexOf(info.tabId);
    /*
     *  There are two reasons why an active tab would not have an entry yet
     *  Reason One:
     *      For some reason, certain websites such as Facebook
     *      will update with a completely new tabId.
     *      When this happens, the tab gets activated before it gets updated.
     *  Reason Two:
     *      The tab was open before data started recording
     *  This checks to see if there is a data entry yet for the active tab
     *  If one is not there, it adds it
     */
    if (dataIndex === -1) {
        if (data["tabs"].length === 0) {
            dataId = 1;
        }
        else {
            dataId = data.tabs[data["tabs"].length - 1].dataId + 1;
        }
        data["tabs"].push({"dataId":dataId,"tabId":info.tabId});
        /*
         *  Now we check if the tab was open already when
         *  data started recording.
         *  If it was, we need to add new entries
         *  to the following objects
         *      starts
         *      url
         */
        chrome.tabs.get(info.tabId, function(tab) {
            if (tab.status === 'complete') {
                data["starts"].push({"dataId":dataId,"tabId":info.tabId,"startTime":Date()});
                data["url"].push({"dataId":dataId,"tabId":info.tabId,"urlName":tab.url});
            }
        });
        dataIndex = data["tabs"].length - 1;
    }

    dataId = data.tabs[dataIndex].dataId;
    data["activeChanged"].push({"dataId":dataId,"tabId":info.tabId,"changeTime":Date()});
});

// Triggers when the url of a tab is changed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
/*
 *  When the url of a tab is changed we need to add
 *  new entries for the following objects
 *      tabs
 *      starts
 *      ends
 *      url
 */
    if (typeof changeInfo.url !== "undefined" && changeInfo.url !== "chrome://newtab/") {
    /*
     *  Two things can happen here
     *      One: When the url was updated, a new tabId was created
     *      Two: The updated url has the same tabId as before
     *  For instance one, a new entry has already been added for
     *  the tab object; the dataId for the last tab will be the one
     *  right before this tab; the dataId for this tab will be
     *  the current dataId.
     *  For instance two, a new entry for the tab object needs to be
     *  added; the dataId for the last tab will be the last dataId;
     *  the dataId for this tab will be the next avaliable dataId.
     */
        // First we find the dataId
        dataMap = data.tabs.map(function(d) { return d['tabId']; });
        dataIndex = dataMap.lastIndexOf(tabId);

        dataId = data.tabs[dataIndex].dataId;

        dataMap = data.starts.map(function(d) { return d['dataId']; });
        dataIndex = dataMap.lastIndexOf(dataId);

    /*
     *  Checks to see if the dataIndex exists.
     *  If it does, then the table already exists
     *  and we are on scenario two.
     *  Otherwise, the page update created a new tabId
     *  and we are on scenario one.
     */
        if (dataIndex === -1) {
        /*
         *  We need to find the last tab and use that information
         *  to add an end entry for the last tab's dataId.
         */
            dataMap = data.activeChanged.map(function(d) { return d['tabId']; });
            var tempTabIndex = dataMap.indexOf(tabId) - 1;
            var tempTabId = dataMap[tempTabIndex];
            tempDataId = data.activeChanged[tempTabIndex].dataId;

            data["ends"].push({"dataId":tempDataId,"tabId":tempTabId,"endTime":Date()});
        }
        else {
        /*
         *  We need to add an end entry for the current dataId
         *  as well as a new tabs entry with the next avaliable
         *  dataId
         */
            data["ends"].push({"dataId":dataId,"tabId":tabId,"endTime":Date()});
            dataId = data.tabs[data["tabs"].length - 1].dataId + 1;
            data["tabs"].push({"dataId":dataId,"tabId":tabId});
        }
        data["starts"].push({"dataId":dataId,"tabId":tabId,"startTime":Date()});
        data["url"].push({"dataId":dataId,"tabId":tabId,"urlName":changeInfo.url});
    }
});

// Triggers when a tab is closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
/*
 *  When a tab is closed we need to add
 *  an entry to the ends object.
 */
    dataMap = data.activeChanged.map(function(d) { return d['dataId']; });
    dataId = dataMap[data.activeChanged.length - 1];

    data["ends"].push({"dataId":dataId,"tabId":tabId,"endTime":Date()});
});




//pie chart message reciever
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "pieChartData") {
            var response = pieChartData();
            sendResponse(response);
        }
    });

//active trace message reciever

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "activeTraceData") {
            var response = activeTraceData();
            sendResponse(response);
        }
    });





function showWebsites() {
    var i;
    for (i = 0; i < data.url.length; i++) {
        if (data.url[i].urlName !== "chrome://newtab/") {
            console.log("ID: " + data.url[i].dataId + "  |  url: " + data.url[i].urlName);
        }
    }
}

function showTimes() {
    var i;
    for (i = 0; i < data.url.length; i++) {
        if (data.url[i].urlName !== "chrome://newtab/") {
            showTime(data.url[i].dataId);
        }
    }
}

function showTime(dataId) {
    var startTime;
    var endTime;
    var activeTime;
    var tempStart;
    var urlName;

    dataMap = data.url.map(function(d) { return d['dataId']; });
    dataIndex = dataMap.indexOf(dataId);
    urlName = data.url[dataIndex].urlName;

    dataMap = data.starts.map(function(d) { return d['dataId']; });
    dataIndex = dataMap.indexOf(dataId);
    startTime = data.starts[dataIndex].startTime;

    dataMap = data.ends.map(function(d) { return d['dataId']; });
    dataIndex = dataMap.indexOf(dataId);

    if (dataIndex === -1) {
        endTime = Date();
    }
    else {
        endTime = data.ends[dataIndex].endTime;
    }

    dataMap = data.url.map(function(d) { return d['dataId']; });
    dataIndex = dataMap.lastIndexOf(dataId);

    tempStart = startTime;
    var i = 0;
    while (i < data.activeChanged.length && Date.parse(tempStart) >= Date.parse(data.activeChanged[i].changeTime)) {
        i++;
    }
    if (i === data.activeChanged.length && Date.parse(tempStart) >= Date.parse(data.activeChanged[i - 1].changeTime)) {
        activeTime = Date.parse(endTime) - Date.parse(tempStart);
    }
    else {
        activeTime = Date.parse(data.activeChanged[i].changeTime) - Date.parse(tempStart);
        while (i < data.activeChanged.length - 1) {
            if (data.activeChanged[i].dataId === dataId) {
                tempStart = data.activeChanged[i].changeTime;
                activeTime += Date.parse(data.activeChanged[i + 1].changeTime) - Date.parse(tempStart);
            }
            i++;
        }
        if (data.activeChanged[i].dataId === dataId) {
            activeTime += Date.parse(endTime) - Date.parse(data.activeChanged[i].changeTime);
        }
    }

    console.log("You spent " + activeTime/1000 +" seconds on " + urlName);
}

function pieChartData() {
/*
 *  This function will be called by piechart.js
 *  It will return a JSON object that will be used
 *  by the piechart to show website names and the
 *  time spent on that website.
 */

    var returnJSON = {"objects":[]};
    var j;
    var dataId;
    var urlName;
    var startTime;
    var endTime;
    var activeTime;
    var tempStart;
    for (j = 0; j < data.url.length; j++) {
        if (data.url[j].urlName.slice(0,6) !== "chrome") {
            dataId = data.url[j].dataId;
            urlName = data.url[j].urlName;
            urlName = urlName.slice(urlName.indexOf("//") + 2);

            if (urlName.indexOf("/") !== -1) {
                urlName = urlName.slice(0, urlName.indexOf("/"));
            }
            // Now that we have the URL name, we need to determine the time spent
            dataMap = data.starts.map(function(d) { return d['dataId']; });
            dataIndex = dataMap.indexOf(dataId);
            startTime = data.starts[dataIndex].startTime;

            dataMap = data.ends.map(function(d) { return d['dataId']; });
            dataIndex = dataMap.indexOf(dataId);

            if (dataIndex === -1) {
                endTime = Date();
            }
            else {
                endTime = data.ends[dataIndex].endTime;
            }

            dataMap = data.url.map(function(d) { return d['dataId']; });
            dataIndex = dataMap.lastIndexOf(dataId);

            tempStart = startTime;
            var i = 0;
            while (i < data.activeChanged.length && Date.parse(tempStart) >= Date.parse(data.activeChanged[i].changeTime)) {
                i++;
            }
            if (i === data.activeChanged.length && Date.parse(tempStart) >= Date.parse(data.activeChanged[i - 1].changeTime)) {
                activeTime = Date.parse(endTime) - Date.parse(tempStart);
            }
            else {
                activeTime = Date.parse(data.activeChanged[i].changeTime) - Date.parse(tempStart);
                while (i < data.activeChanged.length - 1) {
                    if (data.activeChanged[i].dataId === dataId) {
                        tempStart = data.activeChanged[i].changeTime;
                        activeTime += Date.parse(data.activeChanged[i + 1].changeTime) - Date.parse(tempStart);
                    }
                    i++;
                }
                if (data.activeChanged[i].dataId === dataId) {
                    activeTime += Date.parse(endTime) - Date.parse(data.activeChanged[i].changeTime);
                }
            }
            activeTime = activeTime/1000;
            dataMap = returnJSON.objects.map(function(d) { return d['title']; });
            dataIndex = dataMap.lastIndexOf(urlName);

            if (dataIndex === -1) {
                returnJSON["objects"].push({"title":urlName,"time":activeTime});
            }
            else {
                returnJSON.objects[dataIndex].time += activeTime;
            }

        }
    }
    return returnJSON;
}

/*
  function that prepares the data for activetrace
*/

//var data = {"tabs":[],"activeChanged":[],"starts":[],"ends":[],"url":[]};
/*
 *                                       data
 *      tabs      |   activeChanged |   starts      |   ends        |   url
 *      ------------------------------------------------------------------------
 *      dataId  <-|-> dataId      <-|-> dataId    <-|-> dataId    <-|-> dataId
 *      tabId   <-|-> tabId       <-|-> tabId     <-|-> tabId     <-|-> tabId
 *                |   changeTime    |   startTime   |   endTime     |   urlName
*/


function activeTraceData()



{

    var traceData = {"tabs":[],"activeChanged":[],"starts":[],"ends":[],"url":[]};

    var i;
    var j;

    for (i = 0; i < data.tabs.length; i++)
    {

        //grab tabs, and remove the fresh tabs
        if (data.url[i].urlName.slice(0,6) !== "chrome")
        {
            traceData.tabs.push(data.tabs[i]);
        }

}

    //populate the other lists
    for (i = 0; i < traceData.tabs.length; i++)
    {

        /*
          logic of all of these for loops is that if the dataid matches with cleaned tabs data,
          push the attribute onto the cleaned data
        */

        for (j = 0; j < data.activeChanged.length; j++)
        {
            if (traceData.tabs[i].dataId === data.activeChanged[j].dataId)
            {
                traceData.activeChanged.push(data.activeChanged[j]);
            }
        }

        for (j = 0; j < data.starts.length; j++)
        {
            if (traceData.tabs[i].dataId === data.starts[j].dataId)
            {
                traceData.starts.push(data.starts[j]);
            }
        }

        for (j = 0; j < data.ends.length; j++)
        {
            if (traceData.tabs[i].dataId === data.ends[j].dataId)
            {
                traceData.ends.push(data.ends[j]);
            }
        }

        for (j = 0; j < data.url.length; j++)
        {
            if (traceData.tabs[i].dataId === data.url[j].dataId)
            {
                traceData.url.push(data.url[j]);
            }
        }

    }

    return traceData;
}
