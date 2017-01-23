console.log("in geomap.js")

var width = 960,
    height = 600;

var path = d3.geo.path()
             .projection(null);

var radius = d3.scale.sqrt()
                     .domain([0, 1e6])
                     .range([0, 15]);

var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

//map profit-by-county for merge
var rateById = d3.map();

//define color pallette using colorbrewer
var color = d3.scale.quantize()
                    .domain([0, .15])
                    .range(colorbrewer.Greens[7]);

//use queue to load multiple files asynchronously
queue()
  .defer(d3.json, "./data/us.json")
  .defer(d3.csv, "./data/profit-county.csv", function(d) { rateById.set(d.id, +d.rate); })
  .await(ready);

  function ready(error, us) {
    if (error) throw error;

    //add county borders
    svg.append("g")
       .attr("class", "counties")
       .selectAll("path")
       .data(topojson.feature(us, us.objects.counties).features)
       .enter().append("path")
       .attr("class", "county")
       .attr("d", path)
       .attr("fill", function(d) { return color(rateById.get(d.id)); });

       //add state borders
     	svg.append("path")
     		 .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
     		 .attr("class", "border")
     		 .attr("d", path);

  };//end ready()

d3.select(self.frameElement).style("height", height + "px");
