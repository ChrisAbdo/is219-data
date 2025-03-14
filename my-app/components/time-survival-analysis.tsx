"use client";
import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import VisualizationModal from "./visualization-modal";
import useVisualizationExpander from "../hooks/useVisualizationExpander";

interface DataItem {
  air_date: string;
  status: string;
  is_deal: boolean;
}

const TimeSurvivalAnalysis: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const {
    containerRef,
    svgRef,
    modalSvgRef,
    isModalOpen,
    openModal,
    closeModal,
    modalTitle,
  } = useVisualizationExpander({
    title: "Business Survival Rate Over Time",
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    setIsLoading(true);
    d3.csv<DataItem>("/data/sharktank.csv", (d) => ({
      air_date: d.air_date,
      status: d.status,
      is_deal: d.is_deal.toLowerCase() === "true",
    }))
      .then((csvData) => {
        setData(csvData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setIsError(true);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoading || isError || !data.length || !svgRef.current) return;

    const width = 800;
    const height = 500;
    const margin = { top: 60, right: 200, bottom: 60, left: 80 };

    // Filter data for valid dates
    const filteredData = data.filter(
      (d) => d.air_date && new Date(d.air_date).toString() !== "Invalid Date"
    );

    if (filteredData.length === 0) {
      // Handle case when no valid data is available
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("No valid time data available for analysis");

      return;
    }

    // Calculate survival duration in months
    const currentDate = new Date();
    const survivalData = filteredData.map((d) => {
      const appearanceDate = new Date(d.air_date);
      const monthsDiff =
        (currentDate.getFullYear() - appearanceDate.getFullYear()) * 12 +
        currentDate.getMonth() -
        appearanceDate.getMonth();

      return {
        is_deal: d.is_deal,
        status: d.status,
        survivalMonths: monthsDiff,
        stillOperating: d.status === "In Business" || d.status === "Acquired",
      };
    });

    // Group by deal status and survival status
    const dealData = survivalData.filter((d) => d.is_deal);
    const noDealData = survivalData.filter((d) => !d.is_deal);

    // Safety check for empty datasets
    if (dealData.length === 0 || noDealData.length === 0) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Insufficient data to compare deal vs no deal survival rates");

      return;
    }

    // Calculate survival rates over time (6-month intervals)
    const maxMonths = Math.max(...survivalData.map((d) => d.survivalMonths));
    const timeIntervals = Array.from(
      { length: Math.ceil(maxMonths / 6) },
      (_, i) => (i + 1) * 6
    );

    // Safety check for empty time intervals
    if (timeIntervals.length === 0) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("No time intervals could be calculated");

      return;
    }

    const calculateSurvivalRate = (
      dataset: typeof survivalData,
      months: number
    ) => {
      const totalCount = dataset.length;
      if (totalCount === 0) return 0;

      const survivingCount = dataset.filter(
        (d) => d.stillOperating || d.survivalMonths < months
      ).length;
      return (survivingCount / totalCount) * 100;
    };

    const survivalRates = {
      dealRates: timeIntervals.map((months) => ({
        months,
        rate: calculateSurvivalRate(dealData, months),
      })),
      noDealRates: timeIntervals.map((months) => ({
        months,
        rate: calculateSurvivalRate(noDealData, months),
      })),
    };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up scales
    const x = d3
      .scaleLinear()
      .domain([0, Math.max(...timeIntervals)])
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Add line for deal data
    const dealLine = d3
      .line<{ months: number; rate: number }>()
      .x((d) => x(d.months))
      .y((d) => y(d.rate));

    svg
      .append("path")
      .datum(survivalRates.dealRates)
      .attr("fill", "none")
      .attr("stroke", "#4CAF50")
      .attr("stroke-width", 3)
      .attr("d", dealLine);

    // Add line for no deal data
    const noDealLine = d3
      .line<{ months: number; rate: number }>()
      .x((d) => x(d.months))
      .y((d) => y(d.rate));

    svg
      .append("path")
      .datum(survivalRates.noDealRates)
      .attr("fill", "none")
      .attr("stroke", "#FF5252")
      .attr("stroke-width", 3)
      .attr("d", noDealLine);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat((d) => `${d} months`));

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat((d) => `${d}%`));

    // Add legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top + 20})`
      );

    // Deal legend
    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#4CAF50");

    legend.append("text").attr("x", 30).attr("y", 15).text("Got Deal");

    // No Deal legend
    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("y", 30)
      .attr("fill", "#FF5252");

    legend.append("text").attr("x", 30).attr("y", 45).text("No Deal");

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text("Business Survival Rate Over Time");

    // Add axis labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Time Since Appearing on Shark Tank");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(height / 2))
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .text("Survival Rate (%)");

    // Add key findings text
    const findings = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right + 20}, ${margin.top + 90})`
      );

    findings
      .append("text")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Key Findings:");

    // Calculate 5-year survival rates
    const fiveYearIndex = survivalRates.dealRates.findIndex(
      (d) => d.months >= 60
    );

    if (fiveYearIndex >= 0) {
      const fiveYearDealRate = survivalRates.dealRates[fiveYearIndex].rate;
      const fiveYearNoDealRate = survivalRates.noDealRates[fiveYearIndex].rate;

      findings
        .append("text")
        .attr("y", 25)
        .attr("font-size", "14px")
        .text(`5-Year Deal Survival: ${fiveYearDealRate.toFixed(1)}%`);

      findings
        .append("text")
        .attr("y", 45)
        .attr("font-size", "14px")
        .text(`5-Year No Deal Survival: ${fiveYearNoDealRate.toFixed(1)}%`);

      findings
        .append("text")
        .attr("y", 65)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(
          `Difference: ${(fiveYearDealRate - fiveYearNoDealRate).toFixed(1)}%`
        );
    } else {
      findings
        .append("text")
        .attr("y", 25)
        .attr("font-size", "14px")
        .text("5-year survival data not available");
    }
  }, [data, isLoading, isError]);

  if (isLoading) return <div>Loading data...</div>;
  if (isError) return <div>Error loading data. Please try again later.</div>;
  if (data.length === 0) return <div>No data available for analysis.</div>;

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

export default TimeSurvivalAnalysis;
