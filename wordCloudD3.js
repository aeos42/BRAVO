// D3 code is dapted from http://bl.ocks.org/ericcoopey/6382449
// Coopey's Block 6382449

/* Overall strategy
 *  1. Get the data from listener running on the background page
 * 	2. Take n=topDomains mergedDomains and put into the frequency list and scale the size if needed
 * 	3. Display the wordCloud
 */
var topDomains = 50;	//max number of domains to display
var maxFont = 100;  
var minFont = 5
var maxSize;	//used for scaling - future
var w = 900
var h = 500 	

//  1. Get the data from listener running on the background page
chrome.runtime.sendMessage({greeting: "wordCloudD3"}, function(response) {
	var dataset = response.website;
	var frequencyList = [];  //contains final list of 'pretty' domains (text) and font-size(size)
	var mergedDomains = [];  //list of domains where duplicates are merged, and visit counts increased
	var i;
	
//	2. Take n=topDomains mergedDomains and put into the frequency list and scale the size if needed
	for (i=0; i< Math.min(dataset.length, topDomains); i++) {
		frequencyList.push({text: dataset[i].shortDomain, size: dataset[i].Visits});
	}

// 	3. Display the wordCloud
    var color = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#acb", "#abc", "#bac", "#bca", "#cab", "#cba", "#abd", "#adb", "#bad", "#bda", "#dab", "#dba"]);

    d3.layout.cloud().size([w, h]) //800,300
            .words(frequencyList)
            .rotate(0)
            .fontSize(function(d) { return d.size; })
            .on("end", draw)
            .start();

    function draw(words) {
        d3.select("body").append("svg")
                .attr("width", w) //850,300
                .attr("height", h)
                .attr("class", "wordcloud")
                .append("g")
                // without the transform, words words would get cutoff to the left and top, they would
                // appear outside of the SVG area
                .attr("transform", "translate(375,275)")  //pushes cloud over and down
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", function(d) { return d.size + "px"; })
                .style("fill", function(d, i) { return color(i); })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; });
    }

});
