"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ValuationScatter = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    d3.csv("/data/sharktank.csv", (d) => ({
      name: d.name,
      ask_valuation: +d.ask_valuation,
      deal_valuation: +d.deal_valuation,
      category: d.category,
      is_deal: d.is_deal.toLowerCase() === "true",
    })).then((csvData) => {
      // Filter out entries without valuations and ensure values are > 0 for log scale
      const filteredData = csvData.filter(
        (d) => d.is_deal && d.ask_valuation > 0 && d.deal_valuation > 0
      );
      setData(filteredData);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create scales with proper domains
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.ask_valuation)])
      .nice()
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.deal_valuation)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add diagonal reference line (y=x)
    const maxVal = Math.max(
      d3.max(data, (d) => d.ask_valuation),
      d3.max(data, (d) => d.deal_valuation)
    );

    svg
      .append("line")
      .attr("x1", x(0))
      .attr("y1", y(0))
      .attr("x2", x(maxVal))
      .attr("y2", y(maxVal))
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "4,4");

    // Add points with tooltips
    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.ask_valuation))
      .attr("cy", (d) => y(d.deal_valuation))
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("opacity", 0.6)
      .append("title")
      .text(
        (d) =>
          `${d.name}\nAsked: $${d3.format(",.0f")(
            d.ask_valuation
          )}\nGot: $${d3.format(",.0f")(d.deal_valuation)}`
      );

    // Add axes with better formatting
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(8)
          .tickFormat((d) => `$${d3.format(",.0f")(d)}`)
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(8)
          .tickFormat((d) => `$${d3.format(",.0f")(d)}`)
      );

    // Add labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 20)
      .attr("text-anchor", "middle")
      .text("Asked Valuation ($)");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Deal Valuation ($)");
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default ValuationScatter;
