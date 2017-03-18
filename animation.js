function animate(year){
	var jsonObjs = {
		countries:[]
	};
	d3.csv("data/country-import-amount.csv", function(err, data){
		if(err){
			console.log(err);
		}
		data.forEach(function(d){
			var cntry = d["Country"];
			if(cntry == "Canada"){
				var amt = d[year];
				console.log("The amount for Canada: " + amt);
				jsonObjs.countries.push({"name": cntry, "imports": amt});
			}
		});
	});


	var svg = d3.select("body").append("svg")
		.attr("width", 960)
		.attr("height", 500);

	var path = svg.append("path")
		.attr("d", "M228.078028797512,269.10110393408445A159.50399078512558,159.50399078512558 0 0,1 236.65194443623426,163.11133291761828");

	startPoint = pathStartPoint(path);
	console.log("start point: " + startPoint);

	var marker = svg.append("circle");
	marker.attr("r", 7)
	  .attr("transform", "translate(" + startPoint + ")");

	transition();

	function pathStartPoint(path) {
	  var d = path.attr("d"),
	  dsplitted = d.split(" ");
	  return dsplitted[1].split(",");
	}

    function transition() {
 	   marker.transition()
      .duration(7500)
      .attrTween("transform", translateAlong(path.node()))
      .each("end", transition);// infinite loop
	}
	  
	function translateAlong(path) {
	  var l = path.getTotalLength();
	  return function(i) {
	    return function(t) {
	      var p = path.getPointAtLength(t * l);
	      return "translate(" + p.x + "," + p.y + ")";//Move marker
	    }
	  }
	}	
}

animate(2014);