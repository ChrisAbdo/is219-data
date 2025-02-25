"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const OutcomeByIndustry = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    d3.csv("/data/sharktank.csv", (d) => ({
      category: d.category,
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
    const margin = { top: 40, right: 120, bottom: 100, left: 60 };

    // Group data by category and status
    const grouped = d3.rollups(
      data,
      (v) => ({
        total: v.length,
        inBusiness: v.filter((d) => d.status === "In Business").length,
        acquired: v.filter((d) => d.status === "Acquired").length,
        outBusiness: v.filter((d) => d.status === "Out of Business").length,
      }),
      (d) => d.category
    );

    const chartData = grouped.map(([category, counts]) => ({
      category,
      ...counts,
    }));

    // Sort categories by total success (in business + acquired)
    chartData.sort(
      (a, b) =>
        (b.inBusiness + b.acquired) / b.total -
        (a.inBusiness + a.acquired) / a.total
    );

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, 1]) // For percentages
      .range([height - margin.bottom, margin.top]);

    // Define status types and colors
    const statuses = ["inBusiness", "acquired", "outBusiness"];
    const colors = d3.schemeTableau10;

    // Create stacked bars
    statuses.forEach((status, i) => {
      svg
        .selectAll(`.bar-${status}`)
        .data(chartData)
        .join("rect")
        .attr("class", `bar-${status}`)
        .attr("x", (d) => x(d.category))
        .attr("y", (d) => y(d[status] / d.total))
        .attr("height", (d) => y(0) - y(d[status] / d.total))
        .attr("width", x.bandwidth())
        .attr("fill", colors[i])
        .append("title")
        .text(
          (d) =>
            `${d.category}\n${status}: ${((d[status] / d.total) * 100).toFixed(
              1
            )}%`
        );
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

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 10}, ${margin.top})`
      );

    const legendLabels = ["In Business", "Acquired", "Out of Business"];
    legendLabels.forEach((label, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors[i]);

      legendRow.append("text").attr("x", 20).attr("y", 12).text(label);
    });

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
      .text("Percentage of Companies");
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default OutcomeByIndustry;
