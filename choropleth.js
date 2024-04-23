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
const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
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
        'data/2024.csv',
    ),
    d3.json(
        'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json',
    ),
]).then(([csvData, mapData]) => {
    var year;
    csvData.forEach((d) => {
        var countryName = d['Country'];
        var happinessScore = +d['Happiness Score'];
        var rank = d['Happiness Rank'];
        year = d['Year'];
        d.happinessScore = happinessScore;
        happiness.set(countryName, happinessScore);
        happinessRank.set(countryName, rank);
    });

    var ranks = csvData.map(d => parseInt(d['Happiness Rank'], 10));

    var lowestRank = d3.max(ranks);

    var colorScale = d3
        .scaleSequential(d3.interpolateBlues)
        .domain(
            [2000, 8000]
        );

    const thresholdScale = d3
        .scaleThreshold(d3.interpolateBlues)
        .domain([
            2000, 4000, 6000, 8000
        ])
        .range(
            d3.range(5).map(function (i) {
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
                ? 'Happiness score for ' + countryName + ' in ' + year + ': ' + + happinessScore + '\nRANK: ' + rank + ' of ' + lowestRank
                : 'No data recorded for ' + countryName + ' in ' + year;
        });

    // Dropdown menu for selecting the year
    var dropdown = d3
        .select('body')
        .append('select')
        .attr('class', 'year-dropdown')
        .on('change', function () {
            var selectedYear = d3.select(this).property('value');
            updateChart(selectedYear);
        });

    dropdown
        .selectAll('option')
        .data(years)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d)
        .property('selected', function (d) {
            return d === 2024; // Default year is 2024
        });;

    var dropdownPosition = { top: 1475, right: 260 };
    dropdown.style('position', 'absolute')
        .style('top', dropdownPosition.top + 'px')
        .style('right', dropdownPosition.right + 'px');

    // Function to update chart based on selected year
    function updateChart(selectedYear) {
        d3.csv('data/' + selectedYear + '.csv').then(newCsvData => {
            svg.selectAll('.countries').remove(); // Remove existing countries

            // Process new data
            happiness.clear();
            happinessRank.clear();
            newCsvData.forEach(d => {
                var countryName = d['Country'];
                var happinessScore = +d['Happiness Score'];
                var rank = d['Happiness Rank'];
                d.happinessScore = happinessScore;
                happiness.set(countryName, happinessScore);
                happinessRank.set(countryName, rank);
            });

            // Redraw countries
            svg
                .append('g')
                .attr('class', 'countries')
                .selectAll('path')
                .data(
                    topojson.feature(mapData, mapData.objects.countries).features
                )
                .enter()
                .append('path')
                .attr('stroke', 'black')
                .style('fill', function (d) {
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
                    var rank = happinessRank.get(countryName);
                    return happinessScore !== undefined
                        ? 'Happiness score for ' +
                        countryName +
                        ' in ' +
                        selectedYear +
                        ': ' +
                        happinessScore +
                        '\nRANK: ' +
                        rank +
                        ' of ' + lowestRank
                        : 'No data recorded for ' + countryName + ' in ' + selectedYear;
                });
        });
    }


});
