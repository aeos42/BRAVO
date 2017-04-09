// D3 code is adapted from http://bl.ocks.org/WillTurman/4631136
// D3 Interactive Streamgraph

/* Overall strategy
 *  1. Send message to the listener on background page to send query data
 * 	2. Display the scatterplot visualization using D3
 */

var w = 900;
var h = 400;

var datearray = [];
var colorrange = [];
//var data = [];
var selectGraph = "visits";  //'visits' or 'dwell' for initial graph

//  1. Send message to the listener on background page to send query data
chrome.runtime.sendMessage({greeting: "viz5D3", graph: selectGraph}, function (response) {
    data = response.pq;
    console.log("Data returned to streamgraphD3.js", data);
    retlabel = response.label;
    color = "rainbow2";
//	chart("rainbow2");

//function chart(color) {
    if (color === "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color === "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (color === "orange") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    else if (color === "rainbow") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9",
            "#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6",
            "#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6",
            "#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9",
            "#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6",
            "#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color === "rainbow2") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9",
            "#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#660CFD",
            "#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#660CFD",
            "#7fc97f", "#ffff08", "#f0027f", "#bf5b17", "#02FE0D", "#e31a1c",
            "#e41a1c", "#3ffeb8", "#4daf4a", "#984ea3", "#ff7f00", "#31a354",
            "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#b3de69"];
    }

    strokecolor = "#000000";
    var format = d3.time.format("%m/%d/%y");

//set dimensions of canvas/graph
    var margin = {top: 20, right: 40, bottom: 30, left: 30};
    var padding = 10;
    var width = w - margin.left - margin.right - padding;
    var height = h - margin.top - margin.bottom;

//set tooltip area
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "20")
        .style("visibility", "hidden")
        .style("top", "0px")
        .style("left", "55px");

//set the ranges
    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height - 10, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

//define the axes
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.weeks);

    var yAxis = d3.svg.axis()
        .scale(y);

//right y-axis
    var yAxisr = d3.svg.axis()
        .scale(y);

// define the streams visual
    var stack = d3.layout.stack()
        .offset("silhouette") // wiggle, silhouette, expand, zero
        .values(function (d) {
            return d.values;
        })
        .x(function (d) {
            return d.date;
        })
        .y(function (d) {
            return d.value;
        });

    var nest = d3.nest()
        .key(function (d) {
            return d.key;
        });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) {
            return x(d.date);
        })
        .y0(function (d) {
            return y(d.y0);
        })
        .y1(function (d) {
            return y(d.y0 + d.y);
        });

//add the svg canvas
    var svg = d3.select(".chart")
        .append("svg")
        .attr("width", (width + margin.left + margin.right)) //padding*0
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left + padding) + "," + margin.top + ")" + " scale(.95,1)");
    //.attr("scale", "scale(.9)");

    data.forEach(function (d) {
        d.date = format.parse(d.date);
        d.value = +d.value;
    });

    var layers = stack(nest.entries(data));

    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.y0 + d.y;
    })]);

    svg.selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", function (d) {
            return area(d.values);
        })
        .style("fill", function (d, i) {
            return z(i);
        });


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "yr axis")
        .attr("transform", "translate(" + (width) + ", 0)")
        .call(yAxisr.orient("right"));

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis.orient("left"));

    svg.selectAll(".layer")
        .attr("opacity", 1)
        .on("mouseover", function (d, i) {
            svg.selectAll(".layer").transition()
                .duration(250)
                .attr("opacity", function (d, j) {
                    return j != i ? 0.1 : 1;
                });
        })

        .on("mousemove", function (d, i) {
            mousex = d3.mouse(this);
            mousex = mousex[0];
            var invertedx = x.invert(mousex);
            invertedx = invertedx.getMonth() + invertedx.getDate();
            var selected = (d.values);
            for (var k = 0; k < selected.length; k++) {
                datearray[k] = selected[k].date;
                datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
            }

            mousedate = datearray.indexOf(invertedx);
            pro = d3.format(".1f")(d.values[mousedate].value);

            d3.select(this)
                .classed("hover", true)
                .attr("stroke", strokecolor)
                .attr("stroke-width", "0.5px");
            tooltip.html("<p>" + d.key + "<br>" + pro + " " + retlabel + "</p>")
                    .style("visibility", "visible");

        })
        .on("mouseout", function (d, i) {
            svg.selectAll(".layer")
                .transition()
                .duration(250)
                .attr("opacity", "1");
            d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px");
            tooltip.html("<p>" + d.key + "<br>" + pro + "</p>")
                    .style("visibility", "hidden");
        });

    // vertical bar
    var vertical = d3.select(".chart")
        .append("div")
        .attr("class", "remove")
        .style("position", "absolute")
        .style("z-index", "19")
        .style("width", "2px")
        .style("height", (h - 60).toString() + "px")
        .style("top", "35px")
        .style("left", "0px")
        .style("background", "#999");  //was fff

    d3.select(".chart")
        .on("mousemove", function () {
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px");
        })
        .on("mouseover", function () {
            mousex = d3.mouse(this);
            mousex = mousex[0] + 5;
            vertical.style("left", mousex + "px");
        });

    // add buttons
    d3.select(".chart")
        .append("button")
        .text("Dwell Time")
        .style("left", "400px")
        .style("top", "10px")
        .on("click", function () {
            return updateChart("dwell");
        });

    d3.select(".chart")
        .append("button")
        .text("Visits")
        .style("left", "300px")
        .style("top", "10px")
        .on("click", function () {
            return updateChart("visit");
        });

    function updateChart(charttype) {
        //request the new data
        chrome.runtime.sendMessage({greeting: "viz5D3", graph: charttype}, function (response) {
            data = response.pq;
            retlabel = response.label;

            data.forEach(function (d) {
                d.date = format.parse(d.date);
                d.value = +d.value;
            });

            var layers = stack(nest.entries(data));  //define a new stack
            var svg = d3.select(".chart").transition();

            // nest the data
            layers = stack(nest.entries(data));  //bug - need to wipe out existing data

            // Scale the range of the data again
            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));
            y.domain([0, d3.max(data, function (d) {
                return d.y0 + d.y;
            })]);

            d3.selectAll("path")
                .data(layers)
                .transition()
                .duration(750)
                .style("fill", function (d, i) {
                    return z(i);
                })
                .attr("d", function (d) {
                    return area(d.values);
                });

            svg.select(".x.axis") // change the x axis
                .duration(750)
                .call(xAxis);
            svg.select(".y.axis") // change the y axis
                .duration(750)
                .call(yAxis.orient("left"));
            svg.select(".yr.axis") // change the y axis
                .duration(750)
                .call(yAxisr.orient("right"));
        });
    }

});
