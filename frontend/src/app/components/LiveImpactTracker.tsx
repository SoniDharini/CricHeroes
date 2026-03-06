import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, X, Search, User, Shield, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Navigation } from './Navigation';
import { Player as PlayerSummary } from '../services/playerImpactApi';

interface LiveImpactTrackerProps {
    onBack: () => void;
}

export function LiveImpactTracker({ onBack }: LiveImpactTrackerProps) {
    const [matchType, setMatchType] = useState('T20');
    const [pitchType, setPitchType] = useState('Balanced');
    const [phase, setPhase] = useState('Middle Overs');
    const [situation, setSituation] = useState('Defending');
    const [score, setScore] = useState('');
    const [target, setTarget] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PlayerSummary[]>([]);
    const [selectedPlayers, setSelectedPlayers] = useState<PlayerSummary[]>([]);

    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (!searchQuery) {
            setSearchResults([]);
            return;
        }

        const timeoutid = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const response = await fetch(`http://localhost:8000/api/players?q=${searchQuery}`);
                if (response.ok) {
                    const data = await response.json();
                    setSearchResults(data);
                }
            } catch (error) {
                console.error('Error searching players:', error);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutid);
    }, [searchQuery]);

    const addPlayer = (player: PlayerSummary) => {
        if (!selectedPlayers.find(p => p.player_id === player.player_id)) {
            setSelectedPlayers([...selectedPlayers, player]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const removePlayer = (playerId: string) => {
        setSelectedPlayers(selectedPlayers.filter(p => p.player_id !== playerId));
    };

    const analyzeLiveImpact = async () => {
        if (selectedPlayers.length === 0) return;

        setLoading(true);
        try {
            const payload = {
                match_type: matchType,
                pitch_type: pitchType,
                phase: phase,
                situation: situation,
                score: score,
                target: situation === 'Chasing' ? target : undefined,
                players: selectedPlayers.map(p => p.player_id)
            };

            const response = await fetch('http://localhost:8000/api/live-impact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Error analyzing live impact:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <Navigation onBack={onBack} showBack title="Live Impact Tracker" />

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl text-gray-900 dark:text-white font-bold">Live Impact Tracker</h1>
                        <p className="text-gray-600 dark:text-slate-400 mt-1">Simulate live match scenarios & find highest impact players</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Input Form Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-md">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-orange-500" />
                                Match Context
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Match Type</label>
                                    <select
                                        value={matchType}
                                        onChange={(e) => setMatchType(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    >
                                        <option value="T20">T20</option>
                                        <option value="ODI">ODI</option>
                                        <option value="Test">Test</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Pitch Type</label>
                                    <select
                                        value={pitchType}
                                        onChange={(e) => setPitchType(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    >
                                        <option value="Batting Pitch">Batting Pitch</option>
                                        <option value="Bowling Pitch">Bowling Pitch</option>
                                        <option value="Spin Friendly">Spin Friendly</option>
                                        <option value="Seam Friendly">Seam Friendly</option>
                                        <option value="Balanced">Balanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Match Phase</label>
                                    <select
                                        value={phase}
                                        onChange={(e) => setPhase(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    >
                                        <option value="Powerplay">Powerplay</option>
                                        <option value="Middle Overs">Middle Overs</option>
                                        <option value="Death Overs">Death Overs</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Match Situation</label>
                                    <select
                                        value={situation}
                                        onChange={(e) => setSituation(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    >
                                        <option value="Defending">Defending</option>
                                        <option value="Chasing">Chasing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current Score (e.g. 150/4 in 16 overs)</label>
                                    <input
                                        type="text"
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        placeholder="Runs/Wickets in Overs"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                    />
                                </div>

                                {situation === 'Chasing' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 mt-4">Target Score</label>
                                        <input
                                            type="text"
                                            value={target}
                                            onChange={(e) => setTarget(e.target.value)}
                                            placeholder="e.g. 185"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        />
                                    </motion.div>
                                )}
                            </div>
                        </Card>

                        <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-md">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-500" />
                                Select Players
                            </h2>

                            <div className="relative mb-4">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search players..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />

                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {searchResults.map((player) => (
                                            <button
                                                key={player.player_id}
                                                onClick={() => addPlayer(player)}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-col"
                                            >
                                                <span className="text-gray-900 dark:text-white font-medium">{player.player_name}</span>
                                                <span className="text-xs text-gray-500 dark:text-slate-400">{player.team} • {player.role}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 flex-grow max-h-48 overflow-y-auto">
                                {selectedPlayers.map((player) => (
                                    <div key={player.player_id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 p-2 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-900 dark:text-white font-medium leading-none">{player.player_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{player.role}</p>
                                        </div>
                                        <button
                                            onClick={() => removePlayer(player.player_id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {selectedPlayers.length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No players selected.</p>
                                )}
                            </div>

                            <Button
                                onClick={analyzeLiveImpact}
                                disabled={selectedPlayers.length === 0 || loading}
                                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {loading ? 'Analyzing...' : 'Analyze Live Impact'}
                            </Button>
                        </Card>
                    </div>

                    {/* Results Column */}
                    <div className="lg:col-span-8">
                        {!results ? (
                            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-800/20 border-dashed border-2 border-gray-300 dark:border-slate-700">
                                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <Activity className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-xl text-gray-900 dark:text-white font-medium mb-2">Awaiting Context</h3>
                                <p className="text-gray-500 dark:text-slate-400 text-center max-w-md">
                                    Input the current match context and select players to evaluate their real-world live impact under these specific conditions.
                                </p>
                            </Card>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                                {/* Insights Summary */}
                                <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 border-none shadow-lg text-white">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold mb-2">Tactical Insight</h2>
                                            <p className="text-indigo-100 text-lg leading-relaxed mix-blend-lighten text-white brightness-150">{results.tactical_insight}</p>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Recommended Batsman */}
                                    {results.recommended_batsman && (
                                        <Card className="p-6 bg-white dark:bg-slate-800 border-green-200 dark:border-green-900/50 shadow-md relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                                            <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 tracking-wider uppercase mb-1">Best Batter Option</h3>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{results.recommended_batsman.player_name}</p>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600 dark:text-slate-400">Live Impact Meter</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{results.recommended_batsman.live_impact_score} / 100</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full" style={{ width: `${results.recommended_batsman.live_impact_score}%` }}></div>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-gray-700 dark:text-slate-300">
                                                    <strong>Reason:</strong> {results.recommended_batsman.reason}
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* Recommended Bowler */}
                                    {results.recommended_bowler && (
                                        <Card className="p-6 bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/50 shadow-md relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                                            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-1">Best Bowler Option</h3>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{results.recommended_bowler.player_name}</p>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600 dark:text-slate-400">Live Impact Meter</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{results.recommended_bowler.live_impact_score} / 100</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" style={{ width: `${results.recommended_bowler.live_impact_score}%` }}></div>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-gray-700 dark:text-slate-300">
                                                    <strong>Reason:</strong> {results.recommended_bowler.reason}
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </div>

                                {/* Player Matchup Chart */}
                                <Card className="p-6 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-md">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-orange-500" />
                                        Player Matchup Chart (Current Impact)
                                    </h2>

                                    <div className="space-y-5">
                                        {results.player_options.map((player: any, idx: number) => (
                                            <div key={idx} className="relative">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{player.player_name} <span className="text-xs text-gray-500 pl-2 font-normal">{player.role}</span></span>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{player.live_impact_score}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${player.live_impact_score}%` }}
                                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                        className={`h-3 rounded-full ${idx === 0 ? 'bg-orange-500' : 'bg-slate-400 dark:bg-slate-500'}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
