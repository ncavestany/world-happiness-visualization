// Create the SVG container for the chart
const top15svg = d3
    .select('#top15')
    .append('svg')
    .attr('width', 1400)
    .attr('height', height + margin.top + margin.bottom - 100)
    .append('g')
    .attr(
        'transform',
        'translate(' + 200 + ',' + 0 + ')',
    );
var selectedYear = 2024;
var selectedOrder = "Descending";
// Load and process the data
d3.csv(
    'data/2024.csv',
).then((data) => {
    data.forEach((d) => {
        d.happinessScore = +d['Happiness Score'];
        d.rank = +d['Happiness Rank'];
        d.country = d['Country'];
    });

    var top15Data = data.slice(0, 15);

    var x = d3.scaleLinear()
        .domain([0, 8000])
        .range([0, 1000]);
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
        .on('mouseover', function (event, d) {
            d3.select(this)
                .style('fill', function () {
                    return d3.color(d3.select(this).style('fill')).brighter(0.5); // Make the color lighter
                });
        })
        .on('mouseout', function (event, d) {
            d3.select(this)
                .style('fill', '#56a0ce'); // Bring back to original color
        })
        .append('title')
        .attr('class', 'tooltip')
        .text((d) => 'Happiness score: ' + d['Happiness Score']);

    top15svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y))
        .call(d3.axisLeft(y).tickSizeOuter(0));

    top15svg.append("text")
        .attr("class", "x-axis-title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2 - 120)
        .attr("y", height + 50)
        .text("Happiness Score");

    // Append dropdown menu
    var yearDropdown = d3
        .select('#top15')
        .append('select')
        .attr('class', 'year-dropdown')
        .style('margin-bottom', '20px')
        .on('change', function () {
            selectedYear = d3.select(this).property('value');
            updateChart(selectedYear, selectedOrder);
        });

    yearDropdown
        .selectAll('option')
        .data(years)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d)
        .property('selected', function (d) {
            return d === 2024; // Default year is 2024
        });;

    var yearDropdownPosition = { top: 2650, right: 150 };
    yearDropdown.style('position', 'absolute')
        .style('top', yearDropdownPosition.top + 'px')
        .style('right', yearDropdownPosition.right + 'px');

    var orderDropdown = d3
        .select('#top15')
        .append('select')
        .attr('class', 'order-dropdown')
        .style('margin-bottom', '20px')
        .on('change', function () {
            selectedOrder = d3.select(this).property('value');
            updateChart(selectedYear, selectedOrder);
        });

    orderDropdown
        .selectAll('option')
        .data(['Descending', 'Ascending'])
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d)
        .property('selected', function (d) {
            return d === 'Descending'; // Default order is descending
        })

    var orderDropdownPosition = { top: 2700, right: 150 };
    orderDropdown.style('position', 'absolute')
        .style('top', orderDropdownPosition.top + 'px')
        .style('right', orderDropdownPosition.right + 'px');

    function updateChart(selectedYear, selectedOrder) {
        d3.csv('data/' + selectedYear + '.csv').then(data => {
            data.forEach((d) => {
                d.happinessScore = +d['Happiness Score'];
                d.rank = +d['Happiness Rank'];
                d.country = d['Country'];
            });

            top15Data = data.slice(0, 15);
            bottom15Data = data.slice(-15).reverse();
            var selectedData = (selectedOrder === 'Ascending') ? bottom15Data : top15Data;

            var x = d3.scaleLinear()
                .domain([0, 8000])
                .range([0, 1000]);
            top15svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")

            // Clear out old y-axis
            top15svg.selectAll(".y-axis").remove();

            // Reinitialize new y-axis
            var y = d3.scaleBand()
                .range([0, height])
                .domain(selectedData.map(function (d) { return d.country; }))
                .padding(.40);

            top15svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y))
                .call(d3.axisLeft(y).tickSizeOuter(0));

            // Fill in new bars
            top15svg.selectAll("rect")
                .data(selectedData)
                .enter()
                .append("rect")
                .merge(top15svg.selectAll("rect"))
                .transition()
                .duration(1000)
                .attr("x", x(0))
                .attr("y", function (d) { return y(d.country); })
                .attr("width", function (d) { return x(d.happinessScore); })
                .attr("height", y.bandwidth())
                .attr("fill", "#56a0ce")
                .on('mouseover', function (event, d) {
                    d3.select(this)
                        .style('fill', function () {
                            return d3.color(d3.select(this).style('fill')).brighter(0.5); // Make the color lighter
                        });
                })
                .on('mouseout', function (event, d) {
                    d3.select(this)
                        .style('fill', '#56a0ce'); // Bring back to original color
                })
                .select('title')
                .text((d) => 'Happiness score: ' + d['Happiness Score']);
        });
    }



});
