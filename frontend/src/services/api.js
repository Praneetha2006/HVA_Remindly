const API_URL = 'http://localhost:3000/api';

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Auth API
export const authAPI = {
  signup: async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  signin: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.json();
  },
};

// Topics API
export const topicsAPI = {
  getAllTopics: async () => {
    const response = await fetch(`${API_URL}/topics`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.json();
  },

  createTopic: async (title, explanation, nextRevisionDate = null) => {
    const response = await fetch(`${API_URL}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title, explanation, nextRevisionDate }),
    });
    return response.json();
  },

  getTopicById: async (id) => {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.json();
  },

  updateTopic: async (id, title, explanation, category, nextRevisionDate) => {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title, explanation, category, nextRevisionDate }),
    });
    return response.json();
  },

  deleteTopic: async (id) => {
    const response = await fetch(`${API_URL}/topics/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.json();
  },

  markTopicRevised: async (id) => {
    const response = await fetch(`${API_URL}/topics/${id}/mark-revised`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.json();
  },
};

// AI API
export const aiAPI = {
  generateQuiz: async (topic, explanation) => {
    const response = await fetch(`${API_URL}/ai/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ topic, explanation }),
    });
    return response.json();
  },

  evaluateExplanation: async (topic, originalExplanation, recordingDuration) => {
    const response = await fetch(`${API_URL}/ai/evaluate-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ topic, originalExplanation, recordingDuration }),
    });
    return response.json();
  },

  generateAdaptiveQuiz: async (topic, explanation) => {
    const response = await fetch(`${API_URL}/ai/generate-adaptive-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ topic, explanation }),
    });
    return response.json();
  },
};

// Quiz API
export const quizAPI = {
  submitQuizResult: async (topicId, score, totalQuestions, difficulty) => {
    const response = await fetch(`${API_URL}/quiz-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ topicId, score, totalQuestions, difficulty }),
    });
    return response.json();
  },

  getQuizResults: async (topicId) => {
    const response = await fetch(`${API_URL}/quiz-results/${topicId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.json();
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: async () => {
    const response = await fetch(`${API_URL}/leaderboard`);
    return response.json();
  },
};
