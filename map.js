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
var importData, selectedContinent = "ALL";

var color = d3.scaleThreshold()
	.domain([100, 1000, 2500, 5000, 10000, 15000, 20000])
	.range(d3.schemeBlues[8]);

var path = d3.geoPath();

var projection = d3.geoMercator()
	.scale(190)
	.translate([width / 2 + 20, height / 1.5 + 80]);

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
    "SA": "#9BEFB6",
    "ALL": "#808080"
};


d3.queue()
	.defer(d3.json, "https://d3js.org/world-110m.v1.json")
	.defer(d3.csv, "Data/country-import-amount.csv")//, function(d) { importAmount[parseInt(d.CountryID)] = +d[2014]; })
	.await(ready);

function ready(error, world, csv) {
	if (error) throw error;

    importData = csv;

	svg.selectAll("append")
		.data(topojson.feature(world, world.objects.countries).features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "country")
        .attr("title", function(d) {
            return d.id;
        })
		.attr("fill", function(d) { 
			if (parseInt(d.id, 10) in importAmount) {
                return "#FFFFFF"
			} else if (d.id == 840) {
				return "#880000";
			} else {
                return "#A9A9A9";
            }
        })
        .on("mouseover", function(d) {
            d3.select(this).style("cursor", "pointer");
            console.log(d.id);
            d3.select("#c" + parseInt(d.id, 10))
                .style("opacity", 1);
        })
        .on("mouseout", function(d) {
            d3.select("#c" + parseInt(d.id, 10))
                .style("opacity", .6);
        })
        .on("click", function(d) {
            showPopup();
        });

    d3.selectAll('.contButton').each(function() {
        var id = d3.select(this).attr("id");
        d3.select(this).style("background", function(x) {
            return arccolor[id];
        });
    });

    drawArcs("ALL"); // show all continents at beginning
    animate(2014);
}

function drawArcs(continent) {
    svg.selectAll(".arcs").remove();
    svg.selectAll(".circle").remove();

    d3.selectAll('.contButton')
        .classed("selectedCont", false);

    d3.select("#" + continent)
        .classed("selectedCont", true);

    selectedContinent = continent;

    var arcs = svg.append("g")
        .attr("class", "arcs");

    arcs.selectAll("path")
        .data(countrycoords.filter(function(d) {
            return continent == "ALL" || d.continent == continent;
        }))
        .enter()
        .append("path")
        .attr("id", function(d) {
            return "c" + d.cid;
        })
        .attr("d", function(d) {
            return calcArc(d, "source", "target", 1.5);
        })
        .attr("stroke", function(d) {
            return arccolor[d.continent];
        })
        .attr("opacity", .6)
        .attr("stroke-dasharray", function() {
            var totalLength = this.getTotalLength();
            return totalLength + " " + totalLength;
        })
        .attr("stroke-dashoffset", function(d) {
            var totalLength = -this.getTotalLength();
            if (d.continent == "NA")
                totalLength = totalLength * -1;
            return totalLength;
        })
        .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

    arcs.selectAll("path")
        .on("mouseover", function(d) {
            console.log(d.cid + " " + d.continent);
            d3.select(this).style("cursor", "pointer")
                .style("opacity", 1);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", .6);
        });

    var outerCircle = svg.append("g")
        .attr("class", "circle");

    outerCircle.selectAll("circle")
        .data(countrycoords.filter(function(d) {
            return continent == "ALL" || d.continent == continent;
        }))
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
        .attr("opacity", .6)
        .on("mouseover", function(d) {
            d3.select(this)
                .style("cursor", "pointer")
                .attr("r", "8px")
                .attr("opacity", 1);

            d3.select('#c' + d.cid)
                .style("opacity", 1);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("r", "6px")
                .attr("opacity", .6);

            d3.select('#c' + d.cid)
                .style("opacity", .6);
        });

    var innerCircle = svg.append("g")
        .attr("class", "circle");

    innerCircle.selectAll("circle")
        .data(countrycoords.filter(function(d) {
            return continent == "ALL" || d.continent == continent;
        }))
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

    animate(2014);
}

function calcArc(d, sourceName, targetName, bend) {
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

function animate(year){
    svg.selectAll(".marbol").remove();

    var jsonObjs = {
        countries:[]
    };
    var maxCap = 50000;
    // d3.csv("data/country-import-amount.csv", function(err, data){
    //     if(err){
    //         console.log(err);
    //     }
    importData.forEach(function(d){
        console.log(d.Continent);
        if (d.Continent == selectedContinent || selectedContinent == "ALL") {
            var cntry = d["Country"];
            var amt = d[year];
            var cid = "c" + d["CountryID"];
            var rt = maxCap;
            rt = maxCap/amt * 100;
            if(rt <+ 200){
                rt = 200;
            }
            else if(rt > 15000){
                rt = 11000;
            }
            // console.log(cntry + " " + rt);
            jsonObjs.countries.push({"cids": cid, "name": cntry, "imports": amt, "rate": rt});
        }
    });


    for(var i = 0; i < jsonObjs.countries.length; i++){
        //var svg = d3.select("svg");
        var rt = jsonObjs.countries[i].rate; 
        var daPath = "path#" + jsonObjs.countries[i].cids;
        var path = d3.select(daPath);//.attr("d");
        // console.log("daf " + path);
        
        var startPoint =pathStartPoint(path);
        console.log("path start:" + startPoint);
        
        var marker = svg.append("circle").attr("class", "marbol");
        marker.attr("r", 3)
            .attr("transform", "translate(" + startPoint + ")");

        transitionAll(marker, path, rt);
        // console.log("transition called");
        // break;
    }

    function pathStartPoint(path){
        var d = path.attr("d");
        var dsplitted = d.split(" ");
        return dsplitted[1].split(",");
    }

    function transitionAll(marker, path, rt){
        // console.log(marker);
        marker.transition()
            .duration(rt).ease(d3.easeLinear)
            .attrTween("transform", translateAlong(path.node()))
            .on("end", partial(transitionAll, marker, path, rt));
    }

    function translateAlong(path){
        var l = path.getTotalLength();
        return function(i){
            return function(t){
                var p = path.getPointAtLength(t* l);
                return "translate(" + p.x + "," + p.y + ")";
            }
        }
    }  

    function partial(func){
        var args = Array.prototype.slice.call(arguments, 1);
        return function(){
            var allArguments = args.concat(Array.prototype.slice.call(arguments));
            return func.apply(this, allArguments);
        };
    }          
    // }); 
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
    