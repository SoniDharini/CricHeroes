import axios from 'axios';
import { Player, InningsData } from '../data/mockData';

const API_BASE_URL = 'http://localhost:8000/api';

export interface ExplainabilityDrivers {
  positiveDrivers: string[];
  negativeDrivers: string[];
}

export interface AnalyzeImpactRequest {
  playerId: string;
  playerName?: string;
  inningsWindow: number;
  format: string;
  tournament?: string;
  dateRange?: string;
  opposition?: string;
  venue?: string;
  weightingType: string;
}

export interface AnalyzeImpactResponse {
  player: Player;
  rollingImpactScore: number;
  inningsData: InningsData[];
  performanceContribution: number;
  contextContribution: number;
  pressureContribution: number;
  explainability: ExplainabilityDrivers;
  confidenceScore: number;
  warnings: string[];
  metadata: any;
}

export const searchPlayers = async (query: string): Promise<Player[]> => {
  if (!query) return [];
  try {
    const response = await axios.get(`${API_BASE_URL}/players/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to search players", error);
    return [];
  }
};

export const analyzePlayerImpact = async (params: AnalyzeImpactRequest): Promise<AnalyzeImpactResponse | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/player-impact/analyze`, params);
    return response.data;
  } catch (error) {
    console.error("Failed to analyze player impact", error);
    return null;
  }
};

export const getPlayerImpactHistory = async (playerId: string): Promise<InningsData[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/player-impact/history/${playerId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get player history", error);
    return [];
  }
};
