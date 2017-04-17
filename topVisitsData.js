var topVisit = {website: []};
var i;
var visitsLength = [];
var url;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "topVisitsData") {
            sendResponse(topVisit);
        } 
  });
  
function buildData(mostVisitedURL) {
  var address;
  var name;
  for (i = 0; i < mostVisitedURL.length; i++) {
    address = url_domain(mostVisitedURL[i].url);
    name = mostVisitedURL[i].title;
    topVisit.website.push({Domain:address, Visits:0});
  }
  barChartData();
}

chrome.topSites.get(buildData);

function barChartData() {
    for (i = 0; i < topVisit.website.length; i++) {
		url = topVisit.website[i].Domain;
        chrome.history.search({text: url, startTime:0, maxResults: 15000}, addVisits);
    }
}


function addVisits(visitsArray) {
    visitsLength.push(visitsArray.length);
    topVisit.website[visitsLength.length - 1].Visits = visitsLength[visitsLength.length - 1];
}
function url_domain(data) {	//extract domain from URL
  var    a      = document.createElement('a');
         a.href = data;
         a.hostname = a.hostname.replace("www.","");
  return a.hostname;
}
