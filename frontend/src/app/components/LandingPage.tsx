import { motion } from 'motion/react';
import { TrendingUp, Target, BarChart3, Zap, ArrowRight, Activity, Shield, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { Navigation } from './Navigation';

interface LandingPageProps {
  onNavigate: (page: 'dashboard' | 'impact-analyzer' | 'tactical-analyzer') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-slate-950 dark:via-green-950 dark:to-slate-900">
      <Navigation title="Cricket Analytics" />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgzNCwgMTk3LCAxMDYsIDAuMDUpIiBmaWxsPSJub25lIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        <div className="container mx-auto px-6 pt-16 pb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 dark:bg-green-500/20 border border-green-500/20 dark:border-green-500/30 mb-6">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300">Advanced Cricket Intelligence Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-gray-900 via-green-800 to-green-600 dark:from-white dark:via-green-100 dark:to-green-200 bg-clip-text text-transparent font-bold">
              Cricket Impact Metric
              <br />
              <span className="text-4xl md:text-6xl">& Tactical Intelligence</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Data-driven player analysis and real-time tactical recommendations powered by advanced metrics,
              match context awareness, and pressure situation modeling
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onNavigate('impact-analyzer')}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-8 py-6 text-lg group shadow-lg shadow-green-500/30"
              >
                Analyze Player Impact
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                onClick={() => onNavigate('tactical-analyzer')}
                size="lg"
                variant="outline"
                className="border-2 border-green-400/50 dark:border-green-400/30 text-green-700 dark:text-green-300 hover:bg-green-500/10 dark:hover:bg-green-500/20 px-8 py-6 text-lg"
              >
                Analyze Live Match
              </Button>
            </div>
          </motion.div>
          
          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 mt-16 max-w-5xl mx-auto"
          >
            {/* Player Impact Card */}
            <div className="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-green-500/50 dark:hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl dark:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 dark:from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-green-500/10 dark:bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-white mb-3">Player Impact Metric Analyzer</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Calculate comprehensive impact scores using performance, match context, and pressure situations.
                  Track trends over rolling innings with explainable analytics.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                    0-100 normalized impact score (50 = baseline)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                    Rolling window analysis with recency weighting
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                    Performance, context & pressure breakdowns
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Tactical Recommendation Card */}
            <div className="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-green-500/50 dark:hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl dark:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 dark:from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-green-500/10 dark:bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl text-gray-900 dark:text-white mb-3">Live Tactical Recommendation Engine</h3>
                <p className="text-gray-600 dark:text-slate-400 mb-4 leading-relaxed">
                  Get real-time player matchup recommendations based on live match context, pitch conditions,
                  and historical performance patterns.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                    Best bowler vs batter matchup analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                    Match phase & pressure situation aware
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></div>
                    Explainable tactical scores with confidence
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-gray-50 dark:bg-slate-900/50 py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-slate-400 text-lg">Three simple steps to actionable cricket intelligence</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: BarChart3,
                title: 'Analyze Performance',
                description: 'Input player data and match context to generate comprehensive impact metrics',
              },
              {
                icon: Brain,
                title: 'Process Intelligence',
                description: 'Advanced algorithms calculate weighted scores with performance, context, and pressure factors',
              },
              {
                icon: Activity,
                title: 'Get Insights',
                description: 'Receive explainable recommendations and visualizations for data-driven decisions',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 dark:bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-xl text-gray-900 dark:text-white mb-2">{step.title}</div>
                <p className="text-gray-600 dark:text-slate-400 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Key Benefits */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl text-gray-900 dark:text-white mb-4">Key Benefits</h2>
            <p className="text-gray-600 dark:text-slate-400 text-lg">Why choose our analytics platform</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: 'Data-Driven', description: 'Decisions backed by comprehensive metrics and historical analysis' },
              { icon: Brain, title: 'Explainable', description: 'Every score and recommendation comes with clear reasoning and breakdowns' },
              { icon: Zap, title: 'Real-Time', description: 'Live match analysis with instant tactical recommendations' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center shadow-lg dark:shadow-2xl"
              >
                <benefit.icon className="w-10 h-10 mx-auto mb-3 text-green-600 dark:text-green-400" />
                <h3 className="text-xl text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl text-gray-900 dark:text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-700 dark:text-slate-300 text-lg mb-8">
              Experience the power of advanced cricket analytics
            </p>
            <Button
              onClick={() => onNavigate('dashboard')}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-10 py-6 text-lg shadow-lg shadow-green-500/30"
            >
              Launch Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 py-8 border-t border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-6 text-center text-gray-600 dark:text-slate-400 text-sm">
          <p>Cricket Impact Metric & Tactical Intelligence Platform</p>
          <p className="mt-2">Built with advanced analytics for data-driven cricket intelligence</p>
        </div>
      </footer>
    </div>
  );
}
