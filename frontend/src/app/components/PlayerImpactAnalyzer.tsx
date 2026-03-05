import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, BarChart3, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImpactMeter } from './ImpactMeter';
import { Navigation } from './Navigation';
import { ChartTooltip } from './ChartTooltip';
import {
  searchPlayers,
  analyzePlayerImpact,
  AnalyzeImpactResponse,
  Player
} from '../services/playerImpactApi';

interface PlayerImpactAnalyzerProps {
  onBack: () => void;
}

export function PlayerImpactAnalyzer({ onBack }: PlayerImpactAnalyzerProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [inningsWindow, setInningsWindow] = useState('10');
  const [matchFormat, setMatchFormat] = useState('all');

  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeImpactResponse | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (searchTerm.length >= 2) {
        const results = await searchPlayers(searchTerm);
        setFilteredPlayers(results);
      } else {
        setFilteredPlayers([]);
      }
    };
    const debounce = setTimeout(fetchPlayers, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const handleAnalyze = async () => {
    if (selectedPlayer) {
      setLoading(true);
      setShowResults(true);
      const result = await analyzePlayerImpact({
        playerId: selectedPlayer.id,
        inningsWindow: parseInt(inningsWindow),
        format: matchFormat,
        weightingType: 'exponential'
      });
      setAnalysisResult(result);
      setLoading(false);
    }
  };

  const trendData = analysisResult?.inningsData.map((innings, index) => ({
    name: `M${index + 1}`,
    score: innings.impactScore,
    date: innings.date,
  })) || [];

  const breakdownData = analysisResult ? [
    { name: 'Performance', value: analysisResult.performanceContribution, color: '#16a34a' },
    { name: 'Context', value: analysisResult.contextContribution, color: '#059669' },
    { name: 'Pressure', value: analysisResult.pressureContribution, color: '#10b981' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-slate-950 dark:via-green-950 dark:to-slate-900">
      <Navigation onBack={onBack} showBack title="Player Impact Analyzer" />

      <div className="max-w-7xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl text-gray-900 dark:text-white">Player Impact Metric Analyzer</h1>
          </div>
          <p className="text-gray-600 dark:text-slate-400">Calculate comprehensive impact scores with performance, context, and pressure analysis</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl sticky top-20">
              <h2 className="text-xl text-gray-900 dark:text-white mb-6">Analysis Configuration</h2>

              <div className="space-y-6">
                <div>
                  <Label className="text-gray-700 dark:text-slate-300 mb-2">Search Player</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
                    <Input
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  {searchTerm && filteredPlayers.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900/80 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg absolute z-10 w-full left-0 right-0">
                      {filteredPlayers.map(player => (
                        <button
                          key={player.id}
                          onClick={() => {
                            setSelectedPlayer(player);
                            setSearchTerm('');
                            setFilteredPlayers([]);
                            setShowResults(false);
                            setAnalysisResult(null);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                        >
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{player.team} • {player.role}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPlayer && (
                  <div className="p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 dark:border-green-500/30 rounded-lg">
                    <div className="text-gray-900 dark:text-white mb-1 font-medium">{selectedPlayer.name}</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">{selectedPlayer.team}</div>
                    <div className="text-sm text-green-700 dark:text-green-400 mt-1">{selectedPlayer.role}</div>
                  </div>
                )}

                <div>
                  <Label className="text-gray-700 dark:text-slate-300 mb-2">Innings Window</Label>
                  <Select value={inningsWindow} onValueChange={setInningsWindow}>
                    <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Last 5 innings</SelectItem>
                      <SelectItem value="10">Last 10 innings</SelectItem>
                      <SelectItem value="15">Last 15 innings</SelectItem>
                      <SelectItem value="20">Last 20 innings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-slate-300 mb-2">Match Format</Label>
                  <Select value={matchFormat} onValueChange={setMatchFormat}>
                    <SelectTrigger className="bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      <SelectItem value="t20">T20</SelectItem>
                      <SelectItem value="odi">ODI</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedPlayer || loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-md flex items-center justify-center gap-2"
                  size="lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  {loading ? 'Analyzing...' : 'Analyze Impact'}
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            {!showResults ? (
              <Card className="bg-white/50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 p-12 shadow-md dark:shadow-2xl flex flex-col items-center justify-center min-h-[600px]">
                <Activity className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl text-gray-600 dark:text-slate-400 mb-2">No Analysis Yet</h3>
                <p className="text-gray-500 dark:text-slate-500 text-center max-w-md">
                  Select a player and configure the analysis parameters, then click "Analyze Impact" to generate comprehensive metrics
                </p>
              </Card>
            ) : loading ? (
              <Card className="bg-white/50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center min-h-[600px]">
                <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-4" />
                <h3 className="text-xl text-gray-600 dark:text-slate-400">Running ML Models...</h3>
              </Card>
            ) : analysisResult ? (
              <div className="space-y-6">
                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-8 shadow-lg dark:shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                      <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Rolling Impact Metric</h2>
                      <p className="text-gray-600 dark:text-slate-400 mb-4">
                        Weighted average over last {inningsWindow} innings with recency bias
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"></div><span className="text-sm">≥ 70: Elite Impact</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-600"></div><span className="text-sm">50-70: High Impact</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-sm">30-50: Neutral Impact</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm">&lt; 30: Low Impact</span></div>
                      </div>
                    </div>
                    <ImpactMeter score={analysisResult.rollingImpactScore} size="lg" />
                  </div>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl">
                  <h3 className="text-xl text-gray-900 dark:text-white mb-4">Impact Score Trend</h3>
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                        <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-slate-400" />
                        <YAxis stroke="#6b7280" className="dark:stroke-slate-400" domain={[0, 100]} />
                        <Tooltip content={<ChartTooltip />} />
                        <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#16a34a', r: 5 }} activeDot={{ r: 7 }} />
                        <Line type="monotone" dataKey={() => 50} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 text-center mt-2">Yellow line indicates neutral baseline (50)</p>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl">
                  <h3 className="text-xl text-gray-900 dark:text-white mb-4">Impact Contribution Breakdown</h3>
                  <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={breakdownData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                        <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-slate-400" />
                        <YAxis stroke="#6b7280" className="dark:stroke-slate-400" />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h3 className="text-xl text-gray-900 dark:text-white mb-2">Impact Analysis Explanation</h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">Confidence: {analysisResult.confidenceScore.toFixed(0)}%</p>
                    </div>
                  </div>

                  {analysisResult.warnings?.map((w, idx) => (
                    <div key={idx} className="mb-2 p-2 bg-amber-500/10 text-amber-600 text-sm rounded">{w}</div>
                  ))}

                  <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-700/30 rounded-lg">
                    <h4 className="text-gray-900 dark:text-white mb-2 flex items-center gap-2 font-medium">
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" /> Key Positive Drivers
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-slate-300">
                      {analysisResult.explainability.positiveDrivers.length > 0 ? (
                        analysisResult.explainability.positiveDrivers.map((d, i) => <li key={i}>• {d}</li>)
                      ) : <li>• Neutral or not enough impact</li>}
                    </ul>
                  </div>

                  <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-700/30 rounded-lg">
                    <h4 className="text-gray-900 dark:text-white mb-2 flex items-center gap-2 font-medium">
                      <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400 rotate-180" /> Risk Factors / Negatives
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700 dark:text-slate-300">
                      {analysisResult.explainability.negativeDrivers.length > 0 ? (
                        analysisResult.explainability.negativeDrivers.map((d, i) => <li key={i}>• {d}</li>)
                      ) : <li>• No major risks found</li>}
                    </ul>
                  </div>
                </Card>
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
