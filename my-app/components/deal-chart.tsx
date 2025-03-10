"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSharkTankData, mappers, DealStructureData } from "../lib/data";

const DealStructureOutcomeChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, isLoading, isError } = useSharkTankData(mappers.dealStructure);

  useEffect(() => {
    if (isLoading || isError || !data.length || !svgRef.current) return;

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

    // Create scales
    const x = d3
      .scaleBand()
      .domain(aggregated.map((d) => d.deal_structure))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(aggregated, (d) => {
          let total = 0;
          keys.forEach((key) => {
            total += d[key] || 0;
          });
          return total;
        }) || 0,
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create color scale for different statuses
    const color = d3
      .scaleOrdinal()
      .domain(keys as string[])
      .range(d3.schemeCategory10);

    // Create stacked data
    const stack = d3
      .stack()
      .keys(keys as string[])
      .value((d, key) => d[key] || 0);

    const stackedData = stack(aggregated);

    // Add bars
    svg
      .append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.deal_structure) || 0)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .append("title")
      .text((d) => {
        const status = d3.select(d3.select(this).node().parentNode).datum().key;
        return `${d.data.deal_structure}\n${status}: ${d.data[status]}`;
      });

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 10}, ${margin.top})`
      );

    keys.forEach((key, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(key));

      legendRow.append("text").attr("x", 20).attr("y", 12).text(key);
    });

    // Add title and labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Deal Structure Outcomes");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Deal Structure");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Number of Companies");
  }, [data, isLoading, isError]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default DealStructureOutcomeChart;
