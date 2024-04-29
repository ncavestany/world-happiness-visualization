// Create the SVG container for the chart
const parallelSvg = d3
    .select('#parallelCoordinates')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom - 50)
    .append('g')
    .attr(
        'transform',
        'translate(' + 0 + ',' + 100 + ')',
    );

var legendPosition = 1600;

// Load and process the data
d3.csv(
    'data/2024filtered.csv',
).then((data) => {
    // Filtering out all unneeded data
    dimensions = Object.keys(data[0]).filter(function (d) { return d != "Happiness Score" && d != "Country" && d != "Happiness Rank" && d != "Region" && d != "Year" && d != "Whisker-high" && d != "Whisker-low" && d != "Dystopia + residual" });

    const y = {}
    for (i in dimensions) {
        let name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return +d[name]; }))
            .range([height, 0])
    }

    x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

    function path(d) {
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }

    var colorScale = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.Country))
        .range(['#86bfdd', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6']); // from colorbrewer


    var legendOrdinal = d3
        .legendColor()
        .title("Region")
        .shapeWidth(20)
        .cells(10)
        .orient('vertical')
        .scale(colorScale);
    parallelSvg
        .append('g')
        .attr('class', 'legendOrdinal')
        .attr('transform', 'translate(' + legendPosition + ',70)')
        .call(legendOrdinal)
        .selectAll("text")
        .on("mouseover", function () {
            var country = d3.select(this).datum();
            if (country != "Region") { // Ignore the header
                highlight(country);
            }
        })
        .on("mouseout", unhighlight)
        .on("click", function (d) {
            var country = d3.select(this).datum();
            click(country);
        })


    parallelSvg
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("d", path)
        .style("fill", "none")
        .attr("stroke", function (d) { return colorScale(d) })
        .style("opacity", 1)
        .attr("stroke-width", 2.5)

    parallelSvg.selectAll("axes")
        .data(dimensions).enter()
        .append("g")
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; })
        .style("fill", "black")

    // Make all other lines light grey other than the highlighted one
    function highlight(country) {
        parallelSvg.selectAll("path")
            .style("stroke", function (d) {
                d3.select(".legendOrdinal")
                    .selectAll(".cell")
                    .filter(function (cell) {
                        return cell != country;
                    })
                    .select("rect")
                    .style("opacity", 0.3);
                return d.Country === country ? colorScale(d) : "lightgrey";
            });
    }

    // Restore colors after mouseoff
    function unhighlight() {
        parallelSvg.selectAll("path")
            .style("stroke", function (d) {
                d3.select(".legendOrdinal")
                    .selectAll(".cell")
                    .select("rect")
                    .style("opacity", 1);
                return colorScale(d.Country);
            });
    }

    // Click a country name to remove/restore it.
    function click(country) {
        parallelSvg.selectAll("path")
            .each(function (d) {
                if (d.Country === country) {
                    var visibility = d3.select(this).style("visibility");
                    if (visibility === "visible") {
                        d3.select(this).style("visibility", "hidden");
                        // Make the country's color on the legend slightly transparent
                        d3.select(".legendOrdinal")
                            .selectAll(".cell")
                            .filter(function (cell) {
                                return cell === country;
                            })
                            .select("rect")
                            .style("opacity", 0.3);
                    } else {
                        d3.select(this).style("visibility", "visible");
                        d3.select(".legendOrdinal")
                            .selectAll(".cell")
                            .filter(function (cell) {
                                return cell === country;
                            })
                            .select("rect")
                            .style("opacity", 1); // Restore full opacity
                    }
                }
            });
    }


});
