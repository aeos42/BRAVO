var visitTime = {timeSlot: []};   //timeSlot Objects
var timeInterval = 15;	//# min in each interval
var i;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "timeofdayData") {
            sendResponse(visitTime);
        } 
  });

function buildVisits(visitsArray) {
	var msec, val;
	var d = new Date();
	for (i=0; i < visitsArray.length; i++) {
		msec = visitsArray[i].visitTime;
		d.setTime(msec-(msec % (60 * timeInterval * 1000)));
		val = d.getHours()*60 + d.getMinutes();
		index = val / timeInterval;
		visitTime.timeSlot[index].time = val;
		visitTime.timeSlot[index].rate++;
		}
    }

function buildData(historyArray) {
	for (i = 0; i < historyArray.length; i++) {
		chrome.history.getVisits({url: historyArray[i].url}, buildVisits);
	}
}

// main event here - get all history once and parse each result into a time slot
visitTime.timeSlot = [];  // clear the array
for (i = 0; i <= 1440/timeInterval; i++) {	// build new JSON array
	visitTime.timeSlot.push({time: (timeInterval * i), rate: 0}); 
	}	
chrome.history.search({text: '', startTime:0, maxResults: 15000}, buildData);


	




