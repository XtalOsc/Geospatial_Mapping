console.log("in geomap.js")

var width = 960,
    height = 600;

var path = d3.geo.path()
             .projection(null);

var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

//define color pallette using colorbrewer
var color = d3.scale.quantize()
                    .domain([0, .15])
                    .range(colorbrewer.Greens[7]);

d3.json("./data/us.json", function(error, us) {
    if (error) return console.error(error);

    svg.append("path")
       .datum(topojson.feature(us, us.objects.nation))
       .attr("class", "land")
       .attr("d", path);

    //add state borders
  	svg.append("path")
   		 .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
   		 .attr("class", "border border--state")
   		 .attr("d", path);

    svg.append("g")
       .attr("class", "bubble")
       .selectAll("circle")
       .data(topojson.feature(us, us.objects.counties).features)
       .enter().append("circle")
       .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
       .attr("r", function(d) { return Math.sqrt(parseFloat(d.properties.profit) * 0.00005) });

  });//end d3.json function
