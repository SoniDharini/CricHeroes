import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ChevronRight, Activity, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Navigation } from './Navigation';
import { players, generateTacticalRecommendations, type MatchState, type Player } from '../data/mockData';

interface LiveMatchTacticalAnalyzerProps {
  onBack: () => void;
}

export function LiveMatchTacticalAnalyzer({ onBack }: LiveMatchTacticalAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [matchState, setMatchState] = useState<Partial<MatchState>>({
    format: 'T20',
    matchPhase: 'Powerplay',
    pitchType: 'Balanced',
  });
  const [teamA, setTeamA] = useState('India');
  const [teamB, setTeamB] = useState('Australia');
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [recommendationType, setRecommendationType] = useState<'bowler-vs-batter' | 'batter-vs-bowler'>('bowler-vs-batter');
  const [showResults, setShowResults] = useState(false);
  
  const teamAPlayers = players.filter(p => p.team === teamA);
  const teamBPlayers = players.filter(p => p.team === teamB);
  
  const handleAnalyze = () => {
    if (targetPlayer) {
      setShowResults(true);
    }
  };
  
  const recommendations = targetPlayer && matchState.format && matchState.venue && matchState.pitchType && matchState.matchPhase && matchState.currentScore !== undefined && matchState.wickets !== undefined && matchState.overs !== undefined
    ? generateTacticalRecommendations(
        matchState as MatchState,
        targetPlayer,
        recommendationType === 'bowler-vs-batter' ? teamAPlayers.filter(p => p.role === 'Bowler' || p.role === 'All-rounder') : teamAPlayers,
        recommendationType
      )
    : [];
  
  const getPressureLevel = () => {
    if (!matchState.currentScore || !matchState.overs) return 'Medium';
    const runRate = matchState.currentScore / matchState.overs;
    if (matchState.requiredRunRate && matchState.requiredRunRate - runRate > 3) return 'High';
    if (matchState.wickets && matchState.wickets > 6) return 'High';
    if (matchState.matchPhase === 'Death') return 'High';
    return 'Medium';
  };
  
  const steps = [
    { number: 1, title: 'Match Setup', icon: Activity },
    { number: 2, title: 'Teams & Players', icon: Target },
    { number: 3, title: 'Match State', icon: TrendingUp },
    { number: 4, title: 'Target Selection', icon: CheckCircle2 },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-slate-950 dark:via-green-950 dark:to-slate-900">
      <Navigation onBack={onBack} showBack title="Live Tactical Analyzer" />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl text-gray-900 dark:text-white">Live Match Tactical Analyzer</h1>
          </div>
          <p className="text-gray-600 dark:text-slate-400">Real-time player matchup recommendations based on match context and conditions</p>
        </motion.div>
        
        {/* Progress Steps */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-green-600 dark:bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm ${currentStep >= step.number ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-600 dark:bg-green-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
        </Card>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl sticky top-20">
              <AnimatePresence mode="wait">
                {/* Step 1: Match Setup */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-xl text-gray-900 dark:text-white mb-6">Match Setup</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Format</Label>
                        <Select
                          value={matchState.format}
                          onValueChange={(value) => setMatchState({ ...matchState, format: value as MatchState['format'] })}
                        >
                          <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="T20">T20</SelectItem>
                            <SelectItem value="ODI">ODI</SelectItem>
                            <SelectItem value="Test">Test</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Venue</Label>
                        <Input
                          placeholder="e.g., Mumbai"
                          value={matchState.venue || ''}
                          onChange={(e) => setMatchState({ ...matchState, venue: e.target.value })}
                          className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Pitch Type</Label>
                        <Select
                          value={matchState.pitchType}
                          onValueChange={(value) => setMatchState({ ...matchState, pitchType: value as MatchState['pitchType'] })}
                        >
                          <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Batting-friendly">Batting-friendly</SelectItem>
                            <SelectItem value="Bowling-friendly">Bowling-friendly</SelectItem>
                            <SelectItem value="Spin-friendly">Spin-friendly</SelectItem>
                            <SelectItem value="Pace-friendly">Pace-friendly</SelectItem>
                            <SelectItem value="Balanced">Balanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Match Phase</Label>
                        <Select
                          value={matchState.matchPhase}
                          onValueChange={(value) => setMatchState({ ...matchState, matchPhase: value as MatchState['matchPhase'] })}
                        >
                          <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Powerplay">Powerplay</SelectItem>
                            <SelectItem value="Middle">Middle Overs</SelectItem>
                            <SelectItem value="Death">Death Overs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 2: Teams */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-xl text-gray-900 dark:text-white mb-6">Teams & Players</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Team A (Your Team)</Label>
                        <Select value={teamA} onValueChange={setTeamA}>
                          <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="England">England</SelectItem>
                            <SelectItem value="Pakistan">Pakistan</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Team B (Opposition)</Label>
                        <Select value={teamB} onValueChange={setTeamB}>
                          <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="England">England</SelectItem>
                            <SelectItem value="Pakistan">Pakistan</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 dark:border-green-500/30 rounded-lg">
                        <div className="text-sm text-gray-700 dark:text-slate-300 mb-2">Available Players</div>
                        <div className="text-gray-900 dark:text-white">Team A: {teamAPlayers.length} players</div>
                        <div className="text-gray-900 dark:text-white">Team B: {teamBPlayers.length} players</div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 3: Match State */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-xl text-gray-900 dark:text-white mb-6">Live Match State</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Current Score</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 125"
                          value={matchState.currentScore || ''}
                          onChange={(e) => setMatchState({ ...matchState, currentScore: parseInt(e.target.value) || 0 })}
                          className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Wickets Lost</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 3"
                          value={matchState.wickets || ''}
                          onChange={(e) => setMatchState({ ...matchState, wickets: parseInt(e.target.value) || 0 })}
                          className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Overs Completed</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 12.3"
                          value={matchState.overs || ''}
                          onChange={(e) => setMatchState({ ...matchState, overs: parseFloat(e.target.value) || 0 })}
                          className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Target (if chasing)</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 180"
                          value={matchState.target || ''}
                          onChange={(e) => setMatchState({ ...matchState, target: parseInt(e.target.value) || undefined })}
                          className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Required Run Rate</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 9.5"
                          value={matchState.requiredRunRate || ''}
                          onChange={(e) => setMatchState({ ...matchState, requiredRunRate: parseFloat(e.target.value) || undefined })}
                          className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Step 4: Target Selection */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-xl text-gray-900 dark:text-white mb-6">Target Selection</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Recommendation Type</Label>
                        <Select
                          value={recommendationType}
                          onValueChange={(value) => setRecommendationType(value as typeof recommendationType)}
                        >
                          <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bowler-vs-batter">Best Bowler vs Batter</SelectItem>
                            <SelectItem value="batter-vs-bowler">Best Batter vs Bowler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-gray-700 dark:text-slate-300 mb-2">Opposition Player to Counter</Label>
                        <Select
                          value={targetPlayer?.id || ''}
                          onValueChange={(value) => {
                            const player = teamBPlayers.find(p => p.id === value);
                            setTargetPlayer(player || null);
                          }}
                        >
                          <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                            <SelectValue placeholder="Select player" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamBPlayers.map(player => (
                              <SelectItem key={player.id} value={player.id}>
                                {player.name} - {player.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {targetPlayer && (
                        <div className="p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 dark:border-green-500/30 rounded-lg">
                          <div className="text-gray-900 dark:text-white mb-1 font-medium">{targetPlayer.name}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{targetPlayer.team}</div>
                          <div className="text-sm text-green-700 dark:text-green-400 mt-1">{targetPlayer.role}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-md"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleAnalyze}
                    disabled={!targetPlayer}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-md"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </Button>
                )}
              </div>
            </Card>
          </div>
          
          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!showResults ? (
              <Card className="bg-white/50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 p-12 shadow-md dark:shadow-2xl flex flex-col items-center justify-center min-h-[600px]">
                <Target className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl text-gray-600 dark:text-slate-400 mb-2">Configure Match Analysis</h3>
                <p className="text-gray-500 dark:text-slate-500 text-center max-w-md">
                  Complete all steps and select a target player to receive tactical recommendations
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Pressure Indicator */}
                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl text-gray-900 dark:text-white mb-1">Match Pressure Level</h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">Based on current match situation</p>
                    </div>
                    <Badge
                      className={`text-lg px-4 py-2 ${
                        getPressureLevel() === 'High'
                          ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {getPressureLevel()} Pressure
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-3 bg-gray-100 dark:bg-slate-700/30 rounded-lg">
                      <div className="text-gray-600 dark:text-slate-400 text-sm">Score</div>
                      <div className="text-gray-900 dark:text-white text-xl">{matchState.currentScore}/{matchState.wickets}</div>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-slate-700/30 rounded-lg">
                      <div className="text-gray-600 dark:text-slate-400 text-sm">Overs</div>
                      <div className="text-gray-900 dark:text-white text-xl">{matchState.overs}</div>
                    </div>
                    <div className="p-3 bg-gray-100 dark:bg-slate-700/30 rounded-lg">
                      <div className="text-gray-600 dark:text-slate-400 text-sm">Phase</div>
                      <div className="text-gray-900 dark:text-white text-xl">{matchState.matchPhase}</div>
                    </div>
                  </div>
                </Card>
                
                {/* Recommendations */}
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.playerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl hover:border-green-500/50 dark:hover:border-green-500 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold">
                                #{index + 1}
                              </div>
                              <div>
                                <h3 className="text-2xl text-gray-900 dark:text-white">{rec.playerName}</h3>
                                <p className="text-gray-600 dark:text-slate-400 text-sm">
                                  {players.find(p => p.id === rec.playerId)?.role}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {rec.suitabilityTags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="border-green-500/40 dark:border-green-500/30 text-green-700 dark:text-green-300">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-3xl text-gray-900 dark:text-white font-bold mb-1">{rec.tacticalScore.toFixed(1)}</div>
                            <div className="text-sm text-gray-600 dark:text-slate-400">Tactical Score</div>
                            <div className="mt-2 text-sm">
                              <span className="text-green-700 dark:text-green-400 font-medium">{rec.confidence.toFixed(0)}% confidence</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-gray-900 dark:text-white font-medium">Why This Player?</span>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {rec.reasoning.map((reason, i) => (
                                <li key={i} className="text-sm text-gray-700 dark:text-slate-300">• {reason}</li>
                              ))}
                            </ul>
                          </div>
                          
                          {rec.riskFactors.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-gray-900 dark:text-white font-medium">Risk Factors</span>
                              </div>
                              <ul className="space-y-1 ml-6">
                                {rec.riskFactors.map((risk, i) => (
                                  <li key={i} className="text-sm text-gray-700 dark:text-slate-300">• {risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
