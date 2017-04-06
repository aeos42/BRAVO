var T = {};
T.barChartData = function(url){
	url = url.replace("http://", "");
	url = url.replace("https://", "");
	url = url.replace(/^www./, "");	
	return url;
};
module.exports = T;