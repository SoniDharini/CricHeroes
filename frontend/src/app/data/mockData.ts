// Mock data for cricket analytics platform

export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
  battingStyle?: string;
  bowlingStyle?: string;
}

export interface InningsData {
  matchId: string;
  date: string;
  opposition: string;
  venue: string;
  format: 'T20' | 'ODI' | 'Test';
  runs?: number;
  balls?: number;
  wickets?: number;
  overs?: number;
  economy?: number;
  strikeRate?: number;
  impactScore: number;
  performanceContribution: number;
  contextContribution: number;
  pressureContribution: number;
}

export const players: Player[] = [
  { id: '1', name: 'Virat Kohli', team: 'India', role: 'Batsman', battingStyle: 'Right-hand bat' },
  { id: '2', name: 'Rohit Sharma', team: 'India', role: 'Batsman', battingStyle: 'Right-hand bat' },
  { id: '3', name: 'Jasprit Bumrah', team: 'India', role: 'Bowler', bowlingStyle: 'Right-arm fast' },
  { id: '4', name: 'Ravindra Jadeja', team: 'India', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Left-arm orthodox' },
  { id: '5', name: 'MS Dhoni', team: 'India', role: 'Wicket-keeper', battingStyle: 'Right-hand bat' },
  { id: '6', name: 'Babar Azam', team: 'Pakistan', role: 'Batsman', battingStyle: 'Right-hand bat' },
  { id: '7', name: 'Shaheen Afridi', team: 'Pakistan', role: 'Bowler', bowlingStyle: 'Left-arm fast' },
  { id: '8', name: 'Ben Stokes', team: 'England', role: 'All-rounder', battingStyle: 'Left-hand bat', bowlingStyle: 'Right-arm fast-medium' },
  { id: '9', name: 'Steve Smith', team: 'Australia', role: 'Batsman', battingStyle: 'Right-hand bat' },
  { id: '10', name: 'Kane Williamson', team: 'New Zealand', role: 'Batsman', battingStyle: 'Right-hand bat' },
];

export const generateInningsData = (playerId: string, count: number = 10): InningsData[] => {
  const player = players.find(p => p.id === playerId);
  const data: InningsData[] = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const matchDate = new Date(today);
    matchDate.setDate(today.getDate() - (i * 7));
    
    const isBatsman = player?.role === 'Batsman' || player?.role === 'All-rounder' || player?.role === 'Wicket-keeper';
    const isBowler = player?.role === 'Bowler' || player?.role === 'All-rounder';
    
    const baseImpact = 50 + (Math.random() * 30 - 15);
    const performanceContribution = 30 + Math.random() * 20;
    const contextContribution = 20 + Math.random() * 15;
    const pressureContribution = 15 + Math.random() * 20;
    
    const innings: InningsData = {
      matchId: `M${i + 1}`,
      date: matchDate.toISOString().split('T')[0],
      opposition: ['Pakistan', 'Australia', 'England', 'South Africa', 'New Zealand'][Math.floor(Math.random() * 5)],
      venue: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'][Math.floor(Math.random() * 5)],
      format: ['T20', 'ODI'][Math.floor(Math.random() * 2)] as 'T20' | 'ODI',
      impactScore: Math.max(0, Math.min(100, baseImpact)),
      performanceContribution,
      contextContribution,
      pressureContribution,
    };
    
    if (isBatsman) {
      innings.runs = Math.floor(20 + Math.random() * 80);
      innings.balls = Math.floor(15 + Math.random() * 60);
      innings.strikeRate = innings.balls > 0 ? (innings.runs / innings.balls) * 100 : 0;
    }
    
    if (isBowler) {
      innings.wickets = Math.floor(Math.random() * 4);
      innings.overs = Math.floor(2 + Math.random() * 8);
      innings.economy = 4 + Math.random() * 6;
    }
    
    data.push(innings);
  }
  
  return data.reverse();
};

export const calculateRollingImpact = (inningsData: InningsData[]): number => {
  if (inningsData.length === 0) return 50;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  inningsData.forEach((innings, index) => {
    const weight = Math.exp(index * 0.2);
    weightedSum += innings.impactScore * weight;
    totalWeight += weight;
  });
  
  return weightedSum / totalWeight;
};

export interface MatchState {
  format: 'T20' | 'ODI' | 'Test';
  venue: string;
  pitchType: 'Batting-friendly' | 'Bowling-friendly' | 'Spin-friendly' | 'Pace-friendly' | 'Balanced';
  matchPhase: 'Powerplay' | 'Middle' | 'Death';
  currentScore: number;
  wickets: number;
  overs: number;
  target?: number;
  requiredRunRate?: number;
}

export interface TacticalRecommendation {
  playerId: string;
  playerName: string;
  tacticalScore: number;
  confidence: number;
  suitabilityTags: string[];
  reasoning: string[];
  riskFactors: string[];
}

export const generateTacticalRecommendations = (
  matchState: MatchState,
  targetPlayer: Player,
  availablePlayers: Player[],
  recommendationType: 'bowler-vs-batter' | 'batter-vs-bowler'
): TacticalRecommendation[] => {
  const recommendations: TacticalRecommendation[] = [];
  
  availablePlayers.forEach(player => {
    const baseScore = 50 + Math.random() * 40;
    const confidence = 60 + Math.random() * 35;
    
    const suitabilityTags: string[] = [];
    const reasoning: string[] = [];
    const riskFactors: string[] = [];
    
    if (matchState.matchPhase === 'Death' && player.role === 'Bowler') {
      suitabilityTags.push('Death-over specialist');
      reasoning.push('Strong record in death overs with yorker variations');
    }
    
    if (matchState.pitchType === 'Spin-friendly' && player.bowlingStyle?.includes('spin')) {
      suitabilityTags.push('Pitch-suited');
      reasoning.push('Spin-friendly conditions favor this bowler');
    }
    
    if (player.role === 'All-rounder') {
      suitabilityTags.push('Versatile option');
    }
    
    reasoning.push(`Recent impact score: ${(50 + Math.random() * 40).toFixed(1)}`);
    reasoning.push(`Strong performance in similar match situations`);
    
    if (confidence < 75) {
      riskFactors.push('Limited recent form data');
    }
    
    recommendations.push({
      playerId: player.id,
      playerName: player.name,
      tacticalScore: baseScore,
      confidence,
      suitabilityTags,
      reasoning,
      riskFactors,
    });
  });
  
  return recommendations.sort((a, b) => b.tacticalScore - a.tacticalScore).slice(0, 3);
};
