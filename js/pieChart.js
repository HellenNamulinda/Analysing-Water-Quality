// Load the data using d3.csv
d3.csv("../data/water_quality_all.csv")
  .then(data => { 
    // Create an object to store the source counts
    const sourceCounts = {};

    // Count the occurrences of each source
    data.forEach(d => {

      let sourceType;
      if (d["Source type"].length === 0) {
        sourceType = "Others";
      } else {
        sourceType = d["Source type"];
      }

      if (sourceCounts[sourceType]) {
        sourceCounts[sourceType]++;
      } else {
        sourceCounts[sourceType] = 1;
      }
    });
    // Convert the source counts object into an array
    const sourceCountsArray = Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));

    // Set up the dimensions for the chart
    const width = 600;
    const height = 450;
    const radius = Math.min(width, height) / 2;
    const margin = { top: 20, right: 10, bottom: 20, left: 5 };

    // Create the color scale for the pie slices
    const colorScale = d3.scaleOrdinal()
      .domain(sourceCountsArray.map(d => d["Source type"]))
      .range(["#ff7f0e", "#1f77b4", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]);

    // Create the pie layout
    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    // Create the arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius);

    // Create the SVG element and group
    const svg = d3.select("#pie-chart")
      .append("svg")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Generate the pie slices
    const slices = svg.selectAll("path")
      .data(pie(sourceCountsArray))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.source))
      .on("mouseover", function(event, d) {
        // Increase the opacity of the hovered slice
        d3.select(this)
          .style("opacity", 0.8);

        // Show the source count as a tooltip
        tooltip.style("opacity", 1)
          .html(`<strong>${d.data.source}</strong><br>${d.data.count}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", function() {
        // Restore the opacity of the slice
        d3.select(this)
          .style("opacity", 1);

        // Hide the tooltip
        tooltip.style("opacity", 0);
      });

    // Add labels to the pie slices
    const labels = svg.selectAll("text")
      .data(pie(sourceCountsArray))
      .enter()
      .append("text")
      .attr("transform", d => {
        const [x, y] = arc.centroid(d);
        const angle = (d.startAngle + d.endAngle) / 2; // Calculate the angle of the label
        const rotate = angle * 180 / Math.PI - 90; // Convert the angle to degrees and adjust for text orientation
        return `translate(${x}, ${y}) rotate(${rotate})`;
      })
      .attr("dy", "0.35em")
      .text(d => d.data.source)
      .style("font-size", "12px")
      .style("text-anchor", "middle")
      .style("pointer-events", "none");

    // Create a color map key
    const colorMap = svg.append("g")
      .attr("class", "color-map")
      .attr("transform", `translate(${radius + 10}, ${-radius})`);

    const colorMapKey = colorMap.selectAll(".color-map-key")
      .data(sourceCountsArray)
      .enter()
      .append("g")
      .attr("class", "color-map-key")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    colorMapKey.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => colorScale(d.source));

    colorMapKey.append("text")
      .attr("x", 20)
      .attr("y", 8)
      .text(d => d.source)
      .style("font-size", "12px");

    // Create a tooltip element
    const tooltip = d3.select("#chart-container")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Apply CSS styles to the tooltip
    tooltip.style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  })
  .catch(error => {
    console.error("Error loading or processing data:", error);
  });
