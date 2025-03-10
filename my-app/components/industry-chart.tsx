"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSharkTankData, mappers, IndustryData } from "../lib/data";

const IndustryChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, isLoading, isError } = useSharkTankData(mappers.industry);

  // Render the chart once data is loaded
  useEffect(() => {
    if (isLoading || isError || !data.length || !svgRef.current) return;

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
      .domain([0, d3.max(chartData, (d) => d.count) || 0])
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

    // Add x-axis with rotated labels
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Add title and labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Deals by Industry");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom / 4)
      .attr("text-anchor", "middle")
      .text("Industry");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", margin.left / 3)
      .attr("text-anchor", "middle")
      .text("Number of Deals");
  }, [data, isLoading, isError]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default IndustryChart;
