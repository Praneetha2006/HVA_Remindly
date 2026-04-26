import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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

function App() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <BrowserRouter future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      {token ? (
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

            <p className="menu-title">ACCOUNT</p>
            <a href="#" onClick={() => localStorage.removeItem('token')}>Logout</a>
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
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
