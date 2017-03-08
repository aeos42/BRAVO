// D3 code adapted from http://bl.ocks.org/bceskavich/a9a365467b5e1d2075f6
// Billy Ceskavich's Block

/* Overall strategy
 *  1. Send message to the listener on background page to send query data
 * 	2. Take n=topDomains mergedDomains and put into the display dataSet
 * 	3. Present the D3 bargraph visualization
 */
var topDomains = 50;	//max number of domains to display
var w = 900
var h = 500
 	
//  1. Send message to the listener on background page to send query data
//chrome.runtime.sendMessage({greeting: "topVisitsData"}, function(response) {
chrome.runtime.sendMessage({greeting: "topVisitsD3"}, function(response) {
	var data = response.website;
 
console.log(data);   

// 	2. Take n=topDomains mergedDomains and put into the display dataSet
	var dataset = [];
	var i;
	for (i=0; i<topDomains; i++) {	//just use top site to display
		dataset.push({Domain: data[i].Domain, Visits: data[i].Visits});
	}

// 	3. Present the D3 bargraph visualization
     // Dimensions for the chart: height, width, and space b/t the bars
        var margins = {top: 30, right: 50, bottom: 200, left: 50}
        var height = h - margins.top - margins.bottom,
            width = w - margins.left - margins.right,
            barPadding = 1

        // Create a scale for the y-axis based on data
        // >> Domain - min and max values in the dataset
        // >> Range - physical range of the scale (reversed)
        var yScale = d3.scale.linear()
          .domain([0, d3.max(dataset, function(d){
            return d.Visits;
          })])
          .range([height, 0]);

        // Implements the scale as an actual axis
        // >> Orient - places the axis on the left of the graph
        // >> Ticks - number of points on the axis, automated
        var yAxis = d3.svg.axis()
          .scale(yScale)
          .orient('left')
          .ticks(5);

        // Creates a scale for the x-axis based on Domain names
        var xScale = d3.scale.ordinal()
          .domain(dataset.map(function(d){
            return d.Domain;
          }))
          .rangeRoundBands([0, width], .1);

        // Creates an axis based off the xScale properties
        var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient('bottom');

        // Creates the initial space for the chart
        // >> Select - grabs the empty <div> above this script
        // >> Append - places an <svg> wrapper inside the div
        // >> Attr - applies our height & width values from above
        var chart = d3.select('.main')
          .append('svg')
          .attr('width', width + margins.left + margins.right)
          .attr('height', height + margins.top + margins.bottom)
          .append('g')
          .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        // For each value in our dataset, places and styles a bar on the chart

        // Step 1: selectAll.data.enter.append
        // >> Loops through the dataset and appends a rectangle for each value
        chart.selectAll('rect')
          .data(dataset)
          .enter()
          .append('rect')

          // Step 2: X & Y
          // >> X - Places the bars in horizontal order, based on number of
          //        points & the width of the chart
          // >> Y - Places vertically based on scale
          .attr('x', function(d, i){
            return xScale(d.Domain);
          })
          .attr('y', function(d){
            return yScale(d.Visits);
          })

          // Step 3: Height & Width
          // >> Width - Based on barpadding and number of points in dataset
          // >> Height - Scale and height of the chart area
          .attr('width', (width / dataset.length) - barPadding)
          .attr('height', function(d){
            return height - yScale(d.Visits);
          })
          .attr('fill', 'steelblue')

          // Step 4: Info for hover interaction
          .attr('class', function(d){
            return d.Domain;
          })
          .attr('id', function(d){
            return d.Visits;
          });

        // Renders the yAxis once the chart is finished
        // >> Moves it to the left 10 pixels so it doesn't overlap
        chart.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(-10, 0)')
          .call(yAxis);

        // Appends the xAxis
        chart.append('g')
          .attr('class', 'axis')
          .attr('transform', 'translate(0,' + (height + 10) + ')')
          .call(xAxis)
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.3em")
			.attr("dy", ".35em")
			.attr("transform", "rotate(-45)");


        // Adds yAxis title
        chart.append('text')
          .text('Total Visits')
          .attr('transform', 'translate(-70, -20)');
});
