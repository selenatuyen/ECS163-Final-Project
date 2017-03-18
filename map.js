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
	.scale(190)
	.translate([width / 2 + 30, height / 1.5 + 80]);

var path = d3.geoPath().projection(projection);

var tip = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var arccolor = {
    "AF": "#F9DE7C",
    "AS": "#D87093",
    "EU": "#F7986C",
    "NA": "#80639B",
    "OC": "#5DBFCC",
    "SA": "#9BEFB6"
};


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
			} 
        });

    var arcs = svg.append("g")
        .attr("class", "arcs");

    arcs.selectAll("path")
        .data(countrycoords)
        .enter()
        .append("path")
        .attr("id", function(d) {
            return d.cid;
        })
        .attr("d", function(d) {
            return makeArc(d, "source", "target", 1.5);
        })
        .attr("stroke", function(d) {
            return arccolor[d.continent];
        });

    var outerCircle = svg.append("g")
        .attr("class", "outer");

    outerCircle.selectAll("circle")
        .data(countrycoords)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return projection(d["source"])[0];
        })
        .attr("cy", function(d) {
            return projection(d["source"])[1];
        })
        .attr("r", "6px")
        .attr("fill", function(d) {
            return arccolor[d.continent];
        })
        .on("mouseover", function() {
            d3.select(this)
                .style("cursor", "pointer")
                .attr("r", "8px")
                .attr("opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this)
                .attr("r", "6px")
                .attr("opacity", .6);
        });

    var innerCircle = svg.append("g")
        .attr("class", "inner");

    innerCircle.selectAll("circle")
        .data(countrycoords)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return projection(d["source"])[0];
        })
        .attr("cy", function(d) {
            return projection(d["source"])[1];
        })
        .attr("r", "3px")
        .attr("fill", "#FFFFFF");
}

function makeArc(d, sourceName, targetName, bend) {
    bend = bend || 1;

    var sourceCoord = d[sourceName], targetCoord = d[targetName];

    if (sourceCoord && targetCoord) {
        var sourceXY = projection(sourceCoord), 
            targetXY = projection(targetCoord);

        var sourceX = sourceXY[0],
            sourceY = sourceXY[1];

        var targetX = targetXY[0],
            targetY = targetXY[1];

        var dx = targetX - sourceX,
            dy = targetY - sourceY,
            dr = Math.sqrt(dx*dx + dy*dy)*bend;

        var isWest = (sourceX - targetX) < 0;
        if (isWest) {
            return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
        } else {
            // return "M0,0,l0,0z";
            return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
        }
    }
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
    