
//import data
var dataset;
var datarects;
var uniqueDomsHash = {};

var uniqueDoms = new Set();

chrome.runtime.sendMessage({greeting: "activeTraceData"}, function(response) {

    //dataset = response.pq;
	dataset = response.hourdata; 
	console.log(response);
	/* adam, i am passing two datasets
	 * response.hourdata = HH:MM format
	 * response.timestampdata = DD/MM/YY HH:MM format
	 */
	
    //additional data processing

    //a set will identify unique URLS
    for (var i = 0; i < dataset.length; i++)
    {
        uniqueDoms.add(dataset[i].urlName);
    }

    //then hash the set to integrate into dataset

    i = 1;
    for (let item of uniqueDoms)
    {
        uniqueDomsHash[item] = i;
        i++;
    }

    //then iterate through dataset to set lanes to unique urls
    //also format times into date objects
    for (var i = 0; i < dataset.length; i++)
    {
        dataset[i].lane = uniqueDomsHash[dataset[i].urlName];

        if (dataset[i].start)
        {
            dataset[i].start = toTime(dataset[i].start);
            dataset[i].end = toTime(dataset[i].end);
        }

    }

    console.log(dataset);


    //main graphics variable declarations

    var dataLength = dataset.length;

    var w = 1200;
    var h = 800;


    var graphMarginX = 100;
    var graphMarginY = 100;
    var xOffset = 50;
    var yOffset = 50;

    var rectHeight = 10; //temporary, should be defined relative to y scale

    var svg = d3.select("#activeTrace").append("svg:svg")
             .attr("width", w)
             .attr("height", h);



    //-----scales

    //x
    var begDay = new Date();
    begDay.setHours(0,0,0,0);

    var endDay = new Date();
    endDay.setHours(23, 59, 59, 999);


    var xScale = d3.time.scale()
             .domain([begDay, endDay])
             .range([0,w]);

    var yScale = d3.scale.linear()
        .domain([0, dataLength])
        .range([0,h]);


    //-----axes

    //x
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10);

    var xAxisG = svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(50, ' + (h-yOffset) + ')')
        .call(xAxis);

    //rects that indicate time on website

    var datarects = svg.append("g")
        .data(dataset)
        .append("rect")
        .attr("class", "dataRects")
        .attr("x", function(d) {return xScale(d.start);})
        .attr("y", function(d) {return yScale(d.lane);})
        .attr("width", function(d) {return xScale(d.end)-xScale(d.start);})
        .attr("height", rectHeight);


    //labels for rects

    svg.append("g")
        .data(dataset)
        .append("text")
        .text(function(d) {return d.urlName;})
        .attr("x", 50)
        .attr("y", function(d) {return yScale(d.lane) + (rectHeight);});

    //change x attr to something smarter

});



//time parser

function toTime(timeString)
{

    if (timeString) //null check
    {
        var time = new Date();

        var hours = parseInt(timeString.substring(0,2));
        var minutes = parseInt(timeString.substring(3));

        time.setHours(hours, minutes);

        return time;

    }

    else console.log("null start or end time");

}


/*
    //y
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")


    var yAxisG = svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + xOffset + ', 0)')
        .call(yAxis);
*/
