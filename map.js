var width = 960,
    height = 500;

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("class", "worldmap");

svg.append("rect")
    .attr("width", "80%")
    .attr("height", "100%")
    .attr("fill", "#455772");

var importAmount = {};
var importData, selectedContinent = "ALL", selectedYear = 2014;
var worldjson;

var color = d3.scaleThreshold()
    .domain([100, 1000, 2500, 5000, 10000, 15000, 20000])
    .range(d3.schemeBlues[8]);

// var path = d3.geoPath();

var projection = d3.geoMercator()
    .scale(190)
    .translate([width / 2 + 20, height / 1.5 + 80]);

var path = d3.geoPath().projection(projection);


var tip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// var arccolor = {
//     "AF": "#F9DE7C",
//     "AS": "#D87093",
//     "EU": "#F7986C",
//     "NA": "#80639B",
//     "OC": "#5DBFCC",
//     "SA": "#9BEFB6",
//     "ALL": "#808080"
// };

var arccolor = {
    "AF": "#B72828",
    "AS": "#63ADF2",
    "EU": "#EDC16C",
    "NA": "#F433EB",
    "OC": "#9733F4",
    "SA": "#F9965C",
    "ALL": "#8D8187"
};


d3.queue()
    .defer(d3.json, "https://d3js.org/world-110m.v1.json")
    .defer(d3.csv, "Data/country-import-amount.csv")//, function(d) { importAmount[parseInt(d.CountryID)] = +d[2014]; })
    .await(ready);

function ready(error, world, csv) {
    if (error) throw error;

    importData = csv;
    worldjson = world;

    csv.forEach(function(d) {
        var cid = "s" + d["CountryID"];
        makeLightbox(cid);
        console.log("made box");
        importAmount[d.CountryID] = {};
        for (var key in d) {
            if (key != "CountryID")
                importAmount[d.CountryID][key] = d[key];
        }
    });

    d3.selectAll('.contButton').each(function() {
        var id = d3.select(this).attr("id");
        d3.select(this).style("background", function(x) {
            return arccolor[id];
        });
    });

    drawMap(worldjson);
    drawArcs(selectedContinent); // show all continents at beginning
    animateMarkers(selectedYear);
}

function drawMap() {
    svg.selectAll(".country").remove();
 
    svg.selectAll("append")
        .data(topojson.feature(worldjson, worldjson.objects.countries).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("title", function(d) {
            return d.id;
        })
        .attr("fill", function(d) { 
            if (parseInt(d.id, 10) in importAmount && (importAmount[parseInt(d.id, 10)].Continent == selectedContinent || selectedContinent == "ALL")) {
                return "#A7C1A6"
            } else if (d.id == 840) {
                return "#7FAD7C";
            } else {
                return "#546B84";
            }
        })
        .on("mouseover", function(d) {
            if (parseInt(d.id, 10) in importAmount && (importAmount[parseInt(d.id, 10)].Continent == selectedContinent || selectedContinent == "ALL")) {
                d3.select(this).style("cursor", "pointer");
                d3.select("#c" + parseInt(d.id, 10))
                    .style("opacity", 1);
                tip.transition()
                    .duration(200)
                    .style("opacity", .9)
                    .style("visibility", "visible");
                tip.html(selectedYear + "</br/>" + importAmount[parseInt(d.id, 10)].Country + "<br/>$" + importAmount[parseInt(d.id, 10)][selectedYear] + " million")
                    .style("left", (d3.event.pageX - 30) + "px")
                    .style("top", (d3.event.pageY - 100) + "px");
            }
        })
        .on("mouseout", function(d) {
            d3.select("#c" + parseInt(d.id, 10))
                .style("opacity", .6);
            tip.transition()
                .duration(200)
                .style("opacity", "0");
        })
        .on("click", function(d) {
            var cid = "s" + parseInt(d.id, 10);
            goToAnchor(cid);
            var call = d3.select("#" + cid)
                .append("div").attr("id", "sunbst");
            starburst("sunbst", importAmount[parseInt(d.id, 10)].Country);    
        });    
}

function goToAnchor(cid) {
  var loc = document.location.toString().split('#')[0];
  document.location = loc + '#' + cid;
  return false;
}

function drawArcs(continent) {
    svg.selectAll(".arcs").remove();
    svg.selectAll(".circle").remove();

    d3.selectAll('.contButton')
        .classed("selectedCont", false);

    d3.select("#" + continent)
        .classed("selectedCont", true);

    selectedContinent = continent;
    drawMap();

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
            var totalLength = this.getTotalLength();
            // if (d.continent == "NA")
            //     totalLength = totalLength * -1;
            return totalLength;
        })
        .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

    arcs.selectAll("path")
        .on("mouseover", function(d) {
            d3.select(this).style("cursor", "pointer")
                .style("opacity", 1);
            d3.select("#c" + parseInt(d.id, 10))
                .style("opacity", 1);
            tip.transition()
                .duration(200)
                .style("opacity", .9)
                .style("visibility", "visible");
            tip.html(selectedYear + "</br/>" + importAmount[parseInt(d.cid, 10)].Country + "<br/>$" + importAmount[parseInt(d.cid, 10)][selectedYear] + " million")
                .style("left", (d3.event.pageX - 30) + "px")
                .style("top", (d3.event.pageY - 100) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this).style("opacity", .6);
            tip.transition()
                .duration(200)
                .style("opacity", "0");
        })
        .on("click", function(d) {
            var cid = "s" + parseInt(d.cid, 10);
            goToAnchor(cid);
            var call = d3.select("#" + cid)
                .append("div").attr("id", "sunbst");
            starburst("sunbst", importAmount[parseInt(d.cid, 10)].Country);    
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

            tip.transition()
                .duration(200)
                .style("opacity", .9)
                .style("visibility", "visible");
            tip.html(selectedYear + "</br/>" + importAmount[parseInt(d.cid, 10)].Country + "<br/>$" + importAmount[parseInt(d.cid, 10)][selectedYear] + " million")
                .style("left", (d3.event.pageX - 30) + "px")
                .style("top", (d3.event.pageY - 100) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("r", "6px")
                .attr("opacity", .6);

            d3.select('#c' + d.cid)
                .style("opacity", .6);

            tip.transition()
                .duration(200)
                .style("opacity", "0");
        })
        .on("click", function(d) {
            var cid = "s" + parseInt(d.cid, 10);
            goToAnchor(cid);
            var call = d3.select("#" + cid)
                .append("div").attr("id", "sunbst");
            starburst("sunbst", importAmount[parseInt(d.cid, 10)].Country);    
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

    animateMarkers(selectedYear);
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
        // if (!isWest) {
            return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
        // } else {
            // return "M" + targetX + "," + targetY + "A" + dr + "," + dr + " 0 0,1 " + sourceX + "," + sourceY;
        // }
    }
}

function animateMarkers(year){
    svg.selectAll(".marbol").remove();

    selectedYear = year;

    d3.selectAll('.yearButton')
        .classed("selectedYear", false);

    d3.select("#y" + selectedYear)
        .classed("selectedYear", true);

    var jsonObjs = {
        countries:[]
    };
    var maxCap = 50000;

    importData.forEach(function(d){
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

            jsonObjs.countries.push({"cids": cid, "name": cntry, "imports": amt, "rate": rt});
        }
    });


    for(var i = 0; i < jsonObjs.countries.length; i++){
        var rt = jsonObjs.countries[i].rate; 
        var daPath = "path#" + jsonObjs.countries[i].cids;
        var path = d3.select(daPath);//.attr("d");

        var startPoint = pathStartPoint(path);
        
        var marker = svg.append("circle").attr("class", "marbol");
        marker.attr("r", 3)
            .attr("transform", "translate(" + startPoint + ")");

        transitionAll(marker, path, rt);
    }

    function pathStartPoint(path){
        var d = path.attr("d");
        var dsplitted = d.split(" ");
        return dsplitted[1].split(",");
    }

    function transitionAll(marker, path, rt){
        marker.transition()
            .duration(rt).ease(d3.easeLinear)
            .attrTween("transform", translateAlong(path.node()))
            .on("end", partial(transitionAll, marker, path, rt));
    }

    function translateAlong(path){
        var l = path.getTotalLength();
            // console.log(l);
        return function(i){
            return function(t){
                var p = path.getPointAtLength(t* l);
                //console.log(t);
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
}

function makeLightbox(cid){
    var at = d3.select("body")
        .append("a")
        .attr("class", "lightbox")
        .attr('href', "#_")
        .attr('id', cid)
        .on('click', function(){rmSunburst(cid);});   
}

function rmSunburst(cid){
    var att = d3.select("div#sunbst").remove();
}

function starburst(idname, country){
    var DEFAULT_OPTIONS = {
      margin: {top: 10, right: 10, bottom: 30, left: 10}
    };

    var CUSTOM_EVENTS = [
      'arcClick',
      'arcMouseOver',
      'arcMouseMove',
      'arcMouseOut'
    ];

    var Sunburst = d3Kit.factory.createChart(DEFAULT_OPTIONS, CUSTOM_EVENTS, constructor);

    var chart = new Sunburst('div#sunbst');

    chart
      .autoResize('both')
      .on('arcClick', chart.zoom)
      .on('arcMouseOver', chart.mouseover);

    var foodData;

    d3.json('data/all.json', function(error, data) {
        for (var i = 0; i < data.children.length; i++) {
            if (data.children[i].name == country) {
                for (var j = 0; j < data.children[i].children.length; j++) {
                    if (parseInt(data.children[i].children[j].name) == selectedYear) {
                        foodData = data.children[i].children[j];
                        chart.data(data.children[i].children[j]);
                        return;
                    }
                }
            }
        }
    });

    function constructor(skeleton){

      skeleton.autoResizeToAspectRatio(1);

      var layers = skeleton.getLayerOrganizer();
      layers.create(['sunburst']);

      var dispatch = skeleton.getDispatcher();

      var radius = Math.min(skeleton.getInnerWidth(), skeleton.getInnerHeight()) / 2;

      var x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

      var y = d3.scaleSqrt()
        .range([0, radius]);

      var color = d3.scaleOrdinal(d3.schemeCategory20c);

      var core = layers.get('sunburst').append("g")
        .attr("transform", "translate(" + skeleton.getInnerWidth() / 2 + "," + (skeleton.getInnerHeight() / 2 + 10) + ")");

      var partition = d3.partition();

      var arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y1)); })
        .padAngle(0.002);

      // Keep track of the node that is currently being displayed as the root.
      var node;

      // When switching data: interpolate the arcs in data space.
      function arcTweenData(a, i) {
        var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
        function tween(t) {
          var b = oi(t);
          a.x0 = b.x;
          a.dx0 = b.dx;
          return arc(b);
        }
        if (i == 0) {
         // If we are on the first arc, adjust the x domain to match the root node
         // at the current zoom level. (We only need to do this once.)
          var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
          return function(t) {
            x.domain(xd(t));
            return tween(t);
          };
        } else {
          return tween;
        }
      }

      // When zooming: interpolate the scales.
      function arcTweenZoom(d){
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
            yd = d3.interpolate(y.domain(), [0, 1]),
            yr = d3.interpolate(y.range(), [0, radius]);
        return function(d, i) {
          /* jshint ignore:start */
          return i
            ? function(t) { return arc(d); }
            : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
          /* jshint ignore:end */
        };
      }

      function colorFn(d){
        if(d.depth===0) return '#ccc';
        // return color(d.data.name);
        return color((d.children ? d : d.parent).data.name);
      }

      var visualize = d3Kit.helper.debounce(function(){
        if(!skeleton.hasData()) return skeleton;
        var i = 0;
        var myArray = new Array(11);
        var root = d3.hierarchy(skeleton.data());
        root.sum(function(d) 
            { 
                /*
                if(typeof d.value == 'undefined' && check == 0)
                    return d.value;
                else
                {
                    check = 1;
                    return 1;
                }
                */
                if(d.name == "coffeetea" || d.name == "dairy" || d.name == "fish" || d.name == "fruits" 
                || d.name == "grains" || d.name == "meats" || d.name == "nuts" || d.name == "other"
                || d.name == "sweets" || d.name == "vegetables" || d.name == "vegoils") 
                {
                    if(d.children.length != 0)
                    {
                        myArray[i] = d.name;
                    }
                    i++;
                }
                return d.value; 
            });


        node = root;

        radius = Math.min(skeleton.getInnerWidth(), skeleton.getInnerHeight()) / 2;
        y.range([0, radius]);
        core.attr("transform", "translate(" + skeleton.getInnerWidth() / 2 + "," + (skeleton.getInnerHeight() / 2 + 10) + ")");

        var path = core.selectAll("path")
          .data(partition(root).descendants());

        var svg = d3.select("div#sunbst");



        path.enter().append("path")
          .call(d3Kit.helper.bindMouseEventsToDispatcher, dispatch, 'arc')
          .style('fill', colorFn)
          .style('opacity', function(d) {
            if (d.children) 
                return 1;
            else
                return .7;
          })
          .attr("d", arc)
          .on("mouseover", function(d) {
            console.log(d);
            svg.select(".middle-type").html(d.data.name);
            if (d.data.value)
                svg.select(".middle-value").html("$" + d.data.value + " million");
            if (d.data.children && d.data.name != selectedYear) {
                // display sum of children
                var sum = 0;
                for (var i = 0; i < d.data.children.length; i++) {
                    console.log("sum " + d.data.children[i].value);
                    sum += parseInt(d.data.children[i].value);
                }
                svg.select(".middle-value").html("$" + sum + " million");
            }
            
          })
          .on("mouseout", function() {
            svg.select(".middle-type").html("");
            svg.select(".middle-value").html("");
          })
          .append('title')
          .text( function(d) 
            {
              if(typeof d.data.value != 'undefined')
                return d.data.name + ' = $' + d.data.value + " million";
              return d.data.name;
            }
          );
                    
        path
          .attr("d", arc);


        var ordinal = d3.scaleOrdinal(d3.schemeCategory20c)
        .domain(myArray);

        var svg = d3.select("div#sunbst");
         svg.select("svg").append("g")
          .attr("class", "legendOrdinal")
          .attr("transform", "translate(600,90)");
           svg.select("svg").append("text")
            .text(selectedYear + " - " + country)
            .attr("font-size", "1.5em")
            .attr("transform", "translate(500,40)");

        svg.select("svg").append("text")
            .text("Dollars Spent on Each Food Type")
            .attr("font-size", "1em")
            .attr("transform", "translate(500,60)");
        svg.select("svg").append("text")
            .attr("font-size", "20px")
            .attr("transform", "translate(250,230)")
            .attr("class", "middle-type");

        svg.select("svg").append("text")
            .attr("font-size", "20px")
            .attr("transform", "translate(250,230)")
            .attr("dy", "1.5em")
            .attr("class", "middle-value");

        var hasData = false;
        for (var i = 0; i < foodData.children.length; i++) {
            if (foodData.children[i].children.length > 0)
                hasData = true;
        }

        if (!hasData) {
            svg.select("svg").append("text")
                .text("No data available")
                .attr("font-size", "20px")
                .attr("transform", "translate(250,230)")
        }

        var legendOrdinal = d3.legendColor()
         .scale(ordinal);

         svg.select(".legendOrdinal")
         .call(legendOrdinal);

        return skeleton;
      }, 10);


      function zoom(target, i) {
        node = target;
        core.selectAll("path")
          .transition()
            .duration(1000)
            .attrTween("d", arcTweenZoom(target));
      }

      function mouseover(d)
      {
        svg.append("text").text(function(d){console.log("dipslaying value"); return d.data.value;});
      }

      function clear(){
        core.call(d3Kit.helper.removeAllChildren);
        return skeleton;
      }

      skeleton.on('data', visualize);
      skeleton.on('resize', visualize);

      return skeleton.mixin({
        clear: clear,
        visualize: visualize
        //zoom: zoom
      });
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
    