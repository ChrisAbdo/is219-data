"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useSharkTankData, mappers, IndustryAndStatusData } from "../lib/data";

const OutcomeByIndustry = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, isLoading, isError } = useSharkTankData(
    mappers.industryAndStatus
  );

  useEffect(() => {
    if (isLoading || isError || !data.length || !svgRef.current) return;

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

    // Create stacked data
    const stack = d3.stack().keys(statuses);
    const stackedData = stack(
      chartData.map((d) => {
        const total = d.total;
        return {
          category: d.category,
          inBusiness: d.inBusiness / total,
          acquired: d.acquired / total,
          outBusiness: d.outBusiness / total,
        };
      })
    );

    // Add bars
    const groups = svg
      .selectAll("g.status")
      .data(stackedData)
      .join("g")
      .attr("class", "status")
      .attr("fill", (d, i) => colors[i]);

    groups
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => x(d.data.category) || 0)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .append("title")
      .text((d, i, nodes) => {
        const status = d3.select(nodes[i].parentNode).datum().key;
        const percentage = ((d[1] - d[0]) * 100).toFixed(1);
        return `${d.data.category}\n${status}: ${percentage}%`;
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
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 10}, ${margin.top})`
      );

    const statusLabels = {
      inBusiness: "In Business",
      acquired: "Acquired",
      outBusiness: "Out of Business",
    };

    statuses.forEach((status, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colors[i]);

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(statusLabels[status as keyof typeof statusLabels]);
    });

    // Add title and labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Business Outcomes by Industry");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Industry");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Percentage");
  }, [data, isLoading, isError]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default OutcomeByIndustry;
