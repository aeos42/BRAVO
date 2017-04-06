/* Overall strategy
 *  1. Setup listener for D3 visualizations
 *	2. Setup a list of timeslots {time: "HH:MM", rate: 0) for 1440 / timeInterval slots
 * 	3. Get the history search array 
 * 	4. Look up all the visits for each url returned
 * 	5. Increment the rate count for each visit found (in timeslot array)
 */

var visitTime = {timeSlot: []};   //timeSlot Objects
var timeInterval = 15;	//# min in each interval
var i;
var usecPerDay 	= 1000 * 60 * 60 * 24;  //one day of microseconds
var numDays = 0;	//0 - all history, otherwise number of days of history

//  1. Setup listener for D3 visualizations
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "timeofdayD3") {
            sendResponse(visitTime);
        } 
  });

//	2. Setup a list of timeslots {time: minutes_since_midnite, rate: 0) for (1440 / timeInterval) slots
visitTime.timeSlot = [];  // clear the array
for (i = 0; i <= 1440/timeInterval; i++) {	// build new JSON array
	visitTime.timeSlot.push({time: (timeInterval * i), rate: 0}); 
	}
	
// 	3. Get the history search array 	
var daysAgo = (numDays == 0 ? 0 : (new Date).getTime() - numDays*usecPerDay);
chrome.history.search({text: '', startTime:daysAgo, maxResults: 15000}, buildData);

// 	4. Look up all the visits for each url returned
function buildData(historyArray) {
	for (i = 0; i < historyArray.length; i++) {
		chrome.history.getVisits({url: historyArray[i].url}, buildVisits);
	}
}

// 	5. Increment the rate count for each visit found (in timeslot array)
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





	




