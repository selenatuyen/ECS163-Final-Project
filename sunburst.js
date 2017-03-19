var DEFAULT_OPTIONS = {
  margin: {top: 10, right: 10, bottom: 10, left: 10}
};

var CUSTOM_EVENTS = [
  'arcClick',
  'arcMouseOver',
  'arcMouseMove',
  'arcMouseOut'
];

var Sunburst = d3Kit.factory.createChart(DEFAULT_OPTIONS, CUSTOM_EVENTS, constructor);

var chart = new Sunburst('.chart');

chart
  .autoResize('both')
  .on('arcClick', chart.zoom);

d3.json('data/all.json', function(error, data){chart.data(data);});
console.log(data);

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

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var core = layers.get('sunburst').append("g")
    .attr("transform", "translate(" + skeleton.getInnerWidth() / 2 + "," + (skeleton.getInnerHeight() / 2 + 10) + ")");

  var partition = d3.partition();

  var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

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
    return color((d.children ? d : d.parent).data.name);
  }

  var visualize = d3Kit.helper.debounce(function(){
    if(!skeleton.hasData()) return skeleton;

    var root = d3.hierarchy(skeleton.data());
    root.sum(function(d) { return 1; });
    node = root;

    radius = Math.min(skeleton.getInnerWidth(), skeleton.getInnerHeight()) / 2;
    y.range([0, radius]);
    core.attr("transform", "translate(" + skeleton.getInnerWidth() / 2 + "," + (skeleton.getInnerHeight() / 2 + 10) + ")");

    var path = core.selectAll("path")
      .data(partition(root).descendants());

    path.enter().append("path")
      .call(d3Kit.helper.bindMouseEventsToDispatcher, dispatch, 'arc')
      .style('fill', colorFn)
      .attr("d", arc)
      .append('title')
      .text( function(d) {return d.name;});

    path
      .attr("d", arc);

    return skeleton;
  }, 10);

  function zoom(target, i) {
    node = target;
    core.selectAll("path")
      .transition()
        .duration(1000)
        .attrTween("d", arcTweenZoom(target));
  }

  function clear(){
    core.call(d3Kit.helper.removeAllChildren);
    return skeleton;
  }

  skeleton.on('data', visualize);
  skeleton.on('resize', visualize);

  return skeleton.mixin({
    clear: clear,
    visualize: visualize,
    zoom: zoom
  });
}
