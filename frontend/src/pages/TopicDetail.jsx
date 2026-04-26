import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { topicsAPI, aiAPI } from '../services/api';
import { Header } from '../components/Header';
import '../styles/TopicDetail.css';

export const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('evaluate'); // evaluate, quiz, result
  const [userExplanation, setUserExplanation] = useState('');
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  
  // Adaptive Quiz States
  const [questionPool, setQuestionPool] = useState(null); // {easy, medium, hard, other}
  const [quizQuestions, setQuizQuestions] = useState([]); // 5 selected questions for quiz
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]); // [{questionId, answer, isCorrect}, ...]
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioRef = React.useRef(null);
  const [markingRevision, setMarkingRevision] = useState(false);
  const [revisionMarked, setRevisionMarked] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await topicsAPI.getTopicById(id);
        if (data.success) {
          setTopic(data.topic);
        }
      } catch (error) {
        console.error('Error fetching topic:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  // Mark topic as revised when quiz is completed with score >= 3
  useEffect(() => {
    if (stage === 'result' && quizAnswers.length === 5 && !revisionMarked && !markingRevision) {
      const correctCount = quizAnswers.filter(a => a.isCorrect).length;
      const scorePercentage = (correctCount / 5) * 100;

      if (correctCount >= 3) {
        const markRevision = async () => {
          setMarkingRevision(true);
          try {
            const response = await topicsAPI.markTopicRevised(id);
            
            if (response.message || response.success) {
              console.log('✅ Topic marked as revised');
              setRevisionMarked(true);
              
              // Auto-navigate back to MyTopics after 2 seconds
              setTimeout(() => {
                navigate('/topics');
              }, 2000);
            } else {
              setRevisionMarked(true);
            }
          } catch (error) {
            console.error('Error submitting quiz:', error);
            setRevisionMarked(true);
          } finally {
            setMarkingRevision(false);
          }
        };

        markRevision();
      }
    }
  }, [stage, quizAnswers, revisionMarked, markingRevision, id, navigate]);

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Please allow microphone access to use voice recording');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Recording timer effect
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);



  // Clear recording
  const clearRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setUserExplanation('');
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      // Send recording duration and topic info for AI evaluation
      const result = await aiAPI.evaluateExplanation(
        topic.title,
        topic.explanation,
        recordingTime // Send actual recording duration
      );

      if (result.success) {
        setEvaluationResult(result);
        // Don't auto-transition to quiz, wait for user to click the button
      }
    } catch (error) {
      console.error('Error evaluating:', error);
      alert('Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const generateQuiz = async () => {
    setQuizLoading(true);
    try {
      const result = await aiAPI.generateQuiz(topic.title, topic.explanation);
      if (result.success && result.questionPool) {
        setQuestionPool(result.questionPool);
        
        // Start adaptive quiz: first 2 questions are easy
        const firstTwoQuestions = (result.questionPool.easy || []).slice(0, 2);
        setQuizQuestions(firstTwoQuestions);
        setCurrentQuestionIndex(0);
        setQuizAnswers([]);
        setSelectedAnswer(null);
      } else {
        console.error('No questions generated');
        alert('Failed to generate quiz. Please try again.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz. Please try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  // Adaptive question selection logic
  const selectNextQuestion = () => {
    const correctCount = quizAnswers.filter(a => a.isCorrect).length;
    const totalAnswered = quizAnswers.length;
    
    if (totalAnswered === 2) {
      // After first 2 questions, pick Q3 based on performance
      if (correctCount === 2) {
        // Both correct: show medium difficulty
        const nextQuestion = (questionPool.medium || [])[0];
        setQuizQuestions([...quizQuestions, nextQuestion]);
      } else {
        // 0-1 correct: show another easy or medium mix
        const nextQuestion = (questionPool.medium || [])[0] || (questionPool.easy || [])[2];
        setQuizQuestions([...quizQuestions, nextQuestion]);
      }
    } else if (totalAnswered === 3) {
      // After Q3, performance determines Q4
      const performanceSoFar = quizAnswers.filter(a => a.isCorrect).length / 3;
      if (performanceSoFar >= 0.67) {
        // 2+ correct: medium or hard
        const nextQuestion = (questionPool.hard || [])[0] || (questionPool.medium || [])[1];
        setQuizQuestions([...quizQuestions, nextQuestion]);
      } else {
        // < 67% correct: medium
        const nextQuestion = (questionPool.medium || [])[1] || (questionPool.medium || [])[2];
        setQuizQuestions([...quizQuestions, nextQuestion]);
      }
    } else if (totalAnswered === 4) {
      // Final question: mix based on overall performance
      const performanceSoFar = quizAnswers.filter(a => a.isCorrect).length / 4;
      if (performanceSoFar >= 0.75) {
        // 3+ correct: hard or other
        const nextQuestion = (questionPool.hard || [])[1] || (questionPool.other || [])[0];
        setQuizQuestions([...quizQuestions, nextQuestion]);
      } else {
        // < 75% correct: medium
        const nextQuestion = (questionPool.medium || [])[2] || (questionPool.other || [])[0];
        setQuizQuestions([...quizQuestions, nextQuestion]);
      }
    }
    
    setCurrentQuestionIndex(totalAnswered);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (option) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    // Record answer
    const newAnswer = {
      questionId: currentQuestion.question,
      answer: option,
      isCorrect: isCorrect,
      question: currentQuestion
    };
    
    setQuizAnswers([...quizAnswers, newAnswer]);
    setSelectedAnswer(option);
    
    // Show feedback briefly then move to next question
    setTimeout(() => {
      if (quizAnswers.length + 1 < 5) {
        selectNextQuestion();
      } else {
        // Quiz complete - go to results
        setStage('result');
      }
    }, 800);
  };

  const handleProceedToQuiz = async () => {
    setStage('quiz');
    if (!quizQuestions || quizQuestions.length === 0) {
      await generateQuiz();
    }
  };

  if (loading) return <div className="loader">Loading...</div>;
  if (!topic) return <div className="error">Topic not found</div>;

  return (
    <div className="topic-detail">
      <Header />
      <div className="topic-detail-container">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>

        <div className="topic-header">
          <h1>{topic.title}</h1>
          <p className="category">{topic.category}</p>
        </div>

        {stage === 'evaluate' && (
          <div className="stage-content">
            <div className="explanation-box">
              <h3>📚 Topic Reference</h3>
              <p>{topic.explanation}</p>
            </div>

            <div className="evaluation-box">
              <h3>🎤 Record Your Understanding</h3>
              
              <div className="voice-recording-section">
                {!isRecording ? (
                  <>
                    <p className="recording-hint">Click the microphone to record your understanding</p>
                    <button
                      className="btn-record"
                      onClick={startRecording}
                    >
                      🎙️ Start Recording
                    </button>
                  </>
                ) : (
                  <>
                    <p className="recording-timer">Recording: {formatTime(recordingTime)}</p>
                    <button
                      className="btn-stop"
                      onClick={stopRecording}
                    >
                      ⏹️ Stop Recording
                    </button>
                  </>
                )}

                {audioBlob && (
                  <div className="audio-saved">
                    <p className="recording-saved">✓ Recording saved ({formatTime(recordingTime)})</p>
                    <audio
                      ref={audioRef}
                      src={URL.createObjectURL(audioBlob)}
                      controls
                      className="audio-player"
                    />
                    <button
                      className="btn-primary"
                      onClick={handleEvaluate}
                      disabled={evaluating}
                    >
                      {evaluating ? 'Processing...' : '✓ Evaluate'}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={clearRecording}
                    >
                      🔄 Re-record
                    </button>
                  </div>
                )}
              </div>
            </div>

            {evaluationResult && (
              <div className={`evaluation-result ${evaluationResult.isUnlocked ? 'unlocked' : 'locked'}`}>
                <h3>🎯 Evaluation Result</h3>
                <div className="score-display">
                  <p className="score">{evaluationResult.score}/10</p>
                </div>
                <p className="feedback">{evaluationResult.feedback}</p>
                {evaluationResult.encouragement && (
                  <p className="encouragement">{evaluationResult.encouragement}</p>
                )}
                {evaluationResult.missingConcepts && evaluationResult.missingConcepts.length > 0 && (
                  <div className="missing">
                    <h4>📖 Areas to Review:</h4>
                    <ul>
                      {evaluationResult.missingConcepts.map((concept, i) => (
                        <li key={i}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="result-status">
                  {evaluationResult.isUnlocked ? (
                    <>
                      <p className="unlocked-text">✓ Quiz Unlocked!</p>
                      <button className="btn-primary" onClick={handleProceedToQuiz}>
                        Proceed to Quiz →
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="locked-text">✗ Try Again</p>
                      <button className="btn-secondary" onClick={() => {
                        setAudioBlob(null);
                        setRecordingTime(0);
                        setEvaluationResult(null);
                      }}>
                        🔄 Re-record
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {stage === 'quiz' && quizQuestions.length > 0 && quizAnswers.length < 5 && (
          <div className="stage-content">
            <div className="quiz-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${(quizAnswers.length / 5) * 100}%`}}></div>
              </div>
              <p className="progress-text">Question {quizAnswers.length + 1} of 5</p>
            </div>

            {quizLoading ? (
              <div className="loader">Generating quiz...</div>
            ) : currentQuestionIndex < quizQuestions.length ? (
              <div className="quiz-container">
                <div className="single-question">
                  <h3 className="quiz-question-text">
                    {quizQuestions[currentQuestionIndex]?.question}
                  </h3>
                  <div className="options">
                    {quizQuestions[currentQuestionIndex]?.options.map((option, oIndex) => {
                      const isCorrect = option === quizQuestions[currentQuestionIndex]?.correctAnswer;
                      const isSelected = option === selectedAnswer;
                      
                      return (
                        <button
                          key={oIndex}
                          className={`option-button ${
                            isSelected ? (isCorrect ? 'correct' : 'incorrect') : ''
                          } ${selectedAnswer ? 'disabled' : ''}`}
                          onClick={() => !selectedAnswer && handleAnswerSelect(option)}
                          disabled={selectedAnswer !== null}
                        >
                          {option}
                          {isSelected && selectedAnswer && (
                            <span className="feedback-icon">
                              {isCorrect ? '✓' : '✗'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="loader">Loading next question...</div>
            )}
          </div>
        )}

        {stage === 'result' && quizAnswers.length === 5 && (
          <div className="stage-content">
            <div className="result-box">
              <h3>🎉 Quiz Complete!</h3>
              {(() => {
                const correctCount = quizAnswers.filter(a => a.isCorrect).length;
                const scorePercentage = (correctCount / 5) * 100;
                const isRevisionComplete = correctCount >= 3;
                
                return (
                  <>
                    <p className="score">
                      {correctCount}/5 Correct ({Math.round(scorePercentage)}%)
                    </p>
                    <div className="result-details">
                      {isRevisionComplete && (
                        <>
                          <p className="revision-complete">✅ Revision Completed! Topic marked as revised.</p>
                          {revisionMarked && (
                            <p className="redirecting">🔄 Redirecting to My Topics in 2 seconds...</p>
                          )}
                        </>
                      )}
                      {scorePercentage === 100 && (
                        <p className="perfection">🌟 Perfect Score! Outstanding work!</p>
                      )}
                      {scorePercentage >= 80 && scorePercentage < 100 && (
                        <p className="excellent">⭐ Excellent performance!</p>
                      )}
                      {scorePercentage >= 60 && scorePercentage < 80 && (
                        <p className="good">👍 Good effort! Keep practicing!</p>
                      )}
                      {scorePercentage < 60 && (
                        <p className="needsWork">📚 Review the material and try again!</p>
                      )}
                    </div>
                  </>
                );
              })()}
              <button className="btn-primary" onClick={() => navigate('/topics')}>
                Back to My Topics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
