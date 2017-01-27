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

         var margin = { top:20, right: 30, bottom: 30, left:40 },
             height = 60,
             width = 200;

         var x = d3.scale.ordinal()
                         .rangeRoundBands([0, width], .1);

         var y = d3.scale.linear()
                         .range([height, 0]);

         var xAxis = d3.svg.axis()
                           .scale(x)
                           .orient("bottom");

         var yAxis = d3.svg.axis()
                           .scale(y)
                           .orient("left")
                           .tickFormat(d3.format("s"))
                           .ticks(2);

         var chart = barTooltip.append("svg")
                               .attr("width", width + margin.left + margin.right)
                               .attr("height", height + margin.top + margin.bottom)
                               .append("g")
                               .attr("transform", "translate(" + margin.left + ',' + margin.top + ")");

         x.domain(catSales.map(function(d) { return d.category; }));
         y.domain([0, d3.max(catSales.filter(function(d) { return d.id == circleId}), function(d) { return d.sales; })]);

         chart.append("g")
              .attr("class", "x-axis")
              .attr("transform", "translate(0, " + height + ")")
              .call(xAxis);

         chart.append("g")
              .attr("class", "y-axis")
              .call(yAxis);

         chart.selectAll("#barChart")
              .data(catSales)
              .enter().append("rect")
              .filter(function(d){ return d.id == circleId; })
              .attr("class", "bar")
              .attr("x", function(d){ return x(d.category); })
              .attr("y", function(d) { return y(d.sales); })
              .attr("height", function(d) { return height - y(d.sales); })
              .attr("width", x.rangeBand());
       })//end on mouseover
       .on("mouseout", function(d) {
         barTooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
       });//end mouseout
  };//end ready()

d3.select(self.frameElement).style("height", height + "px");
