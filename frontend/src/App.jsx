import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { Dashboard } from './pages/Dashboard';
import { AddTopic } from './pages/AddTopic';
import { MyTopics } from './pages/MyTopics';
import { TopicDetail } from './pages/TopicDetail';
import { StartQuiz } from './pages/StartQuiz';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';

function AppContent() {
  const { token, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout(navigate);
    }
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/signin" />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar - Only show when logged in */}
      <div className="sidebar">
        <h1>⚡ Remindly</h1>

        <p className="menu-title">MAIN</p>
        <a href="/dashboard">Dashboard</a>
        <a href="/topics">My Topics</a>
        <a href="/quiz">Start Quiz</a>

        <p className="menu-title">COMMUNITY</p>
        <a href="/leaderboard">Leaderboard</a>

        {/* Settings and Logout */}
        <div className="sidebar-footer">
          <a href="/settings" className="settings-link">⚙️ Settings</a>
          {/* Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-topic" element={<AddTopic />} />
          <Route path="/topics/:id/edit" element={<AddTopic />} />
          <Route path="/topics" element={<MyTopics />} />
          <Route path="/topics/:id" element={<TopicDetail />} />
          <Route path="/quiz" element={<StartQuiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
