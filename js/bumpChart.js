const bumpSvg = d3
    .select('#bumpChart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
        'transform',
        'translate(' + margin.left + ',' + 60 + ')',
    );

// Load and process the data
d3.csv(
    'data/averageHappinessScores.csv',
).then((data) => {
    const sumstat = d3.group(data, d => d.Region);

    const x = d3
        .scaleLinear()
        .range([50, width - 400])
        .domain(
            d3.extent(data, function (d) {
                return d.Year;
            }),
        );

    var y = d3.scaleLinear()
        .domain([10, 1])
        .range([height - 20, 0]);

    var xAxis = d3
        .axisBottom(x)
        .tickSize(0)
        .tickFormat((d) => d.toString().replace(/\,/g, ''));


    bumpSvg
        .append('g')
        .attr('class', 'x axis')
        .style('font-size', '10px')
        .attr('transform', 'translate(100,' + height + ')')
        .call(xAxis);

    bumpSvg
        .append("g")
        .attr("class", "y axis")
        .style("font-size", "10px")
        .attr("transform", "translate(120, 0)") // Translate the y-axis
        .call(d3.axisLeft(y).tickSizeOuter(0));

    var colorScale = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.Region))
        .range(['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']); // from colorbrewer

    var y2 = d3.scaleBand()
        .domain((data.map(d => d.Region)).reverse())
        .range([height, 0])
        .padding(-.6);

    bumpSvg
        .append("g")
        .attr("class", "y2 axis")
        .style("font-size", "14px")
        .call(d3.axisRight(y2).tickSizeOuter(0).tickSize(0))
        .select(".domain")
        .remove() // Removing the axis line to make it invisible

    var legendStart = width - 270;
    bumpSvg.select(".y2.axis")
        .attr("transform", "translate(" + legendStart + ",-10)")
        .selectAll("text")
        .style("fill", "black")
        .style("stroke", d => colorScale(d)) // Outline with matching color
        .style("stroke-width", 0.3)

    bumpSvg.selectAll('.line')
        .data(sumstat)
        .join('path')
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", function (d) { return colorScale(d[0]) })
        .attr("stroke-width", 3)
        .attr('d', function (d) {
            return d3
                .line()
                .x(function (d) {
                    return x(d.Year) + 100;
                })
                .y(function (d) {
                    return y(d.Rank);
                })(d[1]);
        });

    bumpSvg
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.Year) + 100)
        .attr('cy', (d) => y(d.Rank))
        .attr('r', 5)
        .style('fill', function (d) {
            return colorScale(d.Region);
        })
        .on('mouseenter', function () {
            d3.select(this).attr('r', 10);
        })
        .on('mouseleave', function () {
            d3.select(this).attr('r', 5);
        })
        .append('title')
        .text(
            (d) =>
                'Average happiness score: ' + d['Average Happiness Score'] + '\nRegion: ' + d['Region'] + '\nYear: ' +
                d['Year'],
        );

    bumpSvg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 150)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Rank");

    function highlight(selectedRegion) {
        bumpSvg.selectAll('.line')
            .attr("stroke", function (d) {
                return d[0] === selectedRegion ? colorScale(d[0]) : "lightgrey";
            });
        bumpSvg.selectAll('.dot')
            .style('fill', function (d) {
                return d.Region === selectedRegion ? colorScale(d.Region) : 'lightgrey';
            });
    }

    bumpSvg.selectAll(".y2.axis text")
        .on("mouseover", function (event, d) {
            var selectedRegion = d;
            highlight(selectedRegion);
        })
        .on("mouseout", function () {
            bumpSvg.selectAll('.line')
                .attr("stroke", function (d) {
                    return colorScale(d[0]);
                });
            bumpSvg.selectAll('.dot')
                .style('fill', function (d) {
                    return colorScale(d.Region);
                });
        });


});
