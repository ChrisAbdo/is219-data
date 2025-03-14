"use client";
import React, { useEffect } from "react";
import * as d3 from "d3";
import { useSharkTankData } from "../lib/data";
import VisualizationModal from "./visualization-modal";
import useVisualizationExpander from "../hooks/useVisualizationExpander";

interface DealTermsData {
  deal_structure: string;
  status: string;
  is_deal: boolean;
}

// Create a custom mapper for deal terms data
const dealTermsMapper = (d: d3.DSVRowString<string>): DealTermsData => {
  // The deal_structure field in CSV is in format like "['Equity']" or "['Equity', 'Royalty']"
  // We need to parse this to get the first deal type
  let dealType = "Unknown";
  try {
    if (d.deal_structure) {
      // Extract first deal type from the array-like string
      const match = d.deal_structure.match(/'([^']+)'/);
      if (match && match[1]) {
        dealType = match[1];
      }
    }
  } catch (e) {
    console.error("Error parsing deal_structure:", e);
  }

  return {
    deal_structure: dealType,
    status: d.status,
    is_deal: d.is_deal.toLowerCase() === "true",
  };
};

// Define a simplified type that just contains what we need
interface StackKeyData {
  key: string;
}

const DealTermsAnalysis = () => {
  const { data, isLoading, isError } = useSharkTankData(dealTermsMapper);
  const {
    containerRef,
    svgRef,
    modalSvgRef,
    isModalOpen,
    openModal,
    closeModal,
    modalTitle,
  } = useVisualizationExpander({
    title: "Business Outcomes by Deal Type",
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    if (isLoading || isError || !data.length || !svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 60, right: 200, bottom: 100, left: 60 };

    // Filter to only include successful deals
    const deals = data.filter((d) => d.is_deal);

    // Group data by deal structure
    const dealTypeGroups = d3.group(deals, (d) => d.deal_structure);

    const chartData = Array.from(dealTypeGroups, ([type, values]) => {
      const totalCount = values.length;
      const successCount = values.filter(
        (d) => d.status === "In Business" || d.status === "Acquired"
      ).length;

      const acquisitionCount = values.filter(
        (d) => d.status === "Acquired"
      ).length;

      return {
        dealType: type === "Unknown" ? "Other/Unspecified" : type,
        totalCount,
        successRate: (successCount / totalCount) * 100,
        acquisitionRate: (acquisitionCount / totalCount) * 100,
        failureRate: ((totalCount - successCount) / totalCount) * 100,
      };
    }).filter((d) => d.totalCount >= 3); // Only include deal types with sufficient data

    // Sort by success rate
    chartData.sort((a, b) => b.successRate - a.successRate);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Check if we have data to display
    if (chartData.length === 0) {
      // Display a message when no data is available
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("No deal type data available for analysis");

      return; // Exit early
    }

    // Set up scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.dealType))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Define colors for different statuses
    const colors = {
      success: "#4CAF50",
      acquisition: "#2196F3",
      failure: "#FF5252",
    };

    // Create stacked data
    const stack = d3
      .stack<{
        dealType: string;
        totalCount: number;
        successRate: number;
        acquisitionRate: number;
        failureRate: number;
      }>()
      .keys(["successRate", "acquisitionRate", "failureRate"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(chartData);

    // Add bars
    const groups = svg
      .selectAll("g.stack")
      .data(stackedData)
      .join("g")
      .attr("class", "stack")
      .attr("fill", (d) => {
        if (d.key === "successRate") return colors.success;
        if (d.key === "acquisitionRate") return colors.acquisition;
        return colors.failure;
      });

    groups
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => {
        const xPos = x(d.data.dealType);
        return xPos !== undefined ? xPos : margin.left;
      })
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .append("title")
      .text((d, i, nodes) => {
        // Safely access the parent node and its data
        const parentNode = nodes[i].parentNode as Element;
        const data = d3.select(parentNode).datum() as StackKeyData;
        const stackKey = data.key;
        const value = d[1] - d[0];
        let label = "";

        if (stackKey === "successRate") label = "Success Rate";
        else if (stackKey === "acquisitionRate") label = "Acquisition Rate";
        else label = "Failure Rate";

        return `${d.data.dealType}\n${label}: ${value.toFixed(1)}%`;
      });

    // Add count labels under each group
    svg
      .selectAll(".count-label")
      .data(chartData)
      .join("text")
      .attr("class", "count-label")
      .attr("x", (d) => {
        const xPos = x(d.dealType);
        return xPos !== undefined ? xPos + x.bandwidth() / 2 : margin.left;
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
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

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

    // Create legend items
    const legendItems = [
      { label: "In Business", color: colors.success },
      { label: "Acquired", color: colors.acquisition },
      { label: "Out of Business", color: colors.failure },
    ];

    legendItems.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color);

      legendRow.append("text").attr("x", 25).attr("y", 12).text(item.label);
    });

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("Business Outcomes by Deal Type");

    // Add axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Deal Type");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Percentage");

    // Add key findings
    const findings = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top + 110})`
      );

    // Find the best deal type
    const bestDealType = chartData[0]; // Already sorted by success rate

    findings
      .append("text")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Key Findings:");

    findings
      .append("text")
      .attr("y", 25)
      .attr("font-size", "12px")
      .text(`Best Deal Type: ${bestDealType.dealType}`);

    findings
      .append("text")
      .attr("y", 45)
      .attr("font-size", "12px")
      .text(`Success Rate: ${bestDealType.successRate.toFixed(1)}%`);

    findings
      .append("text")
      .attr("y", 65)
      .attr("font-size", "12px")
      .text(`Acquisition Rate: ${bestDealType.acquisitionRate.toFixed(1)}%`);

    // Add comparison to other deal types
    const averageSuccessRate = d3.mean(chartData, (d) => d.successRate) || 0;
    const successDifference = bestDealType.successRate - averageSuccessRate;

    findings
      .append("text")
      .attr("y", 85)
      .attr("font-size", "12px")
      .text(`Above Average: +${successDifference.toFixed(1)}%`);

    findings
      .append("text")
      .attr("y", 115)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Conclusion:");

    findings
      .append("text")
      .attr("y", 135)
      .attr("font-size", "12px")
      .text(`${bestDealType.dealType} deals show`);

    findings
      .append("text")
      .attr("y", 150)
      .attr("font-size", "12px")
      .text(`${bestDealType.successRate.toFixed(0)}% success rate,`);

    findings
      .append("text")
      .attr("y", 165)
      .attr("font-size", "12px")
      .text(`${bestDealType.acquisitionRate.toFixed(0)}% acquisition rate,`);

    findings
      .append("text")
      .attr("y", 180)
      .attr("font-size", "12px")
      .text("suggesting they provide");

    findings
      .append("text")
      .attr("y", 195)
      .attr("font-size", "12px")
      .text("better long-term alignment");

    findings
      .append("text")
      .attr("y", 210)
      .attr("font-size", "12px")
      .text("between sharks & entrepreneurs.");

    findings
      .append("text")
      .attr("y", 230)
      .attr("font-size", "12px")
      .attr("font-style", "italic")
      .text(`Data based on ${bestDealType.totalCount} deals`);
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

export default DealTermsAnalysis;
