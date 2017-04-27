/**
 * @author Julia Heil
 * @fileOverview Display time-of-day chart for user's chrome history - daily visits by domain.
 * <pre>
 *        Uses a chrome history API to retrieve data
 *        Data is gathered by {@link streamgraphData.js} at extension load, and
 *            then incrementally when this page loads/
 *        Displays visits for all entire {@link STREAMGRAPH_NUMDAYS} as if they occured in a single day
 *        If set to 0, then data for entire chrome history file will be displayed.
 *        Data for {@link TOPVISITS_MAX_DOMAINS} is pulled into D3 chart.
 *        Data is collected in {@link TOD_TIMEINTERVAL) buckets (e.g. 15 = 15 minutes)
 *
 * Overall strategy
 *  1. Send message to the listener on background page to send query data
 *  2. Display the Visits by Time of Day visualization using D3
 *  3. Hovering over a bar will diplay exact number of visits in a tooltip box
 *
 * Graph visual:
 * </pre>
 * <img src="./tod.png">
 * <pre>
 * See {@link tod}  for data format - use tod.timeofday data element
 * </pre>
 * @see adapted from Michael Bostocks Block {@link https://bl.ocks.org/mbostock/d8bcc4b130df420d6c40}
 */

var w = 800;
var h = 500;

//  1. Send message to the listener on background page to send query data
chrome.runtime.sendMessage({greeting: "timeOfDayD3"}, function (response) {
    var parseTime = d3.time.format.utc("%H:%M").parse,
        midnight = parseTime("00:00");
    var data = response.timeSlot;
    data.forEach(function(d) {
        d.rate = +d.rate;
        d.time = parseTime(d.time);
    });
    console.log(response);
// 	2. Display the scatterplot visualization using D3
    var margin = {top: 20, right: 30, bottom: 60, left: 60};
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var padding = -(margin.left + 30);

    var x = d3.time.scale.utc()
        .domain([midnight, d3.time.day.utc.offset(midnight, 1)])
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        y.domain([0, d3.max(data, function(d) { return d.rate; })]);

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickFormat(d3.time.format.utc("%I %p")));

        svg.append("g")
            .attr("class", "dots")
            .selectAll("path")
            .data(data)
            .enter().append("path")
            .attr("transform", function(d) { return "translate(" + x(d.time) + "," + y(d.rate) + ")"; })
            .attr("d", d3.svg.symbol()
                .size(40));

        var tick = svg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.svg.axis()
                .scale(y)
                .tickSize(-width)
                .orient("left"))
            .select(".tick:last-of-type");

});
