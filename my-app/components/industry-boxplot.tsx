"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const IndustryBoxPlot = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    d3.csv("/data/sharktank.csv", (d) => ({
      category: d.category,
      valuation_diff: (+d.deal_valuation - +d.ask_valuation) / +d.ask_valuation,
      is_deal: d.is_deal.toLowerCase() === "true",
    })).then((csvData) => {
      const filteredData = csvData.filter(
        (d) => d.is_deal && !isNaN(d.valuation_diff)
      );
      setData(filteredData);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 100, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Group data by category
    const groupedData = d3.group(data, (d) => d.category);

    // Calculate quartiles for each category
    const boxPlotData = Array.from(groupedData, ([key, values]) => {
      const sorted = values.map((d) => d.valuation_diff).sort(d3.ascending);
      return {
        category: key,
        q1: d3.quantile(sorted, 0.25),
        median: d3.quantile(sorted, 0.5),
        q3: d3.quantile(sorted, 0.75),
        min: d3.min(sorted),
        max: d3.max(sorted),
      };
    });

    // Create scales
    const x = d3
      .scaleBand()
      .domain(boxPlotData.map((d) => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(boxPlotData, (d) => d.min),
        d3.max(boxPlotData, (d) => d.max),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Draw boxes
    const boxWidth = x.bandwidth();

    boxPlotData.forEach((d) => {
      // Draw box
      svg
        .append("rect")
        .attr("x", x(d.category))
        .attr("y", y(d.q3))
        .attr("height", y(d.q1) - y(d.q3))
        .attr("width", boxWidth)
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);

      // Draw median line
      svg
        .append("line")
        .attr("x1", x(d.category))
        .attr("x2", x(d.category) + boxWidth)
        .attr("y1", y(d.median))
        .attr("y2", y(d.median))
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      // Draw whiskers
      svg
        .append("line")
        .attr("x1", x(d.category) + boxWidth / 2)
        .attr("x2", x(d.category) + boxWidth / 2)
        .attr("y1", y(d.min))
        .attr("y2", y(d.q1))
        .attr("stroke", "black");

      svg
        .append("line")
        .attr("x1", x(d.category) + boxWidth / 2)
        .attr("x2", x(d.category) + boxWidth / 2)
        .attr("y1", y(d.q3))
        .attr("y2", y(d.max))
        .attr("stroke", "black");
    });

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    // Add labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Industry Category");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Valuation Change %");
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default IndustryBoxPlot;
