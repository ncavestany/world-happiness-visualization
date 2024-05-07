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
var legendWidth = window.innerWidth * 0.7;
var dropdownHeight = window.innerHeight * 2.3;
const path = d3.geoPath();
const projection = d3
    .geoRobinson()
    .scale(150)
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
            1875, 3750, 5625, 7500
        ])
        .range(
            d3.range(5).map(function (i) {
                return d3.interpolateBlues(i / 4);
            }),
        );
    svg
        .append('g')
        .attr('class', 'legendSequential')
        .attr('transform', 'translate(' + legendWidth + ',70)');

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
        .attr('stroke', function (d) {
            var countryName = d.properties.name;
            var happinessScore = happiness.get(countryName);
            return happinessScore !== undefined ? 'black' : 'gray'; // If the country has no happiness score make its outline gray for visibility
        })
        .style('fill', function (d) {
            var countryName = d.properties.name;
            var happinessScore = happiness.get(countryName);
            return colorScale(happinessScore);
        })
        .attr('d', d3.geoPath().projection(projection))
        .on('mouseover', function (event, d) {
            var countryName = d.properties.name;
            var happinessScore = happiness.get(countryName);
            d3.select(this)
                .style('fill', function () {
                    if (happinessScore !== undefined) {
                        return d3.color(d3.select(this).style('fill')).brighter(0.5); // Make the color lighter
                    } else {
                        return '#5b5c5b'; // Make a lighter gray if the happiness score is undefined
                    }
                });
        })
        .on('mouseout', function (event, d) {
            var countryName = d.properties.name;
            var happinessScore = happiness.get(countryName);
            d3.select(this)
                .style('fill', colorScale(happinessScore)); // Return to original color
        })
        .append('title')
        .attr('class', 'tooltip')
        .text(function (d) {
            var countryName = d.properties.name;
            var happinessScore = happiness.get(countryName);
            var rank = happinessRank.get(countryName);
            return happinessScore !== undefined
                ? 'Happiness score: ' + happinessScore + "\nCountry: " + countryName + '\nRANK: ' + rank + ' of ' + lowestRank
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

    var dropdownPosition = { top: 1550, right: 260 };
    dropdown.style('position', 'absolute')
        .style('top', dropdownHeight + 'px')
        .style('left', legendWidth + 100 + 'px');

    // Function to update chart based on selected year
    function updateChart(selectedYear) {
        resetZoom();
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

            ranks = newCsvData.map(d => parseInt(d['Happiness Rank'], 10));

            lowestRank = d3.max(ranks);

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
                .attr('stroke', function (d) {
                    var countryName = d.properties.name;
                    var happinessScore = happiness.get(countryName);
                    return happinessScore !== undefined ? 'black' : 'gray';
                })
                .style('fill', function (d) {
                    var countryName = d.properties.name;
                    var happinessScore = happiness.get(countryName);
                    return colorScale(happinessScore);
                })
                .attr('d', d3.geoPath().projection(projection))
                .on('mouseover', function (event, d) {
                    var countryName = d.properties.name;
                    var happinessScore = happiness.get(countryName);
                    d3.select(this)
                        .style('fill', function () {
                            if (happinessScore !== undefined) {
                                return d3.color(d3.select(this).style('fill')).brighter(0.5); // Make the color lighter
                            } else {
                                return '#5b5c5b'; // Make a lighter gray if the happiness score is undefined
                            }
                        });
                })
                .on('mouseout', function (event, d) {
                    var countryName = d.properties.name;
                    var happinessScore = happiness.get(countryName);
                    d3.select(this)
                        .style('fill', colorScale(happinessScore)); // Return to original color
                })
                .append('title')
                .attr('class', 'tooltip')
                .text(function (d) {
                    var countryName = d.properties.name;
                    var happinessScore = happiness.get(countryName);
                    var rank = happinessRank.get(countryName);
                    return happinessScore !== undefined
                        ? 'Happiness score: ' + happinessScore + "\nCountry: " + countryName + '\nRANK: ' + rank + ' of ' + lowestRank
                        : 'No data recorded for ' + countryName + ' in ' + selectedYear;
                });
        });
    }

    var zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', function (event) {
            svg.selectAll('path')
                .attr('transform', event.transform);
        });

    function resetZoom() {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }


    svg.call(zoom);

    svg.on("dblclick.zoom", resetZoom);


});
