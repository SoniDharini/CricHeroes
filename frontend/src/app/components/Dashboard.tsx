import { motion } from 'motion/react';
import { TrendingUp, Target, BarChart3, Users, Activity, Trophy } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Navigation } from './Navigation';

interface DashboardProps {
  onNavigate: (page: 'impact-analyzer' | 'tactical-analyzer' | 'live-impact') => void;
  onBack: () => void;
}

export function Dashboard({ onNavigate, onBack }: DashboardProps) {
  const stats = [
    { label: 'Players Analyzed', value: '150+', icon: Users, color: 'green' },
    { label: 'Impact Calculations', value: '1,200+', icon: Activity, color: 'emerald' },
    { label: 'Tactical Recommendations', value: '450+', icon: Target, color: 'teal' },
    { label: 'Match Insights', value: '85+', icon: Trophy, color: 'lime' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-slate-950 dark:via-green-950 dark:to-slate-900">
      <Navigation onBack={onBack} showBack title="Dashboard" />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl text-gray-900 dark:text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400">Access player impact analysis and live tactical recommendations</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-md hover:shadow-lg transition-shadow dark:shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl text-gray-900 dark:text-white font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 dark:bg-${stat.color}-500/20 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Feature Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Player Impact Analyzer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-8 shadow-lg hover:shadow-xl dark:shadow-2xl hover:border-green-500/50 dark:hover:border-green-500 transition-all group h-full">
              <div className="flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>

                <h2 className="text-3xl text-gray-900 dark:text-white mb-3">Player Impact Metric Analyzer</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                  Calculate comprehensive impact scores based on performance, match context, and pressure situations.
                </p>

                <Button
                  onClick={() => onNavigate('impact-analyzer')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-md mt-auto"
                  size="lg"
                >
                  Launch Impact Analyzer
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Live Tactical Analyzer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-8 shadow-lg hover:shadow-xl dark:shadow-2xl hover:border-green-500/50 dark:hover:border-green-500 transition-all group h-full">
              <div className="flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>

                <h2 className="text-3xl text-gray-900 dark:text-white mb-3">Live Match Tactical Analyzer</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                  Get real-time tactical recommendations for player matchups based on live match context and pitch conditions.
                </p>

                <Button
                  onClick={() => onNavigate('tactical-analyzer')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-md mt-auto"
                  size="lg"
                >
                  Launch Tactical Analyzer
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Live Impact Tracker */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-8 shadow-lg hover:shadow-xl dark:shadow-2xl hover:border-orange-500/50 dark:hover:border-orange-500 transition-all group h-full">
              <div className="flex flex-col h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>

                <h2 className="text-3xl text-gray-900 dark:text-white mb-3">Live Impact Tracker</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-6 flex-grow">
                  Simulate live match intelligence by inputting current match context & getting optimal player recommendations dynamically.
                </p>

                <Button
                  onClick={() => onNavigate('live-impact')}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-md mt-auto"
                  size="lg"
                >
                  Launch Live Impact Tracker
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Quick Insights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-md dark:shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-gray-900 dark:text-white">Top Impact Player</h3>
              </div>
              <p className="text-2xl text-gray-900 dark:text-white mb-1">Virat Kohli</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Impact Score: 78.5</p>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-md dark:shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-gray-900 dark:text-white">Most Analyzed</h3>
              </div>
              <p className="text-2xl text-gray-900 dark:text-white mb-1">Jasprit Bumrah</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">45 analyses</p>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 p-6 shadow-md dark:shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="text-gray-900 dark:text-white">Recent Matchup</h3>
              </div>
              <p className="text-2xl text-gray-900 dark:text-white mb-1">T20 Format</p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Death overs specialist</p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
