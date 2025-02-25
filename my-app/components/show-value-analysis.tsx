"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ShowValueAnalysis = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    d3.csv("/data/sharktank.csv", (d) => ({
      status: d.status,
      is_deal: d.is_deal.toLowerCase() === "true",
    })).then((csvData) => {
      setData(csvData);
    });
  }, []);

  useEffect(() => {
    if (!data.length) return;

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };

    // Calculate success rates for deals vs no deals
    const dealData = data.filter((d) => d.is_deal);
    const noDealData = data.filter((d) => !d.is_deal);

    const calculateOutcomes = (dataset) => ({
      total: dataset.length,
      inBusiness: dataset.filter((d) => d.status === "In Business").length,
      acquired: dataset.filter((d) => d.status === "Acquired").length,
      outBusiness: dataset.filter((d) => d.status === "Out of Business").length,
    });

    const dealOutcomes = calculateOutcomes(dealData);
    const noDealOutcomes = calculateOutcomes(noDealData);

    const chartData = [
      {
        group: "Got Deal",
        "Still Operating":
          ((dealOutcomes.inBusiness + dealOutcomes.acquired) /
            dealOutcomes.total) *
          100,
        "Out of Business":
          (dealOutcomes.outBusiness / dealOutcomes.total) * 100,
      },
      {
        group: "No Deal",
        "Still Operating":
          ((noDealOutcomes.inBusiness + noDealOutcomes.acquired) /
            noDealOutcomes.total) *
          100,
        "Out of Business":
          (noDealOutcomes.outBusiness / noDealOutcomes.total) * 100,
      },
    ];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.group))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Define colors
    const colors = {
      "Still Operating": "#4CAF50",
      "Out of Business": "#FF5252",
    };

    // Create stacked data
    const stack = d3.stack().keys(["Still Operating", "Out of Business"]);

    const stackedData = stack(chartData);

    // Add bars
    const groups = svg
      .selectAll("g.stack")
      .data(stackedData)
      .join("g")
      .attr("class", "stack")
      .attr("fill", (d) => colors[d.key]);

    groups
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.group))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .append("title")
      .text((d) => `${d.data.group}\n${d[1] - d[0]}%`);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((d) => d + "%"));

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 10}, ${margin.top})`
      );

    Object.entries(colors).forEach(([key, color], i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color);

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
      .text("Success Rates: Deal vs No Deal");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom / 3)
      .attr("text-anchor", "middle")
      .text("Deal Outcome");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", margin.left / 3)
      .attr("text-anchor", "middle")
      .text("Percentage");
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default ShowValueAnalysis;
