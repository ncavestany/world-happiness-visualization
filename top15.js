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

// Load and process the data
d3.csv(
    'data/2022.csv',
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
    var dropdown = d3
        .select('#top15')
        .append('select')
        .attr('class', 'year-dropdown')
        .style('margin-bottom', '20px')
        .on('change', function () {
            const selectedYear = d3.select(this).property('value');
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

    var dropdownPosition = { top: 2300, right: 150 };
    dropdown.style('position', 'absolute')
        .style('top', dropdownPosition.top + 'px')
        .style('right', dropdownPosition.right + 'px');

    function updateChart(selectedYear) {
        d3.csv('data/' + selectedYear + '.csv').then(data => {
            data.forEach((d) => {
                d.happinessScore = +d['Happiness Score'];
                d.rank = +d['Happiness Rank'];
                d.country = d['Country'];
            });

            top15Data = data.slice(0, 15);
            console.log(top15Data);

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
                .domain(top15Data.map(function (d) { return d.country; }))
                .padding(.40);

            top15svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y))
                .call(d3.axisLeft(y).tickSizeOuter(0));

            // Fill in new bars
            top15svg.selectAll("rect")
                .data(top15Data)
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
                .select('title')
                .text((d) => 'Happiness score: ' + d['Happiness Score']);
        });
    }



});
