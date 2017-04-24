// D3 code is adapted from http://bl.ocks.org/ericcoopey/6382449
// Coopey's Block 6382449
// Using AlaSQL for queries - http://alasql.org/
// test with https://jsfiddle.net/jheil/s6onp5jc/

/* Overall strategy
 *  1. Get the data from listener running on the background page
 *  3. Scale the fontsize for the wordCloud
 * 	3. Display the wordCloud
 */

var maxFont = 100;
var minFont = 30;
var w = 800;
var h = 500;
var maxDataRows = 30; 	//max words in the wordCloud
var numDays = 0;		//0 - all time, 1 - 1 day, 7 - 1 week, 30-30days, etc

//  1. Get the data from listener running on the background page
chrome.runtime.sendMessage({greeting: "wordCloudD3", rows: maxDataRows, sort: "DESC", days: numDays},
    function(response) {
    var frequencyList = response.wordList;
	var i;
    //console.log(frequencyList);
// 2. Scale the fontsize for the wordCloud
	var maxSize = Math.max.apply(Math,frequencyList.map(function(o){return o.size;}));
	var minSize = Math.min.apply(Math,frequencyList.map(function(o){return o.size;}));


// 	3. Display the wordCloud
    var color = d3.scale.linear()
            .domain([0,1,2,3,4,5,6,10,15,20,100])
            .range(["#555", "#acb", "#bac", "#bca", "#cab", "#cba", "#abd", "#adb", "#bad", "#bda", "#dab", "#dba"]);

    d3.layout.cloud().size([w, h]) //800,300
            .words(frequencyList)
            .rotate(0)
			.fontSize(function(d) {return (((maxFont-minFont)*(d.size-minSize))/(maxSize-minSize))+minFont;})
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
                .attr("transform", "translate(300,230)")  //pushes cloud over and down
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


