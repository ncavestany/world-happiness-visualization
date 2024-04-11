// Set up the dimensions/margins of the chart
const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
};
const width =
    window.innerWidth - margin.left - margin.right;
const height =
    window.innerHeight - margin.top - margin.bottom;

// Create the SVG container for the chart
const svg = d3
    .select('#choropleth')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
        'transform',
        'translate(' + margin.left + ',' + margin.top + ')',
    );

var happiness = new Map();
var happinessRank = new Map();
const path = d3.geoPath();
const projection = d3
    .geoMercator()
    .scale(120)
    .center([0, 20])
    .translate([width / 2, height / 2]);

Promise.all([
    d3.csv(
        'https://gist.githubusercontent.com/ncavestany/a27d1c6706c2612a2d9a4c4b0b3c0456/raw/9633c5b7d807c4868f1c7675a082a2a2f4cff128/world_happiness_scores_2022.csv',
    ),
    d3.json(
        'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    ),
]).then(([csvData, mapData]) => {
    csvData.forEach((d) => {
        var countryName = d['Country'];
        var happinessScore = +d['Happiness-score'].replace(
            /,/g,
            '',
        ); // Take out commas from the score so that it can be processed as a number
        var rank = d['RANK'];
        d.happinessScore = happinessScore;
        happiness.set(countryName, happinessScore);
        happinessRank.set(countryName, rank);
    });

    var colorScale = d3
        .scaleSequential(d3.interpolateBlues)
        .domain(
            d3.extent(csvData, function (d) {
                return d.happinessScore;
            }),
        );

    const thresholdScale = d3
        .scaleThreshold(d3.interpolateBlues)
        .domain([
            2000, 4000, 6000, 8000
        ])
        .range(
            d3.range(4).map(function (i) {
                return d3.interpolateBlues(i / 4);
            }),
        );

    svg
        .append('g')
        .attr('class', 'legendSequential')
        .attr('transform', 'translate(1050,20)');

    const legendSequential = d3
        .legendColor()
        .title('Happiness score')
        .labelFormat(d3.format('.0f'))
        .labels(d3.legendHelpers.thresholdLabels)
        .scale(thresholdScale);

    svg.select('.legendSequential').call(legendSequential);

    svg
        .append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(
            topojson.feature(mapData, mapData.objects.countries)
                .features,
        )
        .enter()
        .append('path')
        .attr('stroke', 'black')
        .style('fill', function (d) {
            // Get the happiness score for the current country
            var countryName = d.properties.name;
            var happinessScore = happiness.get(countryName);
            return colorScale(happinessScore);
        })
        .attr('d', d3.geoPath().projection(projection))
        .append('title')
        .attr('class', 'tooltip')
        .text(function (d) {
            var countryName = d.properties.name;
            var happinessScore = happiness.get(countryName);
            var rank = happinessRank.get(countryName); // Assuming happinessRank is a Map containing country ranks
            return happinessScore !== undefined
                ? 'Happiness score for ' + countryName + ' in 2022: ' + happinessScore + '\nRANK: ' + rank + ' of 146'
                : 'No data recorded for ' + countryName;
        });
});
