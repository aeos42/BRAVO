// Sunburst.js
// developed from https://bl.ocks.org/mbostock/4348373

// Set some initial dimensions for the vis
var width = 750,
    height = 600,
    radius = (Math.min(width, height) / 2);

// d3.format takes a string as input and returns a function that converts a number to a string
// this specific format removes decimals from the values of time spend on a page
var formatNumber = d3.format(",d");

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

// Set up the color scheme for the sunburst
var color = d3.scale.ordinal()
  .range(["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]);

// partition class is used to create appropriately sized nodes for our input data
var partition = d3.layout.partition()
    .value(function(d) {return d.time;});

// create an arc generator for our sunburst
var arc = d3.svg.arc()
    .startAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x)));})
    .endAngle(function(d) {return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));})
    .innerRadius(function(d) {return Math.max(0, y(d.y));})
    .outerRadius(function(d) {return Math.max(0, y(d.y + d.dy));});

// append the svg element
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

// right now the sunburst is just using a json file where I created dummy data
// to create the sunburst
d3.json("sites.json", function(data) {
  
  // creates the sunburst attached to the svg element
  svg.selectAll("path")
      .data(partition.nodes(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .style("fill", function(d) {return color((d.children ? d : d.parent).name);})
      .on("click", click)
      .on("mouseover", function(d) {
        d3.select(this).style("fill", "#D3D3D3");
        })
      .on("mouseout", function(d) {
        d3.select(this).style("fill", function(d) {return color((d.children ? d : d.parent).name);});
        })
      .append("title")
      .text(function(d) {return "Site: " + d.name + ", Time: " + formatNumber(d.value);});
});

// function to zoom into the sunburst when a section is clicked
function click(d) {
  svg.transition()
      .duration(800)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(t) {x.domain(xd(t)); y.domain(yd(t)).range(yr(t));};
       })
      .selectAll("path")
      .attrTween("d", function(d) {return function() { return arc(d);};});
}


