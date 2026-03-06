import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, BarChart3, Activity, AlertCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImpactMeter } from './ImpactMeter';
import { Navigation } from './Navigation';
import { ChartTooltip } from './ChartTooltip';
import {
  getPlayerImpact,
  getPlayers,
  PlayerImpactResponse,
  Player,
} from '../services/playerImpactApi';

interface PlayerImpactAnalyzerProps {
  onBack: () => void;
}

export function PlayerImpactAnalyzer({ onBack }: PlayerImpactAnalyzerProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PlayerImpactResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (searchTerm.length >= 2) {
        const results = await getPlayers(searchTerm);
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
      setError(null);
      const result = await getPlayerImpact(selectedPlayer.player_id);
      setAnalysisResult(result);
      if (!result) {
        setError('Impact data could not be loaded for this player.');
      }
      setLoading(false);
    }
  };

  const trendData = analysisResult?.last_10_innings.map((innings, index) => ({
    name: `I${index + 1}`,
    score: innings.innings_impact,
    date: innings.date,
    opposition: innings.opposition,
  })) || [];

  const breakdownData = useMemo(() => {
    if (!analysisResult || analysisResult.last_10_innings.length === 0) {
      return [];
    }
    const innings = analysisResult.last_10_innings;
    const average = (values: number[]) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;
    return [
      { name: 'Batting Impact', value: average(innings.map((point) => point.batting_impact)), color: '#16a34a' },
      { name: 'Bowling Impact', value: average(innings.map((point) => point.bowling_impact)), color: '#059669' },
      { name: 'Context Mult.', value: average(innings.map((point) => point.context_multiplier)) * 20, color: '#10b981' },
      { name: 'Situation Mult.', value: average(innings.map((point) => point.situation_multiplier)) * 20, color: '#0f766e' },
    ];
  }, [analysisResult]);

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
          <p className="text-gray-600 dark:text-slate-400">A context-aware 0-100 metric that estimates how much a player changes match outcome probability under pressure</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-lg dark:shadow-2xl sticky top-20">
              <h2 className="text-xl text-gray-900 dark:text-white mb-6">Player Selector</h2>

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
                            setError(null);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-700/50 last:border-0"
                        >
                          <div className="font-medium">{player.player_name}</div>
                          <div className="text-sm text-gray-600 dark:text-slate-400">{player.team} • {player.role}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedPlayer && (
                  <div className="p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 dark:border-green-500/30 rounded-lg">
                    <div className="text-gray-900 dark:text-white mb-1 font-medium">{selectedPlayer.player_name}</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">{selectedPlayer.team}</div>
                    <div className="text-sm text-green-700 dark:text-green-400 mt-1">{selectedPlayer.role}</div>
                  </div>
                )}

                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-4">
                  <Label className="text-gray-700 dark:text-slate-300 mb-2 block">Metric Definition</Label>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Rolling Impact uses the last 10 innings with weights from 0.1 to 1.0, then normalizes to a 0-100 scale with 50 as the neutral baseline.
                  </p>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedPlayer || loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-md flex items-center justify-center gap-2"
                  size="lg"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                  {loading ? 'Analyzing...' : 'Load Impact Metric'}
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            {!showResults ? (
              <Card className="bg-white/50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 p-12 shadow-md dark:shadow-2xl flex flex-col items-center justify-center min-h-[600px]">
                <Activity className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl text-gray-600 dark:text-slate-400 mb-2">No Player Selected</h3>
                <p className="text-gray-500 dark:text-slate-500 text-center max-w-md">
                  Search for a player, then load the rolling impact metric, innings trend, and context breakdown.
                </p>
              </Card>
            ) : loading ? (
              <Card className="bg-white/50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center min-h-[600px]">
                <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-4" />
                <h3 className="text-xl text-gray-600 dark:text-slate-400">Calculating impact metric...</h3>
              </Card>
            ) : analysisResult ? (
              <div className="space-y-6">
                <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-8 shadow-lg dark:shadow-2xl">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                      <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Rolling Impact Metric</h2>
                      <p className="text-gray-600 dark:text-slate-400 mb-4">
                        {analysisResult.player_name} over the last 10 innings with recency weighting and neutral baseline normalization
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-sm">0-30: Low Impact</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="text-sm">30-50: Below Average</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-sm">50: Neutral Baseline</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-600"></div><span className="text-sm">50-70: Positive Impact</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-700"></div><span className="text-sm">70-100: High to Match-Winning Impact</span></div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500 dark:text-slate-400">
                        Rolling raw score: {analysisResult.rolling_impact.toFixed(2)} • Trend: {analysisResult.trend}
                      </div>
                    </div>
                    <ImpactMeter score={analysisResult.impact_metric} size="lg" />
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
                  <h3 className="text-xl text-gray-900 dark:text-white mb-4">Context Breakdown</h3>
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
                      <h3 className="text-xl text-gray-900 dark:text-white mb-2">Explanation Panel</h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">
                        Last updated: {analysisResult.last_updated ? new Date(analysisResult.last_updated).toLocaleString() : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-700/30 rounded-lg text-sm text-gray-700 dark:text-slate-300 leading-7">
                    {analysisResult.explanation}
                  </div>
                </Card>
              </div>
            ) : error ? (
              <Card className="bg-white/50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center min-h-[600px]">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-xl text-gray-600 dark:text-slate-400 mb-2">Unable to load player impact</h3>
                <p className="text-gray-500 dark:text-slate-500 text-center max-w-md">{error}</p>
              </Card>
            ) : null}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
