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
	g = svg.append("g").attr("class","slices").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(d3.schemeCategory20c);

var pie = d3.pie()
	.sort(null)
	.value(function(d) { return d.curYear; });

var path = d3.arc()
	.outerRadius(radius - 10)
	.innerRadius(radius - 70);

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
});

function updatePie() {
	var yr = document.getElementById("years").value;
	pie.value(function(d) { return d[yr]; });
	var newarc = arc.data(pie(keepData))
		.transition()
		.duration(1000)
		.attr("d", path);
}