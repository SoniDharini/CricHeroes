import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { PlayerImpactAnalyzer } from './components/PlayerImpactAnalyzer';
import { LiveMatchTacticalAnalyzer } from './components/LiveMatchTacticalAnalyzer';
import { LiveImpactTracker } from './components/LiveImpactTracker';

type Page = 'landing' | 'dashboard' | 'impact-analyzer' | 'tactical-analyzer' | 'live-impact';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} onBack={() => setCurrentPage('landing')} />;
      case 'impact-analyzer':
        return <PlayerImpactAnalyzer onBack={() => setCurrentPage('dashboard')} />;
      case 'tactical-analyzer':
        return <LiveMatchTacticalAnalyzer onBack={() => setCurrentPage('dashboard')} />;
      case 'live-impact':
        return <LiveImpactTracker onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">{renderPage()}</div>
    </ThemeProvider>
  );
}
