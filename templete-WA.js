// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    const width = 600, 
    height = 400;
    const margin = 
    {top: 30, 
    bottom: 50, 
    left: 50, 
    right: 30};

    // Create the SVG container
    const svg = d3.select("#scatterplot")
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .style('background', 'lightyellow');
      
    // Set up scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength), d3.max(data, d => d.PetalLength)])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth), d3.max(data, d => d.PetalWidth)])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add scales     
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    svg.append('g')
          .attr('transform', `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(xScale));

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 3)
        .attr("fill", d => colorScale(d.Species));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top - 35)
        .style("text-anchor", "middle")
        .text("Petal Length");

    // Add y-axis label
    svg.append("text")
    .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 35)
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle")
        .text("Petal Width");
        

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("Species", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("circle")
        .attr("cx", 80)
        .attr("cy", 10)
        .attr("r", 5)
        .attr("fill", colorScale);

    legend.append("text")
        .attr("x", 80)
        .attr("y", 10)
        .style("text-anchor", "start")
        .text(d => d)
        .style("font-size", "14px");
});

iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });
    
    // Define dimensions and margins for the SVG
    const 
    width = 600,
    height = 400;
    const margin = 
       { top: 30, 
        bottom: 50, 
        left: 50, 
        right: 30 
    };

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .style('background', 'lightyellow');

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Species)) 
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength), d3.max(data, d => d.PetalLength)])
        .range([height - margin.bottom, margin.top]);

    // Add scales
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - margin.bottom + 35)
        .style("text-anchor", "middle")
        .text("Species");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left - 35)
        .attr("x", 0 - (height / 2))
        .style("text-anchor", "middle")
        .text("Petal Length");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const q3 = d3.quantile(values, 0.75);
        const median = d3.quantile(values, 0.5);
        const iqr = q3 - q1;
        return { q1, q3, median, iqr };
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth(); 

        // Draw vertical lines for whiskers
        const minY = yScale(quartiles.q1 - 1.5 * quartiles.iqr);
        const maxY = yScale(quartiles.q3 + 1.5 * quartiles.iqr);

        svg.append('line')
            .attr('x1', x + boxWidth / 2)
            .attr('y1', minY)
            .attr('x2', x + boxWidth/2)
            .attr('y2', maxY)
            .attr('stroke', 'black')
            .attr('stroke-width', 2);

        // Draw the rectangular box from q1 to q3
        svg.append('rect')
            .attr('x', x)
            .attr('y', yScale(quartiles.q3))
            .attr('width', boxWidth)
            .attr('height', yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr('fill', 'lightblue');

        // Draw the horizontal line for the median
        svg.append('line')
            .attr('x1', x)
            .attr('y1', yScale(quartiles.median))
            .attr('x2', x + boxWidth)
            .attr('y2', yScale(quartiles.median))
            .attr('stroke', 'black')
            .attr('stroke-width', 2);
    });
});
