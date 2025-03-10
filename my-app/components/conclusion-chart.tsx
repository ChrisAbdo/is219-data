"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface DataItem {
  status: string;
  is_deal: boolean;
}

interface ChartDataItem {
  group: string;
  status: string;
  value: number;
}

const ConclusionChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    d3.csv<DataItem>("/data/sharktank.csv", (d) => ({
      status: d.status,
      is_deal: d.is_deal.toLowerCase() === "true",
    })).then((csvData) => {
      setData(csvData);
    });
  }, []);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 60, right: 200, bottom: 60, left: 80 };

    // Calculate success rates for deals vs no deals
    const dealData = data.filter((d) => d.is_deal);
    const noDealData = data.filter((d) => !d.is_deal);

    const calculateOutcomes = (dataset: DataItem[]) => ({
      total: dataset.length,
      inBusiness: dataset.filter((d) => d.status === "In Business").length,
      acquired: dataset.filter((d) => d.status === "Acquired").length,
      outBusiness: dataset.filter((d) => d.status === "Out of Business").length,
    });

    const dealOutcomes = calculateOutcomes(dealData);
    const noDealOutcomes = calculateOutcomes(noDealData);

    // Calculate success rates
    const dealSuccessRate =
      ((dealOutcomes.inBusiness + dealOutcomes.acquired) / dealOutcomes.total) *
      100;
    const noDealSuccessRate =
      ((noDealOutcomes.inBusiness + noDealOutcomes.acquired) /
        noDealOutcomes.total) *
      100;

    // Calculate failure rates
    const dealFailureRate =
      (dealOutcomes.outBusiness / dealOutcomes.total) * 100;
    const noDealFailureRate =
      (noDealOutcomes.outBusiness / noDealOutcomes.total) * 100;

    // Prepare data for the chart
    const chartData: ChartDataItem[] = [
      { group: "Got Deal", status: "Success", value: dealSuccessRate },
      { group: "Got Deal", status: "Failure", value: dealFailureRate },
      { group: "No Deal", status: "Success", value: noDealSuccessRate },
      { group: "No Deal", status: "Failure", value: noDealFailureRate },
    ];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up scales
    const x = d3
      .scaleBand()
      .domain(["Got Deal", "No Deal"])
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Define colors
    const colors = {
      Success: "#4CAF50",
      Failure: "#FF5252",
    };

    // Add bars
    svg
      .selectAll(".success-bar")
      .data(chartData.filter((d) => d.status === "Success"))
      .join("rect")
      .attr("class", "success-bar")
      .attr("x", (d) => x(d.group) || 0)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value))
      .attr("width", x.bandwidth())
      .attr("fill", colors.Success)
      .append("title")
      .text((d) => `${d.group}: ${d.value.toFixed(1)}% Success Rate`);

    svg
      .selectAll(".failure-bar")
      .data(chartData.filter((d) => d.status === "Failure"))
      .join("rect")
      .attr("class", "failure-bar")
      .attr("x", (d) => x(d.group) || 0)
      .attr("y", (d) => y(0) - (height - margin.bottom - y(d.value)))
      .attr("height", (d) => height - margin.bottom - y(d.value))
      .attr("width", x.bandwidth())
      .attr("fill", colors.Failure)
      .append("title")
      .text((d) => `${d.group}: ${d.value.toFixed(1)}% Failure Rate`);

    // Add value labels on bars
    svg
      .selectAll(".success-label")
      .data(chartData.filter((d) => d.status === "Success"))
      .join("text")
      .attr("class", "success-label")
      .attr("x", (d) => (x(d.group) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "black")
      .text((d) => `${d.value.toFixed(1)}%`);

    svg
      .selectAll(".failure-label")
      .data(chartData.filter((d) => d.status === "Failure"))
      .join("text")
      .attr("class", "failure-label")
      .attr("x", (d) => (x(d.group) || 0) + x.bandwidth() / 2)
      // @ts-expect-error - Parameter 'd' is defined but never used
      .attr("y", (d) => y(0) + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "white")
      .text((d) => `${d.value.toFixed(1)}%`);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("font-size", "14px")
      .attr("font-weight", "bold");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      // @ts-expect-error - Unexpected any type
      .call(
        d3
          .axisLeft(y)
          .tickFormat(d3.format(".0f") as any)
          .tickFormat((d) => `${d}%`)
      );

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top + 20})`
      );

    Object.entries(colors).forEach(([key, color], i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 30})`);

      legendRow
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", color);

      legendRow
        .append("text")
        .attr("x", 30)
        .attr("y", 15)
        .attr("font-size", "14px")
        .text(key);
    });

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text("Business Outcomes: Deal vs. No Deal");

    // Add conclusion text
    const conclusionText = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top + 100})`
      );

    const difference = dealSuccessRate - noDealSuccessRate;

    conclusionText
      .append("text")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Conclusion:");

    conclusionText
      .append("text")
      .attr("y", 25)
      .attr("font-size", "14px")
      .text(`Businesses with Shark Tank deals`);

    conclusionText
      .append("text")
      .attr("y", 45)
      .attr("font-size", "14px")
      .text(`have a ${difference.toFixed(1)}% higher`);

    conclusionText
      .append("text")
      .attr("y", 65)
      .attr("font-size", "14px")
      .text(`success rate than those without.`);

    conclusionText
      .append("text")
      .attr("y", 95)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`Answer: YES, getting a deal`);

    conclusionText
      .append("text")
      .attr("y", 115)
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`on Shark Tank is worth it.`);
  }, [data]);

  return <svg ref={svgRef} width={800} height={500}></svg>;
};

export default ConclusionChart;
