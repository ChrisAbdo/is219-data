import useSWR from 'swr';
import * as d3 from 'd3';
import { DSVRowString } from 'd3';

// Define types for Shark Tank data
export interface SharkTankRow {
  name: string;
  status: string;
  is_deal: string;
  ask_valuation: string;
  deal_valuation: string;
  category: string;
  deal_structure: string;
  [key: string]: string; // For any other fields in the CSV
}

// Define a type for the row mapper function
type RowMapper<T> = (row: DSVRowString<string>, index: number, columns: string[]) => T;

// Generic CSV fetcher function for SWR
const csvFetcher = async <T extends object>(url: string, rowMapper: RowMapper<T>): Promise<T[]> => {
  try {
    const result = await d3.csv(url, rowMapper);
    return result as unknown as T[];
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    throw error;
  }
};

// Hook for fetching Shark Tank data with different transformations
export function useSharkTankData<T extends object>(rowMapper: RowMapper<T>) {
  const { data, error, isLoading } = useSWR<T[]>(
    ['/data/sharktank.csv', rowMapper] as const,
    async ([url, mapper]: readonly [string, RowMapper<T>]) => csvFetcher<T>(url, mapper),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  return {
    data: data || [],
    isLoading,
    isError: error
  };
}

// Types for the different data transformations
export interface StatusAndDealData {
  status: string;
  is_deal: boolean;
}

export interface ValuationData {
  name: string;
  ask_valuation: number;
  deal_valuation: number;
  category: string;
  is_deal: boolean;
}

export interface IndustryData {
  category: string;
  is_deal: boolean;
}

export interface ValuationDiffData {
  category: string;
  valuation_diff: number;
  is_deal: boolean;
}

export interface DealStructureData {
  deal_structure: string;
  status: string;
}

export interface IndustryAndStatusData {
  category: string;
  status: string;
  is_deal: boolean;
}

// Add a new mapper for deal percentage equity data
export interface EquityData {
  category: string;
  deal_perc_equity: number;
  status: string;
  is_deal: boolean;
}

// Predefined mappers for common data transformations
export const mappers = {
  // Basic status and deal info
  statusAndDeal: (d: DSVRowString<string>): StatusAndDealData => ({
    status: d.status,
    is_deal: d.is_deal.toLowerCase() === "true",
  }),
  
  // Valuation data
  valuation: (d: DSVRowString<string>): ValuationData => ({
    name: d.name,
    ask_valuation: +d.ask_valuation,
    deal_valuation: +d.deal_valuation,
    category: d.category,
    is_deal: d.is_deal.toLowerCase() === "true",
  }),
  
  // Industry category data
  industry: (d: DSVRowString<string>): IndustryData => ({
    category: d.category,
    is_deal: d.is_deal.trim().toLowerCase() === "true",
  }),
  
  // Valuation difference data
  valuationDiff: (d: DSVRowString<string>): ValuationDiffData => ({
    category: d.category,
    valuation_diff: (+d.deal_valuation - +d.ask_valuation) / +d.ask_valuation,
    is_deal: d.is_deal.toLowerCase() === "true",
  }),
  
  // Deal structure data
  dealStructure: (d: DSVRowString<string>): DealStructureData => ({
    deal_structure: d.deal_structure,
    status: d.status,
  }),
  
  // Industry and status data
  industryAndStatus: (d: DSVRowString<string>): IndustryAndStatusData => ({
    category: d.category,
    status: d.status,
    is_deal: d.is_deal.toLowerCase() === "true",
  }),
  
  // Equity data for ROI analysis
  equity: (d: DSVRowString<string>): EquityData => ({
    category: d.category,
    deal_perc_equity: +d.deal_perc_equity || 0,
    status: d.status,
    is_deal: d.is_deal.toLowerCase() === "true",
  }),
}; 