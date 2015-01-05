if (x)
  foo
 else
   bar


x ? foo : bar



function doit() {
    var bound = foo
        .selectAll('h2')
        .data(a);
    // update existing
    bound
        .classed('green', false)
    // new
    bound.enter().append('h2')
        .classed('green', true);
    // new and existing
    bound
        .classed('red', false)
        .text(function(d,i) { return 'a[' + i + '] = ' + d; });
    // removed
    bound.exit()
        .classed('red', true);
}


		var nameish = function(d) {
			if (d.value < 21000000) {
				var a = (d.name.split(/\s+/).slice(0,1).join(" ").replace(/,\s*$/, "") );
				return a.length < 12 ? a + ".." : a.substring(0,11) +"..";
			} else {
				return d.name;
			}
		};