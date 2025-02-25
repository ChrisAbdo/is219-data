"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const IndustryChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  // Load CSV data using D3
  useEffect(() => {
    d3.csv("/data/sharktank.csv", (d) => ({
      // Convert and extract only necessary fields
      category: d.category,
      is_deal: d.is_deal.trim().toLowerCase() === "true",
    })).then((csvData) => {
      setData(csvData);
    });
  }, []);

  // Render the chart once data is loaded
  useEffect(() => {
    if (!data.length) return;

    // Filter to only include rows with a successful deal
    const dealsData = data.filter((d) => d.is_deal);

    // Group data by industry category and count deals per category
    const grouped = d3.rollups(
      dealsData,
      (v) => v.length,
      (d) => d.category
    );
    const chartData = grouped.map(([category, count]) => ({ category, count }));

    // Define SVG dimensions and margins
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };

    // Clear previous svg content if any
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create x scale for categories (industries)
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    // Create y scale for deal counts
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Append bars for each industry
    svg
      .append("g")
      .selectAll("rect")
      .data(chartData)
      .join("rect")
      .attr("x", (d) => x(d.category))
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => y(0) - y(d.count))
      .attr("width", x.bandwidth())
      .attr("fill", "steelblue");

    // Add x-axis with rotated labels for readability
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end");

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Industry Category");

    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Number of Deals");
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default IndustryChart;
