console.log("in geomap.js")

var width = 960,
    height = 600;

var path = d3.geo.path()
             .projection(null);

var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

var color = d3.scale.linear()
                    .domain([-100000, 500000])
                    .range(colorbrewer.Greens[7]);

d3.json("./data/us.json", function(error, us) {
  if (error) throw error;

	//draw base
  svg.append("path")
     .datum(topojson.feature(us, us.objects.nation))
     .attr("class", "land")
     .attr("d", path);

	//add state borders
	svg.append("path")
		 .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		 .attr("class", "border state")
		 .attr("d", path);

	//add county borders
  svg.append("g")
     .attr("class", "counties")
     .selectAll("path")
     .data(topojson.feature(us, us.objects.counties).features)
     .enter().append("path")
     .attr("class", "county")
     .attr("d", path)
     .attr("fill", function(d) {return color(d.properties.profit); });

});//end d3.json function
