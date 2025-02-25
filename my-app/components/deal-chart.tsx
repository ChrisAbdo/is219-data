"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const DealStructureOutcomeChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  // Load CSV data from /data/sharktank.csv
  useEffect(() => {
    d3.csv("/data/sharktank.csv", (d) => ({
      deal_structure: d.deal_structure, // e.g., "['Equity']"
      status: d.status, // e.g., "In Business", "Out of Business", "Acquired", etc.
    })).then((csvData) => {
      setData(csvData);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    // Aggregate data: for each deal structure, count companies by status.
    // We'll treat the deal_structure as a simple string.
    const grouped = d3.rollups(
      data,
      (v) =>
        d3.rollup(
          v,
          (arr) => arr.length,
          (d) => d.status
        ),
      (d) => d.deal_structure
    );

    // Create an array of objects where each object is:
    // { deal_structure: "['Equity']", "In Business": count, "Out of Business": count, ... }
    const aggregated = grouped.map(([structure, statusMap]) => {
      const obj = { deal_structure: structure };
      for (const [status, count] of statusMap.entries()) {
        // Only include non-empty statuses
        if (status) {
          obj[status] = count;
        }
      }
      return obj;
    });

    // Determine all unique status keys for stacking (excluding the deal_structure key)
    const allStatuses = new Set();
    aggregated.forEach((d) => {
      Object.keys(d).forEach((key) => {
        if (key !== "deal_structure") {
          allStatuses.add(key);
        }
      });
    });
    const keys = Array.from(allStatuses);

    // Define dimensions and margins
    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };

    // Clear any previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create an ordinal x-scale for deal structures
    const x = d3
      .scaleBand()
      .domain(aggregated.map((d) => d.deal_structure))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    // Generate the stack data
    const stackGenerator = d3
      .stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    const series = stackGenerator(aggregated);

    // Compute the maximum total count per deal structure for the y-scale
    const maxY = d3.max(aggregated, (d) => {
      return keys.reduce((sum, key) => sum + (d[key] || 0), 0);
    });

    // Linear y-scale for counts
    const y = d3
      .scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Color scale for statuses
    const color = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10);

    // Append groups and rectangles for each stacked segment
    const groups = svg
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", (d) => color(d.key));

    groups
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.deal_structure))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

    // Add x-axis with rotated labels for better readability
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end");

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y));

    // X-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Deal Structure");

    // Y-axis label
    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Count of Companies");

    // Add a legend to map colors to statuses
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 100}, ${margin.top})`
      );
    keys.forEach((key, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 20})`);
      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(key));
      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(key);
    });
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default DealStructureOutcomeChart;
