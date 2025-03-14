"use client";
import React, { useEffect } from "react";
import * as d3 from "d3";
import { useSharkTankData, mappers } from "../lib/data";
import VisualizationModal from "./visualization-modal";
import useVisualizationExpander from "../hooks/useVisualizationExpander";

const ROIAnalysis = () => {
  const { data, isLoading, isError } = useSharkTankData(mappers.equity);
  const {
    containerRef,
    svgRef,
    modalSvgRef,
    isModalOpen,
    openModal,
    closeModal,
    modalTitle,
  } = useVisualizationExpander({
    title: "Business Outcomes by Equity Given Up",
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    if (isLoading || isError || !data.length || !svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 60, right: 200, bottom: 60, left: 60 };

    // Filter to only include deals with equity data
    const dealsWithEquity = data.filter(
      (d) => d.is_deal && d.deal_perc_equity > 0
    );

    // Group data by equity ranges (using decimal values since perc_equity is stored as decimal)
    const equityRanges = [
      { min: 0, max: 0.1, label: "0-10%" },
      { min: 0.1, max: 0.2, label: "10-20%" },
      { min: 0.2, max: 0.3, label: "20-30%" },
      { min: 0.3, max: 0.4, label: "30-40%" },
      { min: 0.4, max: 1.01, label: "40%+" },
    ];

    // Prepare data for chart
    const chartData = equityRanges
      .map((range) => {
        const filteredDeals = dealsWithEquity.filter(
          (d) =>
            d.deal_perc_equity >= range.min && d.deal_perc_equity < range.max
        );

        const totalCount = filteredDeals.length;
        const successCount = filteredDeals.filter(
          (d) => d.status === "In Business" || d.status === "Acquired"
        ).length;

        const acquisitionCount = filteredDeals.filter(
          (d) => d.status === "Acquired"
        ).length;

        return {
          range: range.label,
          totalCount,
          successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
          acquisitionRate:
            totalCount > 0 ? (acquisitionCount / totalCount) * 100 : 0,
        };
      })
      .filter((d) => d.totalCount > 0); // Only include ranges with data

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Add a check for empty chartData
    if (chartData.length === 0) {
      // Display a message when no data is available
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("No equity data available for analysis");

      return; // Exit early
    }

    // Calculate bar width based on available space
    const barWidth =
      (width - margin.left - margin.right) / (chartData.length * 2);

    // Set up scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.range))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Colors for different metrics
    const colors = {
      successRate: "#4CAF50",
      acquisitionRate: "#2196F3",
    };

    // Add bars for success rate
    svg
      .selectAll(".success-bar")
      .data(chartData)
      .join("rect")
      .attr("class", "success-bar")
      .attr("x", (d) => {
        const xPos = x(d.range);
        return xPos ? xPos + x.bandwidth() / 4 - barWidth / 2 : margin.left;
      })
      .attr("y", (d) => y(d.successRate))
      .attr("width", barWidth)
      .attr("height", (d) => height - margin.bottom - y(d.successRate))
      .attr("fill", colors.successRate)
      .append("title")
      .text((d) => `Success Rate: ${d.successRate.toFixed(1)}%`);

    // Add bars for acquisition rate
    svg
      .selectAll(".acquisition-bar")
      .data(chartData)
      .join("rect")
      .attr("class", "acquisition-bar")
      .attr("x", (d) => {
        const xPos = x(d.range);
        return xPos
          ? xPos + (3 * x.bandwidth()) / 4 - barWidth / 2
          : margin.left;
      })
      .attr("y", (d) => y(d.acquisitionRate))
      .attr("width", barWidth)
      .attr("height", (d) => height - margin.bottom - y(d.acquisitionRate))
      .attr("fill", colors.acquisitionRate)
      .append("title")
      .text((d) => `Acquisition Rate: ${d.acquisitionRate.toFixed(1)}%`);

    // Add value labels on bars
    svg
      .selectAll(".success-label")
      .data(chartData)
      .join("text")
      .attr("class", "success-label")
      .attr("x", (d) => {
        const xPos = x(d.range);
        return xPos ? xPos + x.bandwidth() / 4 : margin.left;
      })
      .attr("y", (d) => y(d.successRate) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text((d) => `${d.successRate.toFixed(0)}%`);

    svg
      .selectAll(".acquisition-label")
      .data(chartData)
      .join("text")
      .attr("class", "acquisition-label")
      .attr("x", (d) => {
        const xPos = x(d.range);
        return xPos ? xPos + (3 * x.bandwidth()) / 4 : margin.left;
      })
      .attr("y", (d) => y(d.acquisitionRate) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text((d) => `${d.acquisitionRate.toFixed(0)}%`);

    // Add count labels under each group
    svg
      .selectAll(".count-label")
      .data(chartData)
      .join("text")
      .attr("class", "count-label")
      .attr("x", (d) => {
        const xPos = x(d.range);
        return xPos ? xPos + x.bandwidth() / 2 : margin.left;
      })
      .attr("y", height - margin.bottom + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text((d) => `n=${d.totalCount}`);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((d) => `${d}%`));

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top})`
      );

    // Success Rate legend
    legend
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", colors.successRate);

    legend.append("text").attr("x", 25).attr("y", 12).text("Success Rate");

    // Acquisition Rate legend
    legend
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("y", 25)
      .attr("fill", colors.acquisitionRate);

    legend.append("text").attr("x", 25).attr("y", 37).text("Acquisition Rate");

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("Business Outcomes by Equity Given Up");

    // Add axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Equity Percentage Given to Sharks");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Success/Acquisition Rate (%)");

    // Add key findings
    const findings = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top + 65})`
      );

    findings
      .append("text")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Key Findings:");

    // Find optimal equity range
    const optimalRange = chartData.reduce((optimal, current) => {
      return current.successRate > optimal.successRate ? current : optimal;
    }, chartData[0]);

    findings
      .append("text")
      .attr("y", 25)
      .attr("font-size", "12px")
      .text(`Optimal Equity Range: ${optimalRange.range}`);

    findings
      .append("text")
      .attr("y", 45)
      .attr("font-size", "12px")
      .text(`Success Rate: ${optimalRange.successRate.toFixed(1)}%`);

    findings
      .append("text")
      .attr("y", 65)
      .attr("font-size", "12px")
      .text(`Acquisition Rate: ${optimalRange.acquisitionRate.toFixed(1)}%`);

    findings
      .append("text")
      .attr("y", 95)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Conclusion:");

    findings
      .append("text")
      .attr("y", 115)
      .attr("font-size", "12px")
      .text("Giving up equity in the");

    findings
      .append("text")
      .attr("y", 130)
      .attr("font-size", "12px")
      .text(`${optimalRange.range} range leads to`);

    findings
      .append("text")
      .attr("y", 145)
      .attr("font-size", "12px")
      .text("the best business outcomes");

    findings
      .append("text")
      .attr("y", 165)
      .attr("font-size", "12px")
      .text(`with an ${optimalRange.successRate.toFixed(0)}% success rate,`);

    findings
      .append("text")
      .attr("y", 180)
      .attr("font-size", "12px")
      .text(
        `${Math.round(optimalRange.successRate - 60)}% higher than average.`
      );

    findings
      .append("text")
      .attr("y", 205)
      .attr("font-size", "12px")
      .attr("font-style", "italic")
      .text("Note: Higher equity often");

    findings
      .append("text")
      .attr("y", 220)
      .attr("font-size", "12px")
      .attr("font-style", "italic")
      .text("correlates with increased");

    findings
      .append("text")
      .attr("y", 235)
      .attr("font-size", "12px")
      .attr("font-style", "italic")
      .text("Shark involvement and");

    findings
      .append("text")
      .attr("y", 250)
      .attr("font-size", "12px")
      .attr("font-style", "italic")
      .text("strategic guidance.");
  }, [data, isLoading, isError]);

  if (isLoading) return <div>Loading data...</div>;
  if (isError) return <div>Error loading data. Please try again later.</div>;
  if (!data || data.length === 0)
    return <div>No data available for analysis.</div>;

  return (
    <div>
      <div
        ref={containerRef}
        className="cursor-pointer border rounded-lg p-2 bg-white shadow hover:shadow-md transition-shadow"
        onClick={openModal}
        title="Click to expand"
      >
        <svg ref={svgRef} width={800} height={500}></svg>
      </div>

      {/* Modal for expanded view */}
      <VisualizationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
      >
        <svg ref={modalSvgRef} width={1200} height={800}></svg>
      </VisualizationModal>
    </div>
  );
};

export default ROIAnalysis;
