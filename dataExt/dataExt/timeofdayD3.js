// D3 code is adapted from http://bl.ocks.org/ericcoopey/6382449
// Coopey's Block 6382449
// https://bl.ocks.org/mbostock/d8bcc4b130df420d6c40

/* Overall strategy
 *  1. Send message to the listener on background page to send query data
 * 	2. Display the scatterplot visualization using D3
 */
var w = 900
var h = 500
 
//  1. Send message to the listener on background page to send query data
chrome.runtime.sendMessage({greeting: "timeofdayD3"}, function(response) {
var data = response.timeSlot;
console.log(data);
// 	2. Display the scatterplot visualization using D3
    var margin = {top: 20, right: 15, bottom: 60, left: 60}
      , width = w - margin.left - margin.right
      , height = h - margin.top - margin.bottom,
      padding = -(margin.left+30);
    
    var x = d3.scale.linear()
              .domain([0, d3.max(data, function(d) { return d.time})])
              .range([ 0, width ]);
    
    var y = d3.scale.linear()
    	      .domain([0, d3.max(data, function(d) { return d.rate; })])
    	      .range([ height, 0 ]);
 
    var chart = d3.select('body')
	.append('svg:svg')
	.attr('width', width + margin.right + margin.left)
	.attr('height', height + margin.top + margin.bottom)
	.attr('class', 'chart')

    var main = chart.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
	.attr('width', width)
	.attr('height', height)
	.attr('class', 'main')   
        
    // draw the x axis
    var xAxis = d3.svg.axis()
	.scale(x)  
	.orient('bottom');
	
	chart.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "end")
		.attr("x", (width+margin.left+margin.right)/2+margin.left)
		.attr("y", height + 60)
		.text("Minutes since midnite");

    main.append('g')
	.attr('transform', 'translate(0,' + height + ')')
	.attr('class', 'main axis date')
	.call(xAxis);
	
    // draw the y axis
    var yAxis = d3.svg.axis()
	.scale(y)
	.orient('left');

    main.append('g')
	.attr('transform', 'translate(0,0)')
	.attr('class', 'axis')
	.call(yAxis);

    var g = main.append("svg:g"); 
    
    g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) { return x(d.time); } )
          .attr("cy", function (d) { return y(d.rate); } )
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2.0)
          .attr("r", 3.5);
          

	main.append("text")
		.attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
		.attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
		.text("Visits");
})
