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
       //sort so larger bubbles are in the background
       .sort(function(a, b){
         return b.properties.profit - a.properties.profit;
       })
       .enter().append("circle")
       .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
       .attr("r", function(d) { return radius(d.properties.profit); })
       .append("title")
       .text( function(d){
         return d.properties.name + "\nProfit: $" + formatSales(d.properties.profit);
       });//end text function
  });//end d3.json function
