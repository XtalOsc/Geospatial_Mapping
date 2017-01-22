console.log("in geomap.js")

var width = 960;
var height = 600;

var path = d3.geo.path()
.projection(null);

var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height);

d3.json("./data/us.json", function(error, us) {
  if (error) return console.error(error);

  svg.append("path")
  .datum(topojson.feature(us, us.objects.states))
  .attr("class", "land")
  .attr("d", path);
});
