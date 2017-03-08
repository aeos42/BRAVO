/* Overall strategy
 *  1. Setup listener for D3 visualizations
 * 	2. Call chrome history and get the history array
 * 	3. Process history array (callback function) and cleanup domain names
 *     (drop long names, extract hostnames, etc)
 */
var allHistory = {website: []};	//timeSlot Objects
var wordCloud  = {website: []};	// response for wordCloud
var topVisits  = {website: []};	// response for topVisits
var wordCloudMaxRecords = 200;
var topVisitsMaxRecords = 200;

//  1. Setup listeners for D3 visualizations
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "wordCloudD3") {
			//console.log("requests from wordCloudD3");
			lastRequest = request.greeting;
            sendResponse(wordCloud);
        } 
  });

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "topVisitsD3") {
			lastRequest = request.greeting;
            sendResponse(topVisits);
        }
  });
  
// 	2. Call chrome history and get the history array
allHistory.website = [];  // clear the array
topVisits.website = [];
wordCloud.website = [];

chrome.history.search({text: '', startTime:0, maxResults: 10000}, buildData);

// 	3. Process history array (callback function) and cleanup domain names
//     (drop long names, extract hostnames, etc)
function buildData(historyArray) {
	var i, j=0;
	var address, count, shortDomain;
	for (i = 0; i < historyArray.length; i++) {
		address = url_domain(historyArray[i].url);
		if ((address.length != 0) && (address.length < 25)) {  //drop blank urls and long urls from results
			count = historyArray[i].visitCount;
			shortDomain = prettyDomain(address);
			allHistory.website.push({Domain: address, Visits: count, shortDomain: shortDomain});
		}
	}

	// ====================== now process data for topVisits =================================
	//	Sort the History data by visit count
	allHistory.website.sort(function (a,b) {return b.Visits - a.Visits;});
	
	//  Return the top records
	for (i=0; i<topVisitsMaxRecords; i++) {
		topVisits.website.push({Domain: allHistory.website[i].Domain, Visits: allHistory.website[i].Visits});
	}
	
	// ====================== now process data for wordCloud =================================
	// Sort the shortDomains alphabetically
	allHistory.website.sort(function(a,b) 
		{return (a.shortDomain > b.shortDomain) ? 1 : ((b.shortDomain > a.shortDomain) ? -1 : 0);
	} );
	
	// 	Merge the duplicate domains and add visit counts together into 'mergedDomains' list
	var mergedDomains = [];  //list of domains where duplicates are merged, and visit counts increased
	mergedDomains.push({shortDomain: allHistory.website[0].shortDomain, Visits: allHistory.website[0].Visits});  // push first record
	for (i=1; i<(allHistory.website.length)-1; i++) {	//now merge identical rows
		if (allHistory.website[i].shortDomain == mergedDomains[j].shortDomain) {
			mergedDomains[j].Visits++;
		}	
		else {
			mergedDomains.push({shortDomain: allHistory.website[i].shortDomain, Visits: allHistory.website[i].Visits});  // push next record
			j++;
		}		
	}
	// 	Sort the mergedDomains list by visit count
	mergedDomains.sort(function (a,b) {
		return b.Visits - a.Visits;
	});
	//  Return the top records	
	for (i=0; i<wordCloudMaxRecords; i++) {
		wordCloud.website.push({shortDomain: mergedDomains[i].shortDomain, Visits: mergedDomains[i].Visits});
	}
}

function url_domain(data) {	//extract domain from URL
  var    a      = document.createElement('a');
         a.href = data;
         a.hostname = a.hostname.replace("www.","");
  return a.hostname;
}

function prettyDomain(str) {  // make domain short and sweet
	var topLevelDomains = [".com", ".edu", ".gov", ".org", ".net", ".int", ".mil", ".arpa", ".io", ".tv"];  //there are thousands of these...
	var resStr = str.replace("www.","");
	topLevelDomains.forEach(function(element) {
		resStr = resStr.replace(element, "");
	});
	return resStr;
}




