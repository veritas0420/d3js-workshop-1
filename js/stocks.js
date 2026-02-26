// ============================================================================
// STOCK PRICE VISUALIZATION ASSIGNMENT (WITH BONUS: IBM + MSFT)
// ============================================================================

// ============================================================================
// DATA LOADING
// ============================================================================
// Load CSV files for stocks in parallel
let stocks = await Promise.all([
  d3.csv("data/AAPL.csv").then(data => ({ name: "AAPL", values: data })),
  d3.csv("data/GOOG.csv").then(data => ({ name: "GOOG", values: data })),
  d3.csv("data/AMZN.csv").then(data => ({ name: "AMZN", values: data })),
  d3.csv("data/IBM.csv").then(data => ({ name: "IBM", values: data })),   // BONUS
  d3.csv("data/MSFT.csv").then(data => ({ name: "MSFT", values: data })), // BONUS
]);

console.log("Loaded stocks:", stocks);

// ============================================================================
// DATA PROCESSING
// ============================================================================
// Convert strings to Date/Number and sort by date
stocks.forEach(stock => {
  stock.values.forEach(d => {
    d.Date = new Date(d.Date);
    d.Close = +d.Close;

    d.Open = +d.Open;
    d.High = +d.High;
    d.Low = +d.Low;
    d.Volume = +d.Volume;
  });

  stock.values.sort((a, b) => a.Date - b.Date);
});

console.log("Processed first stock:", stocks[0].values[0]);

// ============================================================================
// CHART DIMENSIONS
// ============================================================================
const margin = { top: 50, right: 160, bottom: 50, left: 100 };
const width = 1000 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// ============================================================================
// SVG SETUP
// ============================================================================
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// ============================================================================
// CREATE SCALES
// ============================================================================
const allValues = stocks.flatMap(s => s.values);

// X Scale - Dates
const x = d3.scaleUtc()
  .domain(d3.extent(allValues, d => d.Date))
  .range([0, width]);

// Y Scale - Close prices
const y = d3.scaleLinear()
  .domain([
    d3.min(allValues, d => d.Close),
    d3.max(allValues, d => d.Close),
  ])
  .range([height, 0]);

// Color Scale - Stock names
const color = d3.scaleOrdinal(d3.schemeCategory10)
  .domain(stocks.map(s => s.name));

// ============================================================================
// ADD AXES
// ============================================================================

// X Axis - years
const xAxis = d3.axisBottom(x)
  .ticks(d3.utcYear.every(1))
  .tickFormat(d3.utcFormat("%Y"));

svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis)
  .selectAll("text")
  .style("font-size", "12px");

// Y Axis - dollars
const yAxis = d3.axisLeft(y)
  .ticks(10)
  .tickFormat(d => `$${d}`);

svg.append("g")
  .attr("class", "y-axis")
  .call(yAxis)
  .selectAll("text")
  .style("font-size", "12px");

// ============================================================================
// DRAW LINES
// ============================================================================
const line = d3.line()
  .x(d => x(d.Date))
  .y(d => y(d.Close))
  .curve(d3.curveMonotoneX);

stocks.forEach(stock => {
  svg.append("path")
    .datum(stock.values)
    .attr("fill", "none")
    .attr("stroke", color(stock.name))
    .attr("stroke-width", 2)
    .attr("d", line);
});

// ============================================================================
// ADD LABELS
// ============================================================================

// Chart Title
svg.append("text")
  .attr("class", "chart-title")
  .attr("x", width / 2)
  .attr("y", -20)
  .attr("text-anchor", "middle")
  .style("font-size", "18px")
  .style("font-weight", "bold")
  .text("Stock Closing Prices Over Time");

// X Axis Label
svg.append("text")
  .attr("class", "x-axis-label")
  .attr("x", width / 2)
  .attr("y", height + 40)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Year");

// Y Axis Label
svg.append("text")
  .attr("class", "y-axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -60)
  .attr("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Close Price (USD)");

// ============================================================================
// ADD LEGEND
// ============================================================================
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width + 20}, 0)`);

stocks.forEach((stock, i) => {
  const legendRow = legend.append("g")
    .attr("transform", `translate(0, ${i * 20})`);

  legendRow.append("line")
    .attr("x1", 0)
    .attr("y1", 10)
    .attr("x2", 25)
    .attr("y2", 10)
    .attr("stroke", color(stock.name))
    .attr("stroke-width", 2);

  legendRow.append("text")
    .attr("x", 35)
    .attr("y", 14)
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .text(stock.name);
});
