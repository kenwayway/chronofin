import { useState } from 'react';
import { Home, PieChart, Wallet, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import Timeline from './pages/Timeline';
import Accounts from './pages/Accounts';
import Statistics from './pages/Statistics';
import Config from './pages/Config';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState('timeline');

  return (
    <div className="app">
      {/* Header with Navigation */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">ChronoFin</h1>

          {/* Navigation in Header */}
          <nav className="header-nav">
            <button
              className={`nav-item ${currentPage === 'timeline' ? 'active' : ''}`}
              onClick={() => setCurrentPage('timeline')}
              title="Timeline"
            >
              <Home size={18} />
            </button>
            <button
              className={`nav-item ${currentPage === 'accounts' ? 'active' : ''}`}
              onClick={() => setCurrentPage('accounts')}
              title="Accounts"
            >
              <Wallet size={18} />
            </button>
            <button
              className={`nav-item ${currentPage === 'stats' ? 'active' : ''}`}
              onClick={() => setCurrentPage('stats')}
              title="Statistics"
            >
              <PieChart size={18} />
            </button>
            <button
              className={`nav-item ${currentPage === 'config' ? 'active' : ''}`}
              onClick={() => setCurrentPage('config')}
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </nav>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          {currentPage === 'timeline' && <Timeline />}
          {currentPage === 'accounts' && <Accounts />}
          {currentPage === 'stats' && <Statistics />}
          {currentPage === 'config' && <Config />}
        </div>
      </main>
    </div>
  );
}

export default App;
