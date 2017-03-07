var topVisit = {website: []};
var i;
var visitsLength = [];
var url;
function buildData(mostVisitedURL) {
  var address;
  var name;
  for (i = 0; i < mostVisitedURL.length; i++) {
    address = mostVisitedURL[i].url;
    name = mostVisitedURL[i].title;
    topVisit.website.push({Domain:address, Visits:0});
  }
  barChartData();
}

chrome.topSites.get(buildData);

function barChartData() {
    for (i = 0; i < topVisit.website.length; i++) {
        url = topVisit.website[i].Domain + "*";
        url = url.replace("http://","");
        url = url.replace("https://","");
        url = url.replace("www.","");
        url = "*://*" + url;
        chrome.history.search({text: url, startTime:0, maxResults: 10000}, addVisits);
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "barChartData") {
            sendResponse(topVisit);
        } 
  });

function addVisits(visitsArray) {
    visitsLength.push(visitsArray.length);
    topVisit.website[visitsLength.length - 1].Visits = visitsLength[visitsLength.length - 1];
}