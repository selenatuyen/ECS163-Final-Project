var width = 960,
	height = 500;

var svg = d3.select("#map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("class", "worldmap");

svg.append("rect")
	.attr("width", "100%")
	.attr("height", "100%")
	.attr("fill", "#455772");

var importAmount = {};

var color = d3.scaleThreshold()
	.domain([100, 1000, 2500, 5000, 10000, 15000, 20000])
	.range(d3.schemeBlues[8]);

var path = d3.geoPath();

var projection = d3.geoMercator()
	.scale(150)
	.translate([width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

var tip = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

d3.queue()
	.defer(d3.json, "https://d3js.org/world-110m.v1.json")
	.defer(d3.csv, "data/country-import-amount.csv", function(d) { importAmount[parseInt(d.CountryID)] = +d[2014]; })
	.await(ready);

function ready(error, world) {
	if (error) throw error;

	svg.selectAll("append")
		.data(topojson.feature(world, world.objects.countries).features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "country")
		.attr("fill", function(d) { 
			if (d.id in importAmount) {
				return color( d.import = importAmount[d.id]);
			}
			else {
				return "#A9A9A9";
			} });
}

/*d3.json("https://d3js.org/world-110m.v1.json", function(error, world) {
	if (error) throw error;

	svg.selectAll("append")
		.data(topojson.feature(world, world.objects.countries).features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "country")
		.attr("fill", function(d) { return color(d.imports = importAmount.get(d.id)); })
		.on("mouseover", function(d) {
			console.log(d.id);
		});
})*/
    