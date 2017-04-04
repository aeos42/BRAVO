// Using AlaSQL for queries - http://alasql.org/
// test with https://jsfiddle.net/jheil/s6onp5jc/

/* Overall strategy
 *  1. Setup listeners for D3 visualizations to send back JSON data
 * 	2. Call chrome history and set up the history array (onetime only)
 * 	3. Process history array (callback function) and cleanup domain names
 *     (drop long names, extract hostnames, merge duplicate records, etc)
 * 		3a. Process Data for TopVisitsD3 and wordCloudD3
 */
var visits 		= {history: []};	// added for alaSQL testing
var query4 		= {wordList: []};	// WordCloud return data
var query1		= {history: []};	// Top Visits return data
var usecPerDay 	= 1000 * 60 * 60 * 24;  //one day of microseconds

//  1a. Setup listener for TopVisits and WordCloud
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
 		var daysAgo = (request.days == 0 ? 0 : (new Date).getTime() - request.days*usecPerDay);
        if (request.greeting == "topVisitsD3") {
			chrome.history.search({text: '', startTime: 0, maxResults: 10000}, buildData);
			query1.history = alasql(
				'SELECT domain, SUM(visitCount) AS visits FROM ? \
				 GROUP by domain ORDER BY visits ' + request.sort + ' LIMIT '
					+ request.rows.toString(), [visits.history]
				);  
			sendResponse(query1);
			visits.history = [];	// clear history array
        }
        else if (request.greeting == "wordCloudD3") {
			chrome.history.search({text: '', startTime:daysAgo, maxResults: 10000}, buildData);	
			query4.wordList = alasql(
				'SELECT shortDomain AS text, SUM(visitCount) AS size FROM ? GROUP by shortDomain ORDER BY size ' + request.sort + ' LIMIT '
					+ request.rows.toString(), [visits.history]
				);
			sendResponse(query4);
			visits.history = []; 	// clear history array
        } 
  });


//===========================================================================
// 	2. Call chrome history.search() and get the history array
//  Done one time when the extension is executed

	chrome.history.search({text: '', startTime:0, maxResults: 10000}, buildData);

// 	3. Process history array (callback function) and cleanup domain names
//     (drop long names, extract hostnames, etc)	
function buildData(historyArray) {
	historyArray.forEach(function(v) {
		v.domain = url_domain(v.url);
		v.shortDomain = prettyDomain(v.domain);
		if ((v.domain.length !=0) && (v.domain.length < 25)) {
		v.shortDomain = prettyDomain(v.domain);
			visits.history.push(v);
	 	}
	});
}

function url_domain(data) {	//extract domain from URL
	var    a      = document.createElement('a');
		a.href = data;
		//a.hostname = a.hostname.replace("www.","");
	return a.hostname;
}

function prettyDomain(str) {  // make domain short and sweet
	var topLevelDomains = [".com", ".edu", ".gov", ".org", ".net", ".int", ".mil", ".arpa", ".io", ".tv"];  //there are thousands of these...
	var resStr = str.replace("www.","");
	topLevelDomains.forEach(function(e) {
		resStr = resStr.replace(e, "");
	});
	return resStr;
}




