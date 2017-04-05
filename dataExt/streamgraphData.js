//Core API history strategy was based on mechanism used here:
//https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/history/showHistory/typedUrls.js

/* Overall strategy
 *  1. Setup listener for D3 visualizations
 *	2. Call chrome.history and chrome.visits with callback functions
 * 	3. Augment any data items, 'join' history and visit data and push to data array
 * 	4. Process the final data set (sort, calculate dwell times, diagnostics
 * 	5. Build alaSQL query results for D3 operations
*/

//======TESTING ======
var numDays = 60;	//0 - all history, otherwise number of days of history
var maxStreams = 36;
var dwellTimeOn;// = true
var maxDwellHours = 4;	//stop counting dwelltime after this limit
var maxactiveTraceDataItems = 100;
//====================
var msecPerHour = 1000 * 60 *60;
var msecPerDay 	= msecPerHour * 24;  //one day of milliseconds
var searchStartTime = (numDays == 0 ? 0: (new Date).getTime() - msecPerDay*numDays);

var data = [];		//dataset for SQL queries
	data.startTime = function() {
		return data[0].visitTime;
	}
	data.endTime = function() {
		return data[data.length-1].visitTime;
	}
	data.calculateDwell = function() {  //magic - how long did we linger?
		for (var i=0; i<data.length-1; i++) {  //convert to seconds
			dwell = data[i+1].visitTime - data[i].visitTime;
			data[i].dwellTime = Math.min(maxDwellHours, ((dwell/1000)/3600));
			data[i].visitStartTime = timeOfDay(data[i].visitTime); // for activeTrace D3
			data[i].visitEndTime = timeOfDay(data[i+1].visitTime); // for activeTrace D3
		}
		data[data.length-1].dwellTime = 0; // last visit has no dwell time
	}	

var streamQuery	= {pq:[], label: dwellTimeOn ? "hours" : "visits"};	// Top Visits return data
var activeTraceQuery = {pq:[]};  // active Trace return data
var testQuery 	= {pq:[], label: "visits"};

//  1. Setup listener for D3 visualizations
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "viz5D3") {
			if (request.graph == "dwell") {
				dwellTimeOn = true;
				streamQuery.label = "Hours";
				prodQueries(dwellTimeOn);
//				sendResponse(testQuery);
				sendResponse(streamQuery);
			}
			else {
				dwellTimeOn = false;
				streamQuery.label = "Visits";
				prodQueries(dwellTimeOn);
//				sendResponse(testQuery);
				sendResponse(streamQuery);
			}
        }
        else if (request.greeting = "activeTraceData") {
			sendResponse(activeTraceQuery);
		}
});

//	2. Call chrome.history and chrome.visits with callback functions
var numRequestsOutstanding = 0;
var h;		// single record of returned history results
console.time("Chrome history/search call");
chrome.history.search({text: '', maxResults: 1000000, startTime: searchStartTime},
    function(historyItems) {   // For each history item, get details on all visits.
      for (var i = 0; i < historyItems.length; ++i) {
		h = historyItems[i];
        var processVisitsWithUrl = function(hItem) {
          return function(visitItems) {
            processVisits(hItem, visitItems);
          };
        };
		// now get corresponding visits for these history items
	    chrome.history.getVisits({url: h.url}, processVisitsWithUrl(h));
        numRequestsOutstanding++;
      }
console.timeEnd("Chrome history/search call");
});

// 	3. Augment any data items, 'join' history and visit data and push to data array
var processVisits = function(h, visitItems) {
	date = [];
    for (var i=0; i < visitItems.length; ++i) {
		h.domain = url_domain(h.url);  			// build valid host name
		h.shortDomain = prettyDomain(h.domain);	//build short domain name
		visitItems[i].dateStamp = dateStamp(visitItems[i].visitTime);
		if ((h.shortDomain.length <= 30) && 
		    (visitItems[i].visitTime >= searchStartTime) &&
		    (h.shortDomain.length > 0)) {
			data.push(extend(visitItems[i], h)); 
		}
    }
    if (!--numRequestsOutstanding) {
      onAllVisitsProcessed();
    }
};
        		
//	4. Process the final data set (sort, calculate dwell times, diagnostics
var onAllVisitsProcessed = function() {
	console.time("Sort, calculate dwell and query");
    data.sort(function(a, b) {
		return parseFloat(a.visitTime) - parseFloat(b.visitTime); 
    });
    data.calculateDwell();
    console.log("Completed initial data: dataset size - prior to SQL queries:", data.length,  data);

	//diagQueries();
	prodQueries();
	console.timeEnd("Sort, calculate dwell and query");
};

//	5. Build alaSQL query results for D3 operations
function prodQueries(dwell) {
//========== Production Queries =================================
	var pq = [], pq1 = [], pq2=[], pq3=[], pq4=[], pq5=[], pq6=[], pq7=[], pq8=[];
	//stuff for Adam's query
	console.time("alaSQL activeTrace query");
	pq2 =  alasql("SELECT domain as urlName, visitStartTime AS [start], visitEndTime AS [end] FROM ? ORDER BY dwellTime DESC LIMIT " + maxactiveTraceDataItems.toString(), [data]);
	console.log("*********************\ndate query for active Trace:", pq2)
	console.timeEnd("alaSQL activeTrace query");
	activeTraceQuery.pq = pq2;

	// domain list use to fill gaps
	alasql('IF EXISTS (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS \
               WHERE TABLE_NAME = "topsites") DROP VIEW topsites');
	if (dwell) {
		console.time("alaSQL dwell query")
		pq5 = alasql("CREATE VIEW topsites AS SELECT domain, SUM(dwellTime) AS [value] FROM ? GROUP BY domain ORDER BY [value] DESC LIMIT " + maxStreams.toString(),[data]);
		pq6= alasql("SELECT domain, SUM(dwellTime) AS [value] FROM ? GROUP BY domain ORDER BY [value] DESC LIMIT " + maxStreams.toString(), [data]);
		pq4 = alasql("SELECT domain as [key], SUM(dwellTime) AS [value], dateStamp as date FROM ? JOIN topsites USING domain GROUP by domain, dateStamp ORDER BY dateStamp", [data]);
		//consoleQueryStats(pq4, data, "Visit count BY Top N domains, date");
		for (var k in pq6) {  //make sure we have a value for every date
			fillGaps(pq4, Math.max(searchStartTime, data.startTime()), data.endTime(), pq6[k].domain);
		}
		//consoleQueryStats(pq4, data, "Dwell time BY Top N domain - Gap Filled, date");
		pq = alasql("SELECT [key],date, SUM([value]) AS [value] FROM ? GROUP BY [key], date ORDER BY [key], date", [pq4]);
		consoleQueryStats(pq, data, "alaSQL Dwell Query");
		streamQuery.pq = pq;
		console.timeEnd("alaSQL dwell query");
	}
	else {
		console.time("alaSQL visits query")
		pq5 = alasql("CREATE VIEW topsites AS SELECT domain, COUNT(*) AS [value] FROM ? GROUP BY domain ORDER BY [value] DESC LIMIT " + maxStreams.toString(), [data]);
		pq6= alasql("SELECT domain, COUNT(*) AS [value] FROM ? GROUP BY domain ORDER BY [value] DESC LIMIT " + maxStreams.toString(), [data]);
		pq4 = alasql("SELECT domain as [key], COUNT(*) AS [value], dateStamp AS date FROM ? JOIN topsites USING domain GROUP by domain, dateStamp ORDER BY dateStamp", [data]);
		//consoleQueryStats(pq4, data, "Visit count BY Top N domains, date");
		for (var k in pq6) {	//make sure we have a value for every date
			fillGaps(pq4, Math.max(searchStartTime, data.startTime()), data.endTime(), pq6[k].domain);
		}
		//consoleQueryStats(pq4, data, "Visit count BY Top N domain - Gap Filled, date");	
		pq1 = alasql("SELECT [key],date, SUM([value]) AS [value] FROM ? GROUP BY [key], date ORDER BY [key], date", [pq4]);
		consoleQueryStats(pq1, data, "alaSQL Visits Query");
		streamQuery.pq=pq1;
		console.timeEnd("alaSQL visits query");
	}

	function fillGaps(q, start,end,name) {
		t = new Date(start);
		while (t <= end+msecPerDay) {
			q.push({"date": dateStamp(t), "key":  name, "value": 0});
			t.setDate(t.getDate()+1);
		}
	}
}

function consoleQueryStats(q, raw, desc) {
	var tmpq = [], tmpq1 = [];
	var maxCount = Math.max.apply(Math, q.map(function(o){return o.value}))
	var minCount = Math.min.apply(Math, q.map(function(o){return o.value}))
	var totCount = 0; 
	for (i = 0; i<q.length; i++) {totCount += q[i].value;} 
	avgCount = totCount/q.length;
	tmpq = alasql("SELECT [key] from ? GROUP BY [key]", [q]);
	console.log("=========================================================================\n");
	console.log(desc + "\t\tDataset size:", q.length, "\tDomains:", tmpq.length);
	console.log("\tStart Date:", timeStamp(raw.startTime()), "\tEnd date:", timeStamp(raw.endTime()), "\tNumber of days:", ((raw.endTime()-raw.startTime())/msecPerDay).toFixed(1));
	console.log("\tHigh:", maxCount, "\tLow:", minCount, "\tTotal:", totCount.toFixed(2), "\tAverage:", avgCount.toFixed(2));
	console.log("\tQuery:", q);
}

//========== Diagnostic Queries =================================
function diagQueries() { // check status of data (debugging)
	console.log("Diagnostic check of data");
	console.log("     Visits: ", data.length);
	console.log("     Earliest visit time: ", timeStamp(data[0].visitTime));
	t1 = Math.round(((new Date).getTime() - data[0].visitTime)/(1000 * 60 * 60),0)
	t2 = (data.length / t1).toFixed(2);
	console.log("     Total hours:         ", t1)
	console.log("     Visits/hour:         ", t2);
	console.log(data);
	var q1 = [], q2=[], q3=[], q4=[], q5=[], q6=[], q7=[], q9=[];
	var rows = 20;
	var sortOrder = 'DESC'
	q1 = alasql("SELECT * FROM ? GROUP BY url", [data]);
	console.log("\tUnique urls ", q1.length);
	q2 = alasql("SELECT * FROM ? GROUP BY domain", [data]);
	console.log("\tUnique domains ", q2.length);
	q3 = alasql("SELECT * FROM ? GROUP BY shortDomain", [data]);
	console.log("\tUnique shortDomains ", q3.length);
	q4 = alasql("SELECT * FROM ? WHERE transition = 'link' GROUP BY shortDomain", [data]);
	console.log("\tUnique transition 'link' grouped by shortDomain", q4.length);
	q5 = alasql("SELECT * FROM ? WHERE transition = 'typed' GROUP BY shortDomain", [data]);
	console.log("\tUnique transition 'typed' grouped by shortDomain", q5.length);
	q6 = alasql("SELECT transition, COUNT(visitCount) AS total FROM ?  WHERE shortDomain = 'google' GROUP BY transition", [data]);
	for (i=0; i<q6.length; i++) {
		console.log("\tTransition type:", q6[i]);
	}	
	q7 = alasql("SELECT * FROM ? ORDER by dwellTime DESC", [data]);
	console.log("\tDwell Times Max hours: ", (q7[0].dwellTime/3600).toFixed(0));
	for (i=0; i<10; i++) {
		console.log("\t\tDwelltimes:", q7[i].domain, ":", (q7[i].dwellTime/3600).toFixed(4), "hours");
	}
	console.log(q7);
	q8 = alasql("SELECT shortDomain AS domain, ROUND(SUM(dwellTime/3600),2) AS dwellHours, SUM(visitCount) AS visits  FROM ? GROUP BY shortDomain ORDER BY visits DESC", [data]);
	console.log("\tDwell time add Visits Highlights: ", q8);
	q9 = alasql("SELECT shortDomain FROM ? WHERE LEN(shortDomain)>15 GROUP BY shortDomain ORDER BY LEN(shortDomain) DESC", [data]);
	console.log(q9);
}
//======== HELPER FUNCTIONS =======================
function extend(obj, src) {  // merge two objects
	for (var key in src) {
		if (src.hasOwnProperty(key)) obj[key] = src[key];
	}
	return obj;
}

// Convert js timestamp to formatted string https://gist.github.com/hurjas/266048
function timeStamp(dateVal) {
  var t = new Date(dateVal);
  var date = [ t.getMonth() + 1, t.getDate(), t.getFullYear() ];
  var time = [ t.getHours(), t.getMinutes(), t.getSeconds() ];
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
  time[0] = time[0] || 12;
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

function timeOfDay(dateVal) { //converts timestamp to HH:MM format
  var t = new Date(dateVal);
  var time = [ t.getHours(), t.getMinutes() ];
  for ( var i = 1; i < 2; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
  return time.join(":");
}

function dateStamp(dateVal) {
  var t = new Date(dateVal);
  var date = [ t.getMonth() + 1, t.getDate(), t.getFullYear()-2000 ];
  for ( var i = 0; i < 2; i++ ) {
	if ( date[i] < 10 ) {
      date[i] = "0" + date[i];
    }
  }
  return date.join("/");
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
		 
//this is sample data to test the integration with the D3 module
testQuery.pq = [
{key: "192.168.1.52", value:0.1, date:"01/08/13"},
{key: "192.168.1.52", value:0.15, date:"01/09/13"},
{key: "192.168.1.52", value:0.35, date:"01/10/13"},
{key: "192.168.1.52", value:0.38, date:"01/11/13"},
{key: "192.168.1.52", value:0.22, date:"01/12/13"},
{key: "192.168.1.52", value:0.16, date:"01/13/13"},
{key: "192.168.1.52", value:0.07, date:"01/14/13"},
{key: "192.168.1.52", value:0.02, date:"01/15/13"},
{key: "192.168.1.52", value:0.17, date:"01/16/13"},
{key: "192.168.1.52", value:0.33, date:"01/17/13"},
{key: "192.168.1.52", value:0.4, date:"01/18/13"},
{key: "192.168.1.52", value:0.32, date:"01/19/13"},
{key: "192.168.1.52", value:0.26, date:"01/20/13"},
{key: "192.168.1.52", value:0.35, date:"01/21/13"},
{key: "192.168.1.52", value:0.4, date:"01/22/13"},
{key: "192.168.1.52", value:0.32, date:"01/23/13"},
{key: "192.168.1.52", value:0.26, date:"01/24/13"},
{key: "192.168.1.52", value:0.22, date:"01/25/13"},
{key: "192.168.1.52", value:0.16, date:"01/26/13"},
{key: "192.168.1.52", value:0.22, date:"01/27/13"},
{key: "192.168.1.52", value:0.1, date:"01/28/13"},
{key: "docs.google.com", value:0.35, date:"01/08/13"},
{key: "docs.google.com", value:0.36, date:"01/09/13"},
{key: "docs.google.com", value:0.37, date:"01/10/13"},
{key: "docs.google.com", value:0.22, date:"01/11/13"},
{key: "docs.google.com", value:0.24, date:"01/12/13"},
{key: "docs.google.com", value:0.26, date:"01/13/13"},
{key: "docs.google.com", value:0.34, date:"01/14/13"},
{key: "docs.google.com", value:0.21, date:"01/15/13"},
{key: "docs.google.com", value:0.18, date:"01/16/13"},
{key: "docs.google.com", value:0.45, date:"01/17/13"},
{key: "docs.google.com", value:0.32, date:"01/18/13"},
{key: "docs.google.com", value:0.35, date:"01/19/13"},
{key: "docs.google.com", value:0.3, date:"01/20/13"},
{key: "docs.google.com", value:0.28, date:"01/21/13"},
{key: "docs.google.com", value:0.27, date:"01/22/13"},
{key: "docs.google.com", value:0.26, date:"01/23/13"},
{key: "docs.google.com", value:0.15, date:"01/24/13"},
{key: "docs.google.com", value:0.3, date:"01/25/13"},
{key: "docs.google.com", value:0.35, date:"01/26/13"},
{key: "docs.google.com", value:0.42, date:"01/27/13"},
{key: "docs.google.com", value:0.42, date:"01/28/13"},
{key: "Gmail", value:0.21, date:"01/08/13"},
{key: "Gmail", value:0.25, date:"01/09/13"},
{key: "Gmail", value:0.27, date:"01/10/13"},
{key: "Gmail", value:0.23, date:"01/11/13"},
{key: "Gmail", value:0.24, date:"01/12/13"},
{key: "Gmail", value:0.21, date:"01/13/13"},
{key: "Gmail", value:0.35, date:"01/14/13"},
{key: "Gmail", value:0.39, date:"01/15/13"},
{key: "Gmail", value:0.4, date:"01/16/13"},
{key: "Gmail", value:0.36, date:"01/17/13"},
{key: "Gmail", value:0.33, date:"01/18/13"},
{key: "Gmail", value:0.43, date:"01/19/13"},
{key: "Gmail", value:0.4, date:"01/20/13"},
{key: "Gmail", value:0.34, date:"01/21/13"},
{key: "Gmail", value:0.28, date:"01/22/13"},
{key: "Gmail", value:0.26, date:"01/23/13"},
{key: "Gmail", value:0.37, date:"01/24/13"},
{key: "Gmail", value:0.41, date:"01/25/13"},
{key: "Gmail", value:0.46, date:"01/26/13"},
{key: "Gmail", value:0.47, date:"01/27/13"},
{key: "Gmail", value:0.41, date:"01/28/13"},
{key: "yahoo", value:0.1, date:"01/08/13"},
{key: "yahoo", value:0.15, date:"01/09/13"},
{key: "yahoo", value:0.35, date:"01/10/13"},
{key: "yahoo", value:0.38, date:"01/11/13"},
{key: "yahoo", value:0.22, date:"01/12/13"},
{key: "yahoo", value:0.16, date:"01/13/13"},
{key: "yahoo", value:0.07, date:"01/14/13"},
{key: "yahoo", value:0.02, date:"01/15/13"},
{key: "yahoo", value:0.17, date:"01/16/13"},
{key: "yahoo", value:0.33, date:"01/17/13"},
{key: "yahoo", value:0.4, date:"01/18/13"},
{key: "yahoo", value:0.32, date:"01/19/13"},
{key: "yahoo", value:0.26, date:"01/20/13"},
{key: "yahoo", value:0.35, date:"01/21/13"},
{key: "yahoo", value:0.4, date:"01/22/13"},
{key: "yahoo", value:0.32, date:"01/23/13"},
{key: "yahoo", value:0.26, date:"01/24/13"},
{key: "yahoo", value:0.22, date:"01/25/13"},
{key: "yahoo", value:0.16, date:"01/26/13"},
{key: "yahoo", value:0.22, date:"01/27/13"},
{key: "yahoo", value:0.1, date:"01/28/13"},
{key: "github", value:0.1, date:"01/08/13"},
{key: "github", value:0.15, date:"01/09/13"},
{key: "github", value:0.35, date:"01/10/13"},
{key: "github", value:0.38, date:"01/11/13"},
{key: "github", value:0.22, date:"01/12/13"},
{key: "github", value:0.16, date:"01/13/13"},
{key: "github", value:0.07, date:"01/14/13"},
{key: "github", value:0.02, date:"01/15/13"},
{key: "github", value:0.17, date:"01/16/13"},
{key: "github", value:0.33, date:"01/17/13"},
{key: "github", value:0.4, date:"01/18/13"},
{key: "github", value:0.32, date:"01/19/13"},
{key: "github", value:0.26, date:"01/20/13"},
{key: "github", value:0.35, date:"01/21/13"},
{key: "github", value:0.4, date:"01/22/13"},
{key: "github", value:0.32, date:"01/23/13"},
{key: "github", value:0.26, date:"01/24/13"},
{key: "github", value:0.22, date:"01/25/13"},
{key: "github", value:0.16, date:"01/26/13"},
{key: "github", value:0.22, date:"01/27/13"},
{key: "github", value:0.1, date:"01/28/13"},
{key: "moodle.cs.colorado", value:0.1, date:"01/08/13"},
{key: "moodle.cs.colorado", value:0.15, date:"01/09/13"},
{key: "moodle.cs.colorado", value:0.35, date:"01/10/13"},
{key: "moodle.cs.colorado", value:0.38, date:"01/11/13"},
{key: "moodle.cs.colorado", value:0.22, date:"01/12/13"},
{key: "moodle.cs.colorado", value:0.16, date:"01/13/13"},
{key: "moodle.cs.colorado", value:0.07, date:"01/14/13"},
{key: "moodle.cs.colorado", value:0.02, date:"01/15/13"},
{key: "moodle.cs.colorado", value:0.17, date:"01/16/13"},
{key: "moodle.cs.colorado", value:0.33, date:"01/17/13"},
{key: "moodle.cs.colorado", value:0.4, date:"01/18/13"},
{key: "moodle.cs.colorado", value:0.32, date:"01/19/13"},
{key: "moodle.cs.colorado", value:0.26, date:"01/20/13"},
{key: "moodle.cs.colorado", value:0.35, date:"01/21/13"},
{key: "moodle.cs.colorado", value:0.4, date:"01/22/13"},
{key: "moodle.cs.colorado", value:0.32, date:"01/23/13"},
{key: "moodle.cs.colorado", value:0.26, date:"01/24/13"},
{key: "moodle.cs.colorado", value:0.22, date:"01/25/13"},
{key: "moodle.cs.colorado", value:0.16, date:"01/26/13"},
{key: "moodle.cs.colorado", value:0.22, date:"01/27/13"},
{key: "moodle.cs.colorado", value:0.1, date:"01/28/13"}
];



