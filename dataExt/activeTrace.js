var dataset;
var datarects;

//test data in the absense of real data


var testData = [{"lane": 1, "domainName": "www.github.com", "start": makeDate(8, 24), "end": makeDate(10, 10)},
                {"lane": 1, "domainName": "www.github.com", "start": makeDate(10, 24), "end": makeDate(11, 54)},
                {"lane": 2, "domainName": "www.google.com", "start": makeDate(11, 24), "end": makeDate(11, 59)},
                {"lane": 4, "domainName": "www.facebook.com", "start": makeDate(4, 30), "end": makeDate(6, 50)},
                {"lane": 5, "domainName": "www.facebook.com", "start": makeDate(0, 00), "end": makeDate(2, 50)},
                {"lane": 3, "domainName": "www.facebook.com", "start": makeDate(3, 30), "end": makeDate(6, 50)},
                {"lane": 6, "domainName": "www.facebook.com", "start": makeDate(3, 30), "end": makeDate(6, 50)}];



var numLanes = 6;       // running number of lanes processed, only for test data

chrome.runtime.sendMessage({greeting: "activeTraceData"}, function(response) {
    console.log("StreamgraphData:", response);

    data = response.chrometimedata;
    data.forEach(function(d) {
        d.dwell = ((d.end - d.start)/1000)/60;  // Figure out elapsed minutes
        d.start = new Date(d.start);   // convert timestamp to date
        d.end = new Date(d.end);       // convert timestamp to date
        d.lane = d.lane;
        numLanes = Math.max(numLanes, d.lane);  // figure out lane count
        d.domainName = d.domainName;   // add domainName
    })
    var xMin = d3.min(data, function(d) {return Math.min(d.start); });   //Set Min Time
    var xMax = d3.max(data, function(d) {return Math.max(d.end); });     //Set Max Time

    data = testData.slice();  //  <---- comment this line to go back to testData

    //main graphics variable declarations

    var margins = {"top": 50, "bottom": 100, "left": 200, "right": 50};

    //height of data rects
    var rectHeight = 20;


    //main dimensions
    var width = 900;
    var height = (numLanes*20);

    //main graph gets added to page
    var svg = d3.select("body").append("svg")
        .attr("class", "chart")
        .attr("width", width + margins.left + margins.right)
        .attr("height", height + margins.top + margins.bottom)
        .append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");




    //scale definitons--creates a function from data->page
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




    //define d3 x-axis objet
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10);


    //graphics appending of x-axis objet
    var xAxisG = svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0, ' + (height+50) + ')')
        .call(xAxis);


    //rects that indicate time on website
    var datarects = svg.append("g").selectAll("rect")
        .data(data)
        .enter().append("rect")
        .attr("class", "dataRects")
        .attr("x", function(d) {return xScale(d.start);})
        .attr("y", function(d) {return yScale(d.lane);})
        .attr("width", function(d) {return xScale(d.end)-xScale(d.start);})
        .attr("height", rectHeight)
        .on("mouseover", mouseOver)
        .on("mousemove", mouseMove)
        .on("mouseout", mouseOut);


    //labels for lanes
    svg.append("g").selectAll("labels")
        .data(data)
        .enter().append("text")
        .text(function(d) {return d.domainName;})
        .attr("x", -150)
        .attr("y", function(d) {return yScale(d.lane) + (rectHeight);});


    //lines that separate lanes
    svg.append("g").selectAll(".laneLines")
        .data(data)
        .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) {return yScale(d.lane);})
        .attr("x2", width)
        .attr("y2", function(d) {return yScale(d.lane);})
        .attr("stroke", "lightgray");

    //a second set of lines to draw on the other side of each lane
    svg.append("g").selectAll(".laneLines")
        .data(data)
        .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) {return yScale(d.lane)+rectHeight;})
        .attr("x2", width)
        .attr("y2", function(d) {return yScale(d.lane)+rectHeight;})
        .attr("stroke", "lightgray");

    //tooltip declaration
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("display", "none");


    //functions for tooltip, defines behavior
    function mouseOver()
    {
        div.style("display", "inline");
    }


    function mouseMove(d)
    {

        div.html( d.domainName + "<br>" + Math.round(d.dwell) + " minutes" )   // just display minutes
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");

    }

    function mouseOut()
    {
        div.style("display", "none");
    }



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


//makedate function for test data

function makeDate(hours, minutes)
{

    time = new Date();

    time.setHours(hours, minutes, 0, 0);

    return time;
}
