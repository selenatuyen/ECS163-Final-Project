var svg2 = d3.select("#pie").append("svg")
			.attr("width", d3.select("#pie").style("width"))
			.attr("height", d3.select("#pie").style("height")),
	width2 = parseInt(svg2.style("width")),
	height2 = parseInt(svg2.style("height")),
	radius = Math.min(width2, height2) / 2,
	g = svg2.append("g").attr("class","slices").attr("transform", "translate(" + width2 / 2 + "," + height2 / 3 + ")");


var legColorSize = radius * 0.05,
	legOffset = radius * 0.02;

var pie = d3.pie()
	.sort(null)
	.value(function(d) { return d.curYear; });

var keepData = null,
	arcPie = null;

var path2 = d3.arc()
	.outerRadius(radius - 10)
	.innerRadius(radius - 90);

function pieChart() {
	var color = d3.scaleOrdinal(d3.schemeCategory20b);

	d3.select(".title").text(selectedYear + " Food Types");

	d3.csv("Data/world-totals.csv", function(d) {
		for (var i = 1999; i < 2015; i++) {
			d[i] = +d[i];
		}
		d.curYear = d[selectedYear];
		return d;
	}, function(error, data) {
		if (error) throw error;

		keepData = data;

		arcPie = g.selectAll(".arc")
			.data(pie(data))
			.enter().append("path")
			.attr("class", "slice")
			.attr("d", path2)
			.attr("fill", function(d) { return color(d.data.Type); });

		var legend = svg2.selectAll(".legend")
			.data(color.domain())
			.enter()
			.append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) {
				var height = legColorSize + legOffset;
				var offset = height * color.domain().length / 2;
				var horz = -3 * legColorSize;
				var vert = i * height - offset;
				return "translate(" + horz * -6 + "," + (vert + 230) + ")";
			});

		legend.append("rect")
			.attr("width", legColorSize / 1.5)
			.attr("height", legColorSize / 1.5)
			.style("fill", color)
			.style("stroke", color);

		legend.append("text")
			.attr("font-size", "10px")
			.attr("x", legColorSize / 2 + legOffset)
			.attr("y", legColorSize / 2 - legOffset + 5)
			.text(function(d) { return d; });
	});
}

function updatePie(yr) {
	console.log(yr);
	d3.select(".title").text(yr + " Food Types");

	pie.value(function(d) { return d[yr]; });
	var newarc = arcPie.data(pie(keepData))
		.transition()
		.duration(2000)
		.attr("d", path2);
}

pieChart();