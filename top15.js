// Create the SVG container for the chart
const top15svg = d3
    .select('#top15')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
        'transform',
        'translate(' + margin.left + ',' + 0 + ')',
    );

// Load and process the data
d3.csv(
    'https://gist.githubusercontent.com/ncavestany/a27d1c6706c2612a2d9a4c4b0b3c0456/raw/476a601593f5d7ca30aa8e32763ec35cad69d419/world_happiness_scores_2022.csv',
).then((data) => {
    data.forEach((d) => {
        d.happinessScore = +d['Happiness score'];
        d.rank = +d['RANK'];
        d.country = d['Country'];
    });

    const top15Data = data.slice(0, 15);

    var x = d3.scaleLinear()
        .domain([0, 8000])
        .range([0, width]);
    top15svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")

    // Y axis
    var y = d3.scaleBand()
        .range([0, height])
        .domain(top15Data.map(function (d) { return d.Country; }))
        .padding(.40);

    top15svg.selectAll("bar")
        .data(top15Data)
        .enter()
        .append("rect")
        .attr("x", x(0))
        .attr("y", function (d) { return y(d.Country); })
        .attr("width", function (d) { return x(d.happinessScore); })
        .attr("height", y.bandwidth())
        .attr("fill", "#56a0ce")
        .append('title')
        .attr('class', 'tooltip')
        .text((d) => 'Happiness score: ' + d['Happiness score']);

    top15svg.append("g")
        .call(d3.axisLeft(y))
        .call(d3.axisLeft(y).tickSizeOuter(0));

});
