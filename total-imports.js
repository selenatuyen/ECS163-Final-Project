var sel = document.getElementById("years");
for (var i = 1999; i < 2015; i++) {
	var option = document.createElement("option");
	option.text = i.toString();
	option.value = i.toString();
	sel.add(option);
}

var svg = d3.select("svg"),
	width = +svg.attr("width"),
	height = +svg.attr("height"),
	radius = Math.min(width, height) / 2,
	g = svg.append("g").attr("class","slices").attr("transform", "translate(" + width / 2.5 + "," + height / 2 + ")");

var legColorSize = radius * 0.05,
	legOffset = radius * 0.02;

var color = d3.scaleOrdinal(d3.schemeCategory20b);

var pie = d3.pie()
	.sort(null)
	.value(function(d) { return d.curYear; });

var path = d3.arc()
	.outerRadius(radius - 10)
	.innerRadius(radius - 90);

var keepData = null,
	arc = null;


d3.csv("world-totals.csv", function(d) {
	for (var i = 1999; i < 2015; i++) {
		d[i] = +d[i];
	}
	d.curYear= d[1999];
	return d;
}, function(error, data) {
	if (error) throw error;

	keepData = data;

	arc = g.selectAll(".arc")
		.data(pie(data))
		.enter().append("path")
		.attr("class", "slice")
		.attr("d", path)
		.attr("fill", function(d) { return color(d.data.Type); });

	var legend = svg.selectAll(".legend")
		.data(color.domain())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) {
			var height = legColorSize + legOffset;
			var offset = height * color.domain().length / 2;
			var horz = -3 * legColorSize;
			var vert = i * height - offset;
			return "translate(" + horz*-22 + "," + (vert + 250) + ")";
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

function updatePie() {
	var yr = document.getElementById("years").value;
	pie.value(function(d) { return d[yr]; });
	var newarc = arc.data(pie(keepData))
		.transition()
		.ease(d3.easeElastic)
		.duration(2000)
		.attr("d", path);
}