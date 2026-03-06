import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface Player {
  player_id: string;
  player_name: string;
  team: string;
  role: string;
}

export interface InningsImpactPoint {
  match_id: string;
  date: string;
  opposition: string;
  format: string;
  runs: number;
  balls: number;
  wickets: number;
  economy: number;
  strike_rate: number;
  batting_impact: number;
  bowling_impact: number;
  context_multiplier: number;
  situation_multiplier: number;
  innings_impact: number;
}

export interface PlayerImpactResponse {
  player_id: string;
  player_name: string;
  team: string;
  role: string;
  impact_metric: number;
  rolling_impact: number;
  last_updated?: string | null;
  last_10_innings: InningsImpactPoint[];
  trend: string;
  explanation: string;
}

export const getPlayers = async (query: string): Promise<Player[]> => {
  if (!query) return [];
  try {
    const response = await axios.get(`${API_BASE_URL}/players`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch players', error);
    return [];
  }
};

export const getPlayerImpact = async (playerId: string): Promise<PlayerImpactResponse | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/player/${playerId}/impact`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch player impact', error);
    return null;
  }
};
