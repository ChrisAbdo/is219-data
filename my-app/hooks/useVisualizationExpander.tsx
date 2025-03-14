"use client";
import { useState, useRef, useCallback, useEffect } from "react";

interface UseVisualizationExpanderProps {
  title: string;
  width?: number;
  height?: number;
}

export function useVisualizationExpander({
  title,
  width = 1200,
  height = 800,
}: UseVisualizationExpanderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const modalSvgRef = useRef<SVGSVGElement>(null);

  // Function to open the modal
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Function to close the modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Effect to handle resizing when modal is opened
  useEffect(() => {
    if (isModalOpen && svgRef.current && modalSvgRef.current) {
      // Copy the SVG content to the modal
      const originalSvg = svgRef.current;
      const modalSvg = modalSvgRef.current;

      // Preserve the original SVG viewBox if it exists
      const viewBox = originalSvg.getAttribute("viewBox");
      if (viewBox) {
        modalSvg.setAttribute("viewBox", viewBox);
      }

      // Set the new dimensions for the modal SVG
      modalSvg.setAttribute("width", width.toString());
      modalSvg.setAttribute("height", height.toString());

      // Clone the content
      modalSvg.innerHTML = originalSvg.innerHTML;
    }
  }, [isModalOpen, width, height]);

  return {
    containerRef,
    svgRef,
    modalSvgRef,
    isModalOpen,
    openModal,
    closeModal,
    modalTitle: title,
  };
}

export default useVisualizationExpander;
