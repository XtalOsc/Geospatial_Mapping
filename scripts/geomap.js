console.log("in geomap.js")

var width = 960,
    height = 600;

var path = d3.geo.path()
    .projection(null);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("./data/us.json", function(error, us) {
  if (error) throw error;

	//draw base
  svg.append("path")
      .datum(topojson.feature(us, us.objects.nation))
      .attr("class", "land")
      .attr("d", path);

	//add state borders
	svg.append("path")
			.datum(topojson.mesh(us, us.objects.states))
			.attr("class", "border state")
			.attr("d", path);

	//add county borders
  svg.append("path")
      .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; }))
      .attr("class", "border county")
      .attr("d", path);

});
