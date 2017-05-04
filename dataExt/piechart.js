/**
 * @author Matilda Whitemore
 * @file Display website history in terms of time spent on site in a piechart format.
 * <pre>
 *        Uses a chrome history API to retrieve data
 *        Data is gathered by {@link listen.js} at extension load. The sites are then organized into ten slices
 *        where the 10th category is defined as an "other" section.
 *
 * Overall strategy
 *  1. Send message to the listener on background page to send query data
 *  2. Display the piechart visualization using D3 based on the data parsed
 *  3. Only displays ten slices so the it does not become overcrowded
 *
 * Graph visual:
 * </pre>
 * <img src="./piechart.png">
 * @see adapted from {@link https://bl.ocks.org/mbostock/3887235}
 */
// Initialize dimensions for the chart
var h = 600;
var w = 960;
var radius = h / 2 - 50;

// Create dummy dataset
chrome.runtime.sendMessage({greeting: "pieChartData"}, function(response) {
    var dataset = response.objects;
    
    // Choose a color scale to be used for the wedges
    var color = d3.scale.category20c();

    // Grab onto the piechart div defined in the html file
    // Attach an svg element to  it containing our data set and
    // move it to the center of the svg element
    var svg = d3.select("#piechart").append("svg:svg")
                                    .data([dataset])
                                    .attr("width", w)
                                    .attr("height", h)
                                    .append('g')
                                    .attr('transform', 'translate(' + w / 2 + ',' + h / 2 + ')');

    // create an arc generator going to be used to create the wedges
    var arc = d3.svg.arc()
                .innerRadius(0)
                .outerRadius(radius);

    var arcOver = d3.svg.arc()
          .innerRadius(0)
          .outerRadius(radius + 20);

    // create the pie chart where each slice is equal to the time
    // spen on the corresponding web page
    var pie = d3.layout.pie()
                .value(function(d){return d.time;});


    // enter and append a slice to all elements in the pie chart
    // created above (wedges correspond to total time)
    var arcs = svg.selectAll('g.slice')
                .data(pie)
                .enter()
                    .append('svg:g')
                        .attr('class', 'slice');

                // adding a path creates the wedge and the color is assigned
                // so each wedge is a different color. 
                arcs.append('svg:path')
                    .attr('fill', function(d, i){return color(i);})
                    .attr('d', arc)
                    .on("mouseover", function(d) {
                    d3.select(this).transition()
                    .duration(1000)
                    .attr("d", arcOver);
                    })
                    .on("mouseout", function(d) {
                    d3.select(this).transition()
                    .duration(1000)
                    .attr("d", arc);});

                // add a text element to label each pie slice with the 
                // website name
                arcs.append('svg:text')
                        .attr('class', 'slice')
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .attr("transform", function (d) {
                            d.innerRadius = 0;
                            d.outerRadius = radius;
                            return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
                        })
                        .text(function (d) {
                            return d.data.title;
                        })
                        .on("mouseover", function(d){
                        d3.select(this).transition('text')
                        .duration(1000)
                        .attr("width", '20pt');});

    svg.selectAll('g.slice')
        .on('click', function(d){
                    document.getElementById('slicevalue').innerHTML = 'Slice Value: '+ d.data.time;});

    // function to rotate the text so that it fits in the wedge slice
    function angle(d) {
                    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }
});

