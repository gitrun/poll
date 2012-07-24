window.pie = function(data, container){
  nv.addGraph(function() {
      var width = 400,
          height = 300;

      var chart = nv.models.pieChart()
          .x(function(d) { return d.label })
          .y(function(d) { return d.value })
          //.showLabels(false)
          .color(d3.scale.category10().range())
          .width(width)
          .height(height);

        d3.select(container)
            .datum(data)
            //.datum(testdata)
          .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);

      return chart;
  });
}