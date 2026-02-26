// ============================================================================
// DEMO.JS - D3.js Fundamentals
// ============================================================================

// ============================================================================
// SECTION 1: D3 SELECTIONS & DOM MANIPULATION 
// ============================================================================
// D3 = "Data-Driven Documents" - it connects data to visual elements
// DOM = Document Object Model - the structure of the webpage (HTML elements)

// To add the D3 visualizations into our page, we first have to select an associated element

// Select an element and modify it
// d3.select() finds ONE element (like querySelector)
// d3.selectAll() finds ALL elements (like querySelectorAll)

d3.select('#demo-1')
    .style('color', 'lightblue')
    .style('font-size', '20px')
    .text('My name is Wuhao Cao');

// TODO: change the text above to add your name
// TODO: change the color to something else you like // keep in mind color contrast

// Create and append new elements
d3.select('#demo-1')
    .append('p')
    .text('My favorite food is hotpot')
    .style('background-color', 'lightblue');

// TODO: append a new element with your favorite food and style it with a different background color

// ============================================================================
// SECTION 2: DATA BINDING - The Core D3 Pattern 
// ============================================================================

// D3's core pattern is to bind data to DOM elements and then use that data to create visualizations

// To demonstrate that we will first load the data (we'll cover it in Section 4)

// Sample data - gas prices in 5 states chosen randomly. 
const energyData = await d3.csv('data/state_energy_prices.csv');
const sampledData = energyData.filter(d => ['California','Texas','New York','Illinois','Michigan'].includes(d.state));
const gasPrices = sampledData.map(item => parseFloat(item.gas));

// Now let's see how we bind this data to elements
d3.select('#demo-2')
    .append('svg')
    .attr('width', 400) // Set width of the SVG
    .attr('height', 100) // Set height of the SVG
    .selectAll('circle') // Select circles (we don't have them yet) - we select circles that don't exist yet to tell D3 what kind of elements to create
    .data(gasPrices) // Bind the gasPrices data to the circles
    .join('circle') // Create a circle for each data point (this is where the circles are created)
    .attr('cx', (d, i) => i*60+30) // Set x position based on index
    .attr('cy', 50) // Set y position (fixed for now)
    .attr('r', d => d * 5) // Set radius based on gas price (scaled up for visibility)
    .attr('fill', 'steelblue'); // Set fill color


// TODO: sample electricity prices instead of gas and create rectangles instead of circles; make the color of the rectangles green;
const electricityPrices = sampledData.map(item => parseFloat(item.elec));
d3.select('#demo-2')
    .append('svg')
    .attr('width', 400)
    .attr('height', 100)
    .selectAll('rect')
    .data(electricityPrices)
    .join('rect')
    .attr('x', (d, i) => i*60+30)
    .attr('y', d => 100 - d * 200)    .attr('width', 40)
    .attr('height', d => d * 200)
    .attr('fill', 'green');

// Remember that circle needs radius (r) and center (cx, cy) to create it,
// while rectangles need x, y, width, and height. You can use the electricity price to determine the height of the rectangle and set a fixed width.

// ============================================================================
// SECTION 3: SCALES - Mapping Data to Pixels 
// ============================================================================
// Scales convert data values → visual properties (position, size, color)

// Linear Scale: numbers -> numbers
const xScale = d3.scaleLinear()
    .domain([0, 100]) // Input data range. Here we are saying our data goes from 0 to 100 (you can adjust this based on your data)
    .range([0, 400]); // Output pixel range. This means we want to map our data to a range of 0 to 400 pixels (the width of our SVG)

console.log('Scale examples: ');
console.log('xScale(0):', xScale(0)); // Should be 0 [which means that a data value of 0 maps to 0 pixels]
console.log('xScale(50):', xScale(50)); // Should be 200 [which means that a data value of 50 maps to 200 pixels, which is halfway across the SVG]
console.log('xScale(100):', xScale(100)); // Should be 400 [which means that a data value of 100 maps to 400 pixels, which is the full width of the SVG]

// Common scale types: 
// - scaleLinear: for continuous numerical data (e.g., prices, temperatures)
// - scaleTime/scaleUtc: for dates (e.g., stock prices over time)
// - scaleOrdinal: for categorical data (e.g., colors for different categories)

// Example: color scale for categories
const colorScale = d3.scaleOrdinal()
    .domain(['A', 'B', 'C']) // Input categories
    .range(['red', 'green', 'blue']); // Output colors

console.log('colorScale("A") =', colorScale('A'));  // Should be 'red'

// ============================================================================
// SECTION 4: DATA LOADING & SIMPLE BAR CHART
// ============================================================================

// D3 provides functions to load data from various formats (CSV, JSON, etc.)
// Load CSV data (this is asynchronous, so we use await)
const data = await d3.csv('data/state_energy_prices.csv');
console.log('Loaded data:', data);

// Now let's create a bar chart with top 15 states by electricity price 
energyData.sort((a, b) => parseFloat(b.elec) - parseFloat(a.elec)); // Sort data by electricity price (descending)
let top15 = energyData.slice(0, 15); // Get top 15 states
top15 = top15.map(d => ({ state: d.state, elec: parseFloat(d.elec) })); // Convert electricity price to number and keep only state and electricity

// Now let's set the dimensions for our bar chart
const barMargin = { top: 30, right: 30, bottom: 80, left: 70 };
const barWidth = 700 - barMargin.left - barMargin.right;
const barHeight = 380 - barMargin.top - barMargin.bottom;

// Create SVG for bar chart
const barSvg = d3.select('#demo-4')
    .append('svg')
    .attr('viewBox', `0 0 ${barWidth + barMargin.left + barMargin.right} ${barHeight + barMargin.top + barMargin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${barMargin.left},${barMargin.top})`);

// We are using viewBox here, which allows the SVG to scale responsively while maintaining the aspect ratio. 
// This means that the chart will resize based on the size of the container, making it look good on different screen sizes.

// We also added attribute preserveAspectRatio to ensure that the aspect ratio is maintained when the SVG scales.
// We also translated our chart group to account for the margins, so that our axes and bars have space to be drawn without being cut off.

// Create scales for the bar chart

// X scale - categorical scale for states
const xBarScale = d3.scaleBand()
    .domain(top15.map(d => d.state)) // Input: state names
    .range([0, barWidth]) // Output: width of the chart
    .padding(0.25); // Padding between bars

// Y scale - linear scale for electricity prices
const yBar = d3.scaleLinear()
    .domain([0, d3.max(top15, d => d.elec)]) // Input: from 0 to max elec price in top 15
    .range([barHeight, 0]); // Output: height of the chart (inverted because SVG y=0 is at the top)

// Create axes and append them to the svg

// X axis
const xAxis = d3.axisBottom(xBarScale);

barSvg.append('g')
    .attr('transform', `translate(0, ${barHeight})`) // Move x axis to the bottom of the chart
    .call(xAxis)
    .selectAll('text') // Rotate x axis labels for better readability
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

// Y axis
const yAxis = d3.axisLeft(yBar)
    .ticks(5)
    .tickFormat(d => `$${d.toFixed(2)}`); // Set number of ticks on y axis

barSvg.append('g')
    .call(yAxis);

// Create and append bars to the chart
barSvg.selectAll('rect')
    .data(top15)
    .join('rect')
    .attr('x', d => xBarScale(d.state)) // Set x position based on state
    .attr('y', d => yBar(d.elec)) // Set y position based on electricity  price
    .attr('width', xBarScale.bandwidth()) // Set width of bars based on scale
    .attr('height', d => barHeight - yBar(d.elec)) // Set height of bars based on electricity price
    .attr('fill', 'steelblue') // Set bar color

// Chart title
barSvg.append('text')
    .attr('x', barWidth / 2) // Center the title horizontally
    .attr('y', -10) // Position the title above the chart
    .attr('text-anchor', 'middle') // Center the text
    .style('font-size', '16px') 
    .style('font-weight', 'bold')
    .text('Top 15 States by Electricity Price');

// Y axis label
barSvg.append('text')
    .attr('transform', 'rotate(-90)') // Rotate the text to be vertical
    .attr('x', -barHeight / 2) // Center the label vertically along the y axis
    .attr('y', -55) // Position the label to the left of the y axis
    .attr('text-anchor', 'middle') // Center the text
    .style('font-size', '12px')
    .text('Electricity Price (per kWh)');

// TODO: Create Bar Chart that shows the top 15 states by gas price;
// States should be on the y-axis and gas price on the x-axis, i.e. bars should be horizontal;
// make the bars orange; add a title and axis labels.

// prepare data
energyData.sort((a, b) => parseFloat(b.gas) - parseFloat(a.gas)); // Sort data by gas price (descending)
let top15Gas = energyData.slice(0, 15); // Get top 15 states
top15Gas = top15Gas.map(d => ({ state: d.state, gas: parseFloat(d.gas) })); // Convert gas price to number and keep only state and gas

// set the dimensions for the horizontal bar chart
const hBarMargin = { top: 30, right: 30, bottom: 80, left: 150 };
const hBarWidth = 400 - hBarMargin.left - hBarMargin.right;
const hBarHeight = 500 - hBarMargin.top - hBarMargin.bottom;

// Create SVG for horizontal bar chart
const hBarSvg = d3.select('#demo-4')
    .append('svg')
    .attr('viewBox', `0 0 ${hBarWidth + hBarMargin.left + hBarMargin.right} ${hBarHeight + hBarMargin.top + hBarMargin.bottom}`)
    .append('g')
    .attr('transform', `translate(${hBarMargin.left},${hBarMargin.top})`);

// Create scales for the horizontal bar chart
const yGas = d3.scaleBand()
    .domain(top15Gas.map(d => d.state))
    .range([0, hBarHeight])
    .padding(0.25);

const xGas = d3.scaleLinear()
    .domain([0, d3.max(top15Gas, d => d.gas)])
    .range([0, hBarWidth]);

// Create axes and append them to the svg
hBarSvg.append('g')
    .call(d3.axisLeft(yGas));

hBarSvg.append('g')
    .attr('transform', `translate(0, ${hBarHeight})`)
    .call(
        d3.axisBottom(xGas)
            .ticks(5)
            .tickFormat(d => `$${d.toFixed(2)}`)
    );

// Create and append bars to the chart
hBarSvg.selectAll('rect')
    .data(top15Gas)
    .join('rect')
    .attr('y', d => yGas(d.state))
    .attr('x', 0)
    .attr('height', yGas.bandwidth())
    .attr('width', d => xGas(d.gas))
    .attr('fill', 'orange');

// Chart title
hBarSvg.append('text')
    .attr('x', hBarWidth / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .text('Top 15 States by Gas Price');

// X axis label
hBarSvg.append('text')
    .attr('x', hBarWidth / 2)
    .attr('y', hBarHeight + 50)
    .attr('text-anchor', 'middle')
    .text('Gas Price');

// ============================================================================
// SECTION 5:  LINE CHART 
// ============================================================================
// This mirrors the pattern you'll use in the stocks assignment!

// data source: https://fred.stlouisfed.org/series/APU000072610
const lineRaw = await d3.csv('data/state_elec_series.csv');
const regions = ["Midwest - Urban", "South - Urban", "West - Urban", "Northeast - Urban"];

const lineData = regions.map(region => ({
    name: region,
    values: lineRaw.map(d => ({
        Date: d3.timeParse('%Y-%m-%d')(d.observation_date),
        Price: parseFloat(d[region])
    }))
}));

// Set dimensions for line chart
const lineMargin = { top: 30, right: 160, bottom: 80, left: 80 };
const lineWidth = 700 - lineMargin.left - lineMargin.right;
const lineHeight = 400 - lineMargin.top - lineMargin.bottom;

// Create SVG for line chart
const lineSvg = d3.select('#demo-5')
    .append('svg')
    .attr('viewBox', `0 0 ${lineWidth + lineMargin.left + lineMargin.right} ${lineHeight + lineMargin.top + lineMargin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .append('g')
    .attr('transform', `translate(${lineMargin.left},${lineMargin.top})`);

// Create scales for line chart
const xLineScale = d3.scaleTime()
    .domain(d3.extent(lineData[0].values, d => d.Date)) // Assuming all regions have the same date range, we can use the first region to set the x-axis domain
    .range([0, lineWidth]); // Map the date range to the width of the chart

const yLineScale = d3.scaleLinear()
    .domain([
        d3.min(lineData, price => d3.min(price.values, d => d.Price)), // Get minimum price across all regions and dates
        d3.max(lineData, price => d3.max(price.values, d => d.Price)) // Get maximum price across all regions and dates
    ])
    .range([lineHeight, 0]); // Map the price range to the height of the chart (inverted because SVG y=0 is at the top)

// Create axes and append them to the svg
const x = d3.axisBottom(xLineScale)
    .ticks(d3.timeYear.every(1)) // Set ticks to be every year
    .tickFormat(d3.timeFormat('%Y')); // Format ticks to show only the year (e.g., 2020)

const y = d3.axisLeft(yLineScale)
    .ticks(10) // Set number of ticks on y axis
    .tickFormat(d => `$${d.toFixed(2)}`); // Format ticks to show dollar amounts with 2 decimal places

lineSvg.append('g')
    .attr('transform', `translate(0, ${lineHeight})`)
    .call(x)
    .selectAll('text')
    .style('font-size', '12px');

lineSvg.append('g')
    .attr('transform', 'translate(0, 0)')
    .call(y)
    .selectAll('text')
    .style('font-size', '12px');

// Create color scale for lines
const color = d3.scaleOrdinal(d3.schemeCategory10) // Use a built-in color scheme with 10 distinct colors
    .domain(lineData.map(d => d.name)); // Set the domain to be the names of the regions so that each region gets a unique color

// Create and append lines to the chart
const line = d3.line()
    .x(d => xLineScale(d.Date)) // Map the Date to the x-axis using the xLineScale
    .y(d => yLineScale(d.Price)) // Map the Price to the y-axis using the yLineScale
    .curve(d3.curveMonotoneX);  // Use a smooth curve for the lines

lineData.forEach(region => {
    lineSvg.append('path')
        .datum(region.values) // Bind the values for this region to the path element
        .attr('fill', 'none') // We don't want to fill under the line, so set fill to 'none'
        .attr('stroke', color(region.name)) // Set the stroke color based on the region name using the color scale
        .attr('stroke-width', 2) // Set the stroke width to 2 pixels
        .attr('d', line); // Use the line generator to create the 'd' attribute for the path, which defines the shape of the line based on the data
});

// Add legend
const legend = lineSvg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${lineWidth + 10}, 0)`); // Position the legend to the right of the chart

lineData.forEach((region, i) => {
    const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`); // Position each legend entry vertically with some spacing

    legendRow.append('rect')
        .attr('width', 10) 
        .attr('height', 10)
        .attr('fill', color(region.name)); // Use the same color for the legend as the line color

    legendRow.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .text(region.name) // Set the text to be the name of the region
        .style('font-size', '12px') 
        .attr('alignment-baseline', 'center');
})

// Add title and axis label

// Do it yourself! Hint: look back at the bar chart code for how to add text elements for the title and axis labels.


