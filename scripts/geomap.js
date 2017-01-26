console.log("in geomap.js")

var width = 960,
    height = 600;

var path = d3.geo.path()
             .projection(null);

var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

var radius = d3.scale.sqrt()
                     .domain([0, 1e6])
                     .range([0, 15]);

function formatSales(val) {
    var prefix = d3.formatPrefix(val);
    var format = d3.format(".1f");
    return format(prefix.scale(val)) + prefix.symbol;
}//end formatSales

//add legend
var legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (width - 50) + ',' + (height - 20) + ")")
                .selectAll("g")
                .data([1e6, 5e6, 1e7])
                .enter().append("g");

legend.append("circle")
      .attr("cy", function(d) { return -radius(d); })
      .attr("r", radius);

legend.append("text")
      .attr("y", function(d) {return -2 * radius(d); })
      .attr("dy", "1.3em")
      .text(d3.format(".1s"));

//add hovercard
var barTooltip = d3.select("body").append("div")
                   .attr("class","tooltip")
                   .style("opacity", 0)
                   .style("width", 600);

queue()
    .defer(d3.json, "./data/us.json")
    .defer(d3.csv, "./data/category-sales.csv")
    .await(ready);

function ready(error, us, catSales) {
    if (error) throw error;

    svg.append("path")
       .datum(topojson.feature(us, us.objects.nation))
       .attr("class", "land")
       .attr("d", path);

    //add state borders
  	svg.append("path")
   		 .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
   		 .attr("class", "border")
   		 .attr("d", path);

    svg.append("g")
       .attr("class", "bubble")
       .selectAll("circle")
       .data(topojson.feature(us, us.objects.counties).features)
       //sort so larger bubbles are in the background
       .sort(function(a, b) {
         return b.properties.profit - a.properties.profit;
       })
       .enter().append("circle")
       .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
       .attr("r", function(d) { return radius(d.properties.profit); })

       .on("mouseover", function(d) {
         var circleId = d.id;

         barTooltip.transition()
                   .duration(500)
                   .style("opacity", .7)

         var tip = "<h3>" + d.properties.name + "</h3>";
         tip += "<strong>Orders:</strong> " + d.properties.orders + "<br />";
         tip += "<strong>Profit:</strong> $" + formatSales(d.properties.profit) + "<br />";
         tip += "<h4>Category Sales:</h4>";

         barTooltip.html(tip)
                   .style("left", (d3.event.pageX) + "px")
                   .style("top", (d3.event.pageY) + "px");
       })//end on mouseover
       .on("mouseout", function(d) {
         barTooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
       });//end mouseout
  };//end ready()

  	d3.select(self.frameElement).style("height", height + "px");
