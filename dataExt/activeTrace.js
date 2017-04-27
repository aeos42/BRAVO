//import data
var dataset;
var datarects;
var uniqueDomsHash = {};

var uniqueDoms = new Set();


var testData = [{"lane": 1, "domainName": "www.github.com", "start": makeDate(8, 24), "end": makeDate(10, 10)},
                {"lane": 1, "domainName": "www.github.com", "start": makeDate(10, 24), "end": makeDate(11, 54)},
                {"lane": 2, "domainName": "www.google.com", "start": makeDate(11, 24), "end": makeDate(11, 59)},
                {"lane": 4, "domainName": "www.facebook.com", "start": makeDate(4, 30), "end": makeDate(6, 50)},
                {"lane": 5, "domainName": "www.facebook.com", "start": makeDate(1, 30), "end": makeDate(2, 50)},
                {"lane": 3, "domainName": "www.facebook.com", "start": makeDate(3, 30), "end": makeDate(6, 50)},
                {"lane": 6, "domainName": "www.facebook.com", "start": makeDate(3, 30), "end": makeDate(6, 50)}];


var numLanes = 6;


chrome.runtime.sendMessage({greeting: "activeTraceData"}, function(response) {

    //dataset = response.pq;
    dataset = response.hourdata;
    console.log(response);
    /* adam, i am passing two datasets
     * response.hourdata = HH:MM format
     * response.timestampdata = DD/MM/YY HH:MM format
     */

    var dataLength = dataset.length;

    //main graphics variable declarations

    var margins = {"top": 50, "bottom": 50, "left": 100, "right": 50};

    var rectHeight = 20;


    var width = 960;
    var height = (numLanes*20);

    var svg = d3.select("#activeTrace").append("svg")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");



    //-----scales

    //x
    var begDay = new Date();
    begDay.setHours(0,0,0,0);

    var endDay = new Date();
    endDay.setHours(23, 59, 59, 999);


    var xScale = d3.time.scale()
        .domain([begDay, endDay])
        .range([0,width]);

    var yScale = d3.scale.linear()
        .domain([0, numLanes])
        .range([0,height]);


    //-----axes

    //x
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10);

    var xAxisG = svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(50, ' + (height+30) + ')')
        .call(xAxis);

    //rects that indicate time on website

    var datarects = svg.append("g").selectAll("rect")
        .data(testData)
        .enter().append("rect")
        .attr("class", "dataRects")
        .attr("x", function(d) {return xScale(d.start);})
        .attr("y", function(d) {return yScale(d.lane);})
        .attr("width", function(d) {return xScale(d.end)-xScale(d.start);})
        .attr("height", rectHeight);

    console.log(datarects);
    //labels for rects

    svg.append("g").selectAll("labels")
        .data(testData)
        .enter().append("text")
        .text(function(d) {return d.domainName;})
        .attr("x", -50)
        .attr("y", function(d) {return yScale(d.lane) + (rectHeight);});

    svg.selectAll("line.horizontalGrid").data(yScale.ticks(8)).enter()
        .append("line")
        .attr(
            {
                "class":"horizontalGrid",
                "x1" : margins.right,
                "x2" : width,
                "y1" : function(d){ return yScale(d);},
                "y2" : function(d){ return yScale(d);},
                "fill" : "none",
                "shape-rendering" : "crispEdges",
                "stroke" : "black",
                "stroke-width" : "1px",
                "opacity" : "0.5"
            });



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



function makeDate(hours, minutes)
{

    time = new Date();

    time.setHours(hours, minutes, 0, 0);

    return time;
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


*/
