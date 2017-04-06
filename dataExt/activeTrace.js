
//import data
var dataset;

chrome.runtime.sendMessage({greeting: "activeTraceData"}, function(response) {

    dataset  = response.hourdata;
    dataset2 = response.timestampdata;
    console.log("HH:MM Dataset returned from query", dataset); 
    console.log("MM/DD/YY HH:MM Dataset returned from query", dataset2);
    var w = 1000;
    var h = 600;


    var graphMarginX = 100;
    var graphMarginY = 100;
    var xOffset = 50;
    var yOffset = 50;

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
        .range([0, w]);

    //y
    var yScale = d3.scale.ordinal()
        .domain(dataset.url.urlName)   //adam - there is a problem here with the data import.  what json format do you want for your dataset?
        .rangeRoundBands([0, w]);

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


                //y
                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")


    var yAxisG = svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + xOffset + ', 0)')
        .call(yAxis);
});
