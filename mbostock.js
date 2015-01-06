// sätter margins, widtho ch height
var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

//Sätter en x-scale
var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

//sätter en y-scale
var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

// treemap layout - om objectet har depth, returnera null, annars, returnera children
//dvs returnera bara chilren till roten, som har depth 0
var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })
    .sort(function(a, b) { return a.value - b.value; })
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

// lägg en svg  på chart. Sätt höjd, bredd, marginal
// lägg på en group, crispedges är en hint om att grafiska är viktigt i renderingen
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

// grandparent - Appendar en g på svg med class grandparent
var grandparent = svg.append("g")
    .attr("class", "grandparent");

// lägger in en rectangle på grandparent g
grandparent.append("rect")
    .attr("y", -margin.top)
    .attr("width", width)
    .attr("height", margin.top);

// lägger in text i grandparent
grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");


// hämtar json objectet och kör då funktionerna intialize, accumulate, layout och display
d3.json("http://codepen.io/boars/pen/7958d57f25d20fae4e606732adbccf73.js", function(root) {
  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  // lägger till x, y, dx, dy och depth till root objectet
  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    return (d._children = d.children)
        ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    //if there are children
    if (d._children) {
      //get the d._children array
      treemap.nodes({_children: d._children});

      // for each of these
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {

    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(name(d));

    //sätter in g före grandparent
    var g1 = svg.insert("g", ".grandparent")
        // d är datat som depth ska bindas till
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
        .enter().append("g");

    // i append, sker på append-delen
    // de children som har children, ska vara klickbara + class "children"
    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    // skapar rektanglar för alla children till children (samma children som ovan). 
    // Om inga barn, binder datan för sig själv
    g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    // sist appendas parent rect (borde heta "node (parent)"/Rouz, med en title (som syns om man hovrar)
    g.append("rect")
        .attr("class", "parent")
        .call(rect)
      .append("title")
        .text(function(d) { return formatNumber(d.value); });

    // appendar texten
    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })
        .call(text);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;
      // g1 är nuvarande vy, g2 är den vy som genereras av
      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function name(d) {
    return d.parent
        ? name(d.parent) + "." + d.name
        : d.name;
  }
});
