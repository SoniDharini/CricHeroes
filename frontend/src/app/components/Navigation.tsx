import { ArrowLeft, Sun, Moon, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';

interface NavigationProps {
  onBack?: () => void;
  showBack?: boolean;
  title?: string;
}

export function Navigation({ onBack, showBack = false, title }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            {title && (
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
              <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Cricket Analytics Platform</span>
            </div>
            
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="border-gray-300 dark:border-slate-700"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
