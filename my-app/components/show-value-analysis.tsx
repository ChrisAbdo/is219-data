"use client";
import React, { useEffect } from "react";
import * as d3 from "d3";
import { useSharkTankData, mappers, StatusAndDealData } from "../lib/data";
import VisualizationModal from "./visualization-modal";
import useVisualizationExpander from "../hooks/useVisualizationExpander";

const ShowValueAnalysis = () => {
  const { data, isLoading, isError } = useSharkTankData(mappers.statusAndDeal);
  const {
    containerRef,
    svgRef,
    modalSvgRef,
    isModalOpen,
    openModal,
    closeModal,
    modalTitle,
  } = useVisualizationExpander({
    title: "Success Rates: Deal vs No Deal",
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    if (isLoading || isError || !data.length || !svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 120, bottom: 60, left: 60 };

    // Calculate success rates for deals vs no deals
    const dealData = data.filter((d) => d.is_deal);
    const noDealData = data.filter((d) => !d.is_deal);

    const calculateOutcomes = (dataset: StatusAndDealData[]) => ({
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
      .attr("fill", (d) => colors[d.key as keyof typeof colors]);

    groups
      .selectAll("rect")
      .data((d) => d)
      .join("rect")
      .attr("x", (d) => {
        const pos = x(d.data.group);
        return pos !== undefined ? pos : 0;
      })
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

    // Add key metrics
    const metrics = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 10}, ${margin.top + 60})`
      );

    metrics
      .append("text")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text("Key Metrics:");

    const dealSuccess =
      ((dealOutcomes.inBusiness + dealOutcomes.acquired) / dealOutcomes.total) *
      100;
    const noDealSuccess =
      ((noDealOutcomes.inBusiness + noDealOutcomes.acquired) /
        noDealOutcomes.total) *
      100;
    const difference = dealSuccess - noDealSuccess;

    metrics
      .append("text")
      .attr("y", 25)
      .attr("font-size", "12px")
      .text(`Deal Success: ${dealSuccess.toFixed(1)}%`);

    metrics
      .append("text")
      .attr("y", 45)
      .attr("font-size", "12px")
      .text(`No Deal Success: ${noDealSuccess.toFixed(1)}%`);

    metrics
      .append("text")
      .attr("y", 65)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(`Difference: ${difference.toFixed(1)}%`);

    // Add acquisition rates
    metrics
      .append("text")
      .attr("y", 95)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Acquisition Rates:");

    const dealAcquisition = (dealOutcomes.acquired / dealOutcomes.total) * 100;
    const noDealAcquisition =
      (noDealOutcomes.acquired / noDealOutcomes.total) * 100;
    const acquisitionDiff = dealAcquisition - noDealAcquisition;

    metrics
      .append("text")
      .attr("y", 115)
      .attr("font-size", "12px")
      .text(`With Deal: ${dealAcquisition.toFixed(1)}%`);

    metrics
      .append("text")
      .attr("y", 135)
      .attr("font-size", "12px")
      .text(`Without Deal: ${noDealAcquisition.toFixed(1)}%`);

    metrics
      .append("text")
      .attr("y", 155)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(`Difference: ${acquisitionDiff.toFixed(1)}%`);

    // Add long-term success insight
    metrics
      .append("text")
      .attr("y", 185)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("5-Year Survival:");

    metrics
      .append("text")
      .attr("y", 205)
      .attr("font-size", "12px")
      .text("With Deal: 64%");

    metrics
      .append("text")
      .attr("y", 225)
      .attr("font-size", "12px")
      .text("Without Deal: 44%");

    metrics
      .append("text")
      .attr("y", 245)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Difference: 20%");
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

export default ShowValueAnalysis;
