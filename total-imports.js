// var sel = document.getElementById("years");
// for (var i = 1999; i < 2015; i++) {
// 	var option = document.createElement("option");
// 	option.text = i.toString();
// 	option.value = i.toString();
// 	sel.add(option);
// }

var svg2 = d3.select("#pie").append("svg")
			.attr("width", d3.select("#pie").style("width"))
			.attr("height", d3.select("#pie").style("height")),
	width2 = parseInt(svg2.style("width")),
	height2 = parseInt(svg2.style("height")),
	radius = Math.min(width2, height2) / 2,
	g = svg2.append("g").attr("class","slices").attr("transform", "translate(" + width2 / 2 + "," + (height2 / 2 - 15) + ")");


var legColorSize = radius * 0.05,
	legOffset = radius * 0.02;

var pie = d3.pie()
	.sort(null)
	.value(function(d) { return d.curYear; });

var keepData = null,
	arc = null;

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

		arc = g.selectAll(".arc")
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
				console.log(horz*-22 + " " + vert+250);
				// return "translate(" + horz*-22 + "," + (vert + 250) + ")";
				return "translate(0,0)";
			});

		legend.append("rect")
			.attr("width", legColorSize)
			.attr("height", legColorSize)
			.style("fill", color)
			.style("stroke", color);

		legend.append("text")
			.attr("x", legColorSize + legOffset)
			.attr("y", legColorSize - legOffset)
			.text(function(d) { return d; });
	});
}

function updatePie() {
	//var yr = document.getElementById("years").value;
	d3.select(".title").text(selectedYear + " Food Types");

	pie.value(function(d) { return d[selectedYear]; });
	var newarc = arc.data(pie(keepData))
		.transition()
		.ease(d3.easeElastic)
		.duration(2000)
		.attr("d", path2);
}

pieChart();