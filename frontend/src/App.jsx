"use client"

import { useState, useEffect, useRef } from "react"
import {
  CheckCircle,
  XCircle,
  Loader,
  HelpCircle,
  Sun,
  Moon,
  History,
  ChevronDown,
  ChevronUp,
  Trash2,
  Download,
  Mic,
  MicOff,
  BarChart2,
  MessageSquare,
  Send,
  X,
  BookOpen,
  Lightbulb,
  Smile,
  Frown,
  Meh,
} from "lucide-react"
import "./app.css"

function App() {
  // Core state
  const [input, setInput] = useState("")
  const [result, setResult] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState("light")
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)

  // Advanced features state
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("sentiment")
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState([
    { type: "bot", text: "Hello! I'm your AI assistant. How can I help you analyze reviews today?" },
  ])
  const [assistantInput, setAssistantInput] = useState("")
  const [voiceInputActive, setVoiceInputActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [learningModeActive, setLearningModeActive] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Refs
  const assistantEndRef = useRef(null)
  const visualizerRef = useRef(null)
  const recognitionRef = useRef(null)

  // Mock sentiment analysis data
  const sentimentData = {
    score: 0.75,
    text: [
      { text: "This product is ", sentiment: "neutral" },
      { text: "amazing", sentiment: "positive" },
      { text: "! ", sentiment: "neutral" },
      { text: "Highly recommend", sentiment: "positive" },
      { text: ".", sentiment: "neutral" },
    ],
  }

  // Mock language metrics
  const languageMetrics = {
    readability: 85,
    complexity: 62,
    specificity: 78,
    emotionality: 70,
  }

  // Mock comparison data
  const comparisonData = [
    { text: "Uses specific product details", match: true },
    { text: "Mentions personal experience", match: true },
    { text: "Contains excessive superlatives", match: false },
    { text: "Includes purchase verification", match: true },
  ]

  // Mock improvement suggestions
  const improvementSuggestions = [
    {
      title: "Add more specific details",
      text: "Mention specific features or aspects of the product that impressed you.",
    },
    {
      title: "Include usage duration",
      text: "Mention how long you've been using the product to add credibility.",
    },
  ]

  // Learning mode questions
  const questions = [
    {
      question: "Which of the following is most likely to be a fake review?",
      options: [
        "I've been using this product for 3 months and it's held up well despite daily use.",
        "This is the BEST PRODUCT EVER!!! Life changing!!! Must buy!!!",
        "The product arrived on time and works as described. Battery life is about 6 hours.",
        "Disappointed with the quality. The stitching came apart after two weeks.",
      ],
      correctAnswer: 1,
      explanation:
        "Excessive capitalization, multiple exclamation marks, and vague superlatives without specific details are common in fake reviews.",
    },
    {
      question: "Which feature is most indicative of a genuine review?",
      options: [
        "Mentions receiving the product for free",
        "Contains only positive comments",
        "Includes specific details about product usage",
        "Written by a verified 'top reviewer'",
      ],
      correctAnswer: 2,
      explanation:
        "Specific details about how the product was used indicate personal experience, which is more common in genuine reviews.",
    },
    {
      question: "What pattern might suggest a review was AI-generated?",
      options: [
        "Poor grammar and spelling mistakes",
        "Overly formal language with perfect structure",
        "Mentions of specific product features",
        "Complaints about shipping or customer service",
      ],
      correctAnswer: 1,
      explanation:
        "AI-generated reviews often have unnaturally perfect grammar and structure, lacking the natural variations in human writing.",
    },
  ]

  // Load theme and history from localStorage on initial render
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem("review-detector-theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    }

    // Load history
    const savedHistory = localStorage.getItem("review-detector-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Error parsing history:", e)
      }
    }
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("review-detector-theme", newTheme)
  }

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("review-detector-history", JSON.stringify(history))
  }, [history])

  // Scroll to bottom of assistant messages
  useEffect(() => {
    if (assistantEndRef.current && assistantOpen) {
      assistantEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [assistantMessages, assistantOpen])

  // Handle voice recognition
  useEffect(() => {
    if ((typeof window !== "undefined" && "SpeechRecognition" in window) || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("")

        setTranscript(transcript)

        // Animate visualizer
        if (visualizerRef.current) {
          const bars = visualizerRef.current.querySelectorAll(".visualizer-bar")
          bars.forEach((bar) => {
            const height = Math.random() * 80 + 10
            bar.style.height = `${height}px`
          })
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Handle confetti animation when result is genuine
  useEffect(() => {
    if (result === "genuine") {
      createConfetti()
    }
  }, [result])

  const handleSubmit = async () => {
    if (!input.trim()) return

    setLoading(true)
    setResult(null)
    setConfidence(null)
    setAnalysisOpen(false)

    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock response - in a real app, this would be from your API
      const mockResponses = {
        "This product is amazing! Highly recommend.": {
          prediction: "genuine",
          confidence: 0.92,
        },
        "Terrible quality. Waste of money.": {
          prediction: "genuine",
          confidence: 0.85,
        },
        "I received this item for free in exchange for a review.": {
          prediction: "fake",
          confidence: 0.78,
        },
      }

      // Use mock response if available, otherwise randomize
      const data = mockResponses[input] || {
        prediction: Math.random() > 0.5 ? "genuine" : "fake",
        confidence: Math.random() * 0.5 + 0.5,
      }

      setResult(data.prediction)
      setConfidence(data.confidence)
      setAnalysisOpen(true)

      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        review: input,
        prediction: data.prediction,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
      }

      setHistory((prevHistory) => [newHistoryItem, ...prevHistory.slice(0, 9)])
    } catch (error) {
      console.error("Error fetching prediction:", error)
      setResult("error")

      // Add error to history
      const newHistoryItem = {
        id: Date.now(),
        review: input,
        prediction: "error",
        timestamp: new Date().toISOString(),
      }

      setHistory((prevHistory) => [newHistoryItem, ...prevHistory.slice(0, 9)])
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("review-detector-history")
  }

  const loadFromHistory = (item) => {
    setInput(item.review)
    setResult(item.prediction)
    setConfidence(item.confidence || null)
    setAnalysisOpen(true)
  }

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `review-history-${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const toggleVoiceInput = () => {
    setVoiceInputActive(!voiceInputActive)
    setIsRecording(false)
    setTranscript("")
  }

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      setTranscript("")
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const submitVoiceInput = () => {
    if (transcript.trim()) {
      setInput(transcript)
      setVoiceInputActive(false)
    }
  }

  const sendAssistantMessage = () => {
    if (!assistantInput.trim()) return

    // Add user message
    setAssistantMessages((prev) => [...prev, { type: "user", text: assistantInput }])

    // Simulate bot response
    setTimeout(() => {
      let response
      const input = assistantInput.toLowerCase()

      if (input.includes("hello") || input.includes("hi")) {
        response = "Hello! How can I help you with review analysis today?"
      } else if (input.includes("fake") || input.includes("genuine")) {
        response =
          "Fake reviews often contain excessive superlatives, lack specific details, and may have unusual patterns of language. Would you like me to analyze a specific review for you?"
      } else if (input.includes("help")) {
        response =
          "I can help you understand review authenticity, explain our detection methods, or provide tips for spotting fake reviews. What would you like to know more about?"
      } else {
        response =
          "That's an interesting question about reviews. Our system uses natural language processing and machine learning to identify patterns common in fake or genuine reviews. Is there something specific you'd like to know?"
      }

      setAssistantMessages((prev) => [...prev, { type: "bot", text: response }])
    }, 1000)

    setAssistantInput("")
  }

  const startLearningMode = () => {
    setLearningModeActive(true)
    setCurrentQuestion(0)
    setSelectedOption(null)
    setShowAnswer(false)
    setScore(0)
    setShowResults(false)
  }

  const handleOptionSelect = (index) => {
    if (!showAnswer) {
      setSelectedOption(index)
    }
  }

  const checkAnswer = () => {
    setShowAnswer(true)
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore((prev) => prev + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedOption(null)
      setShowAnswer(false)
    } else {
      setShowResults(true)
    }
  }

  const createConfetti = () => {
    const confettiContainer = document.createElement("div")
    confettiContainer.className = "confetti-container"
    document.body.appendChild(confettiContainer)

    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"]

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div")
      confetti.className = "confetti"
      confetti.style.left = `${Math.random() * 100}vw`
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.opacity = "1"
      confetti.style.animation = `confetti ${Math.random() * 3 + 2}s linear forwards`
      confetti.style.animationDelay = `${Math.random() * 2}s`

      confettiContainer.appendChild(confetti)
    }

    setTimeout(() => {
      confettiContainer.remove()
    }, 5000)
  }

  const examples = [
    "This product is amazing! Highly recommend.",
    "Terrible quality. Waste of money.",
    "I received this item for free in exchange for a review.",
  ]

  const getResultClass = () => {
    switch (result) {
      case "genuine":
        return "result-genuine"
      case "fake":
        return "result-fake"
      case "error":
        return "result-error"
      default:
        return ""
    }
  }

  const getResultIcon = () => {
    switch (result) {
      case "genuine":
        return <CheckCircle className="result-icon" />
      case "fake":
        return <XCircle className="result-icon" />
      case "error":
        return <HelpCircle className="result-icon" />
      default:
        return null
    }
  }

  const getSentimentClass = () => {
    const score = sentimentData.score
    if (score > 0.6) return "sentiment-positive"
    if (score < 0.4) return "sentiment-negative"
    return "sentiment-neutral"
  }

  const getSentimentIcon = () => {
    const score = sentimentData.score
    if (score > 0.6) return <Smile size={16} />
    if (score < 0.4) return <Frown size={16} />
    return <Meh size={16} />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="min-h-screen">
      <div className="container">
        <div className="header">
          <div className="icon-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h1 className="title">Fake Review Detector</h1>
          <div className="controls">
            <button onClick={startLearningMode} className="control-button" aria-label="Learning mode">
              <BookOpen size={20} />
            </button>
            <button
              onClick={() => setAssistantOpen(!assistantOpen)}
              className="control-button"
              aria-label="AI Assistant"
            >
              <MessageSquare size={20} />
            </button>
            <button onClick={toggleTheme} className="control-button" aria-label="Toggle theme">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        <p className="description">Enter a product review below to check its authenticity.</p>

        <div className="examples">
          {examples.map((ex, idx) => (
            <button key={idx} onClick={() => setInput(ex)} className="example-button">
              {ex}
            </button>
          ))}
        </div>

        <div className="textarea-container">
          <textarea
            className="textarea"
            placeholder="Paste or type your review here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="input-controls">
            <button onClick={toggleVoiceInput} className="input-control" aria-label="Voice input">
              <Mic size={18} />
            </button>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !input.trim()} className="submit-button">
          {loading ? (
            <>
              <Loader className="animate-spin" /> Analyzing...
            </>
          ) : (
            "Detect Review Authenticity"
          )}
        </button>

        {result && (
          <div className={`result ${getResultClass()}`}>
            {getResultIcon()} Prediction: {result.toUpperCase()}
            {confidence !== null && result !== "error" && (
              <p className="confidence">Confidence: {(confidence * 100).toFixed(2)}%</p>
            )}
            {result === "error" && <p className="error-message">Unable to fetch result. Please try again.</p>}
          </div>
        )}

        {result && result !== "error" && (
          <div className="analysis-section">
            <div className="analysis-header" onClick={() => setAnalysisOpen(!analysisOpen)}>
              <h2 className="analysis-title">
                <BarChart2 size={18} /> Detailed Analysis
              </h2>
              <button aria-label={analysisOpen ? "Close analysis" : "Open analysis"}>
                {analysisOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div className={`analysis-content ${analysisOpen ? "open" : ""}`}>
              <div className="analysis-tabs">
                <div
                  className={`analysis-tab ${activeTab === "sentiment" ? "active" : ""}`}
                  onClick={() => setActiveTab("sentiment")}
                >
                  Sentiment
                </div>
                <div
                  className={`analysis-tab ${activeTab === "language" ? "active" : ""}`}
                  onClick={() => setActiveTab("language")}
                >
                  Language
                </div>
                <div
                  className={`analysis-tab ${activeTab === "comparison" ? "active" : ""}`}
                  onClick={() => setActiveTab("comparison")}
                >
                  Patterns
                </div>
                <div
                  className={`analysis-tab ${activeTab === "improvement" ? "active" : ""}`}
                  onClick={() => setActiveTab("improvement")}
                >
                  Suggestions
                </div>
              </div>

              <div className={`tab-content ${activeTab === "sentiment" ? "active" : ""}`}>
                <div className="sentiment-analysis">
                  <div className="sentiment-header">
                    <div className="sentiment-title">Emotional Tone Analysis</div>
                    <div className={`sentiment-score ${getSentimentClass()}`}>
                      {getSentimentIcon()} {(sentimentData.score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="sentiment-text">
                    {sentimentData.text.map((segment, index) => (
                      <span key={index} className={segment.sentiment}>
                        {segment.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="chart-container">
                  <div className="bar-chart">
                    <div className="bar" style={{ height: "60%", backgroundColor: "var(--chart-color-1)" }}>
                      <div className="bar-label">Positive</div>
                      <div className="bar-value">60%</div>
                    </div>
                    <div className="bar" style={{ height: "25%", backgroundColor: "var(--chart-color-3)" }}>
                      <div className="bar-label">Negative</div>
                      <div className="bar-value">25%</div>
                    </div>
                    <div className="bar" style={{ height: "15%", backgroundColor: "var(--chart-color-5)" }}>
                      <div className="bar-label">Neutral</div>
                      <div className="bar-value">15%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`tab-content ${activeTab === "language" ? "active" : ""}`}>
                <div className="language-analysis">
                  <div className="metrics">
                    <div className="metric">
                      <div className="metric-value">{languageMetrics.readability}%</div>
                      <div className="metric-label">Readability</div>
                    </div>
                    <div className="metric">
                      <div className="metric-value">{languageMetrics.complexity}%</div>
                      <div className="metric-label">Complexity</div>
                    </div>
                    <div className="metric">
                      <div className="metric-value">{languageMetrics.specificity}%</div>
                      <div className="metric-label">Specificity</div>
                    </div>
                    <div className="metric">
                      <div className="metric-value">{languageMetrics.emotionality}%</div>
                      <div className="metric-label">Emotionality</div>
                    </div>
                  </div>
                </div>
                <div className="chart-container">
                  <div className="bar-chart">
                    <div
                      className="bar"
                      style={{ height: `${languageMetrics.readability}%`, backgroundColor: "var(--chart-color-1)" }}
                    >
                      <div className="bar-label">Readability</div>
                      <div className="bar-value">{languageMetrics.readability}%</div>
                    </div>
                    <div
                      className="bar"
                      style={{ height: `${languageMetrics.complexity}%`, backgroundColor: "var(--chart-color-2)" }}
                    >
                      <div className="bar-label">Complexity</div>
                      <div className="bar-value">{languageMetrics.complexity}%</div>
                    </div>
                    <div
                      className="bar"
                      style={{ height: `${languageMetrics.specificity}%`, backgroundColor: "var(--chart-color-3)" }}
                    >
                      <div className="bar-label">Specificity</div>
                      <div className="bar-value">{languageMetrics.specificity}%</div>
                    </div>
                    <div
                      className="bar"
                      style={{ height: `${languageMetrics.emotionality}%`, backgroundColor: "var(--chart-color-4)" }}
                    >
                      <div className="bar-label">Emotionality</div>
                      <div className="bar-value">{languageMetrics.emotionality}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`tab-content ${activeTab === "comparison" ? "active" : ""}`}>
                <div className="comparison">
                  <h3 className="sentiment-title">Pattern Matching</h3>
                  {comparisonData.map((item, index) => (
                    <div key={index} className="comparison-item">
                      <div className="comparison-icon">
                        {item.match ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </div>
                      <div className="comparison-text">{item.text}</div>
                    </div>
                  ))}
                </div>
                <div className="chart-container">
                  <div className="bar-chart">
                    <div className="bar" style={{ height: "85%", backgroundColor: "var(--chart-color-2)" }}>
                      <div className="bar-label">Genuine Patterns</div>
                      <div className="bar-value">85%</div>
                    </div>
                    <div className="bar" style={{ height: "15%", backgroundColor: "var(--chart-color-3)" }}>
                      <div className="bar-label">Suspicious Patterns</div>
                      <div className="bar-value">15%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`tab-content ${activeTab === "improvement" ? "active" : ""}`}>
                <div className="improvement-suggestions">
                  <h3 className="sentiment-title">
                    <Lightbulb size={18} style={{ marginRight: "0.5rem" }} />
                    How to Improve This Review
                  </h3>
                  {improvementSuggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion">
                      <div className="suggestion-title">{suggestion.title}</div>
                      <div className="suggestion-text">{suggestion.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="history-section">
          <div className="history-header" onClick={() => setHistoryOpen(!historyOpen)}>
            <h2 className="history-title">
              <History size={18} /> Review History
            </h2>
            <button aria-label={historyOpen ? "Close history" : "Open history"}>
              {historyOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          <div className={`history-content ${historyOpen ? "open" : ""}`}>
            {history.length === 0 ? (
              <div className="history-empty">No review history yet</div>
            ) : (
              <>
                <div className="history-controls">
                  <button onClick={exportHistory} className="history-export">
                    <Download size={14} style={{ marginRight: "4px" }} /> Export
                  </button>
                  <button onClick={clearHistory} className="history-clear">
                    <Trash2 size={14} style={{ marginRight: "4px" }} /> Clear
                  </button>
                </div>
                {history.map((item) => (
                  <div key={item.id} className="history-item" onClick={() => loadFromHistory(item)}>
                    <div className="history-item-text" title={item.review}>
                      {item.review.length > 50 ? `${item.review.substring(0, 50)}...` : item.review}
                    </div>
                    <div className={`history-item-result history-item-${item.prediction}`}>
                      {item.prediction === "genuine" && <CheckCircle size={14} style={{ marginRight: "4px" }} />}
                      {item.prediction === "fake" && <XCircle size={14} style={{ marginRight: "4px" }} />}
                      {item.prediction === "error" && <HelpCircle size={14} style={{ marginRight: "4px" }} />}
                      {item.prediction.toUpperCase()}
                      {item.confidence && ` (${(item.confidence * 100).toFixed(0)}%)`}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <footer className="footer">Built with ❤️ using React + Flask | © 2025</footer>
      </div>

      {/* Voice Input Modal */}
      {voiceInputActive && (
        <div className="voice-input-container">
          <div className="voice-input-modal">
            <h2 className="voice-input-title">Voice Input</h2>
            <p className="voice-input-subtitle">Speak your review clearly</p>

            <div className="voice-visualizer" ref={visualizerRef}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="visualizer-bar"
                  style={{ height: isRecording ? `${Math.random() * 80 + 10}px` : "10px" }}
                ></div>
              ))}
            </div>

            {transcript && <div className="voice-transcript">{transcript}</div>}

            <div className="voice-input-controls">
              <button
                onClick={toggleRecording}
                className={`voice-input-button voice-record-button ${isRecording ? "recording" : ""}`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={18} /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic size={18} /> Start Recording
                  </>
                )}
              </button>

              <button onClick={toggleVoiceInput} className="voice-input-button voice-cancel-button">
                Cancel
              </button>

              {transcript && (
                <button onClick={submitVoiceInput} className="voice-input-button voice-record-button">
                  <CheckCircle size={18} /> Use Text
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <div className={`ai-assistant ${assistantOpen ? "active" : ""}`} onClick={() => setAssistantOpen(!assistantOpen)}>
        <MessageSquare size={24} />
      </div>

      <div className={`assistant-container ${assistantOpen ? "active" : ""}`}>
        <div className="assistant-header">
          <span>Review Assistant</span>
          <button className="assistant-close" onClick={() => setAssistantOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="assistant-messages">
          {assistantMessages.map((message, index) => (
            <div key={index} className={`message message-${message.type}`}>
              {message.text}
            </div>
          ))}
          <div ref={assistantEndRef} />
        </div>

        <div className="assistant-input">
          <input
            type="text"
            placeholder="Ask about review analysis..."
            value={assistantInput}
            onChange={(e) => setAssistantInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendAssistantMessage()}
          />
          <button onClick={sendAssistantMessage}>
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Learning Mode */}
      {learningModeActive && (
        <div className="learning-mode active">
          <div className="learning-header">
            <div className="learning-title">
              <BookOpen size={20} style={{ marginRight: "0.5rem" }} />
              Learn to Spot Fake Reviews
            </div>
            <button className="learning-close" onClick={() => setLearningModeActive(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="learning-content">
            {!showResults ? (
              <>
                <div className="learning-progress">
                  <span>
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${((currentQuestion + (showAnswer ? 1 : 0)) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <span>{Math.round(((currentQuestion + (showAnswer ? 1 : 0)) / questions.length) * 100)}%</span>
                </div>

                <div className="learning-question">
                  <h3 className="question-text">{questions[currentQuestion].question}</h3>

                  <div className="question-options">
                    {questions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className={`question-option ${selectedOption === index ? "selected" : ""} ${
                          showAnswer
                            ? index === questions[currentQuestion].correctAnswer
                              ? "correct"
                              : selectedOption === index
                                ? "incorrect"
                                : ""
                            : ""
                        }`}
                        onClick={() => handleOptionSelect(index)}
                      >
                        <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                        {option}
                      </div>
                    ))}
                  </div>

                  {showAnswer && (
                    <div className="suggestion" style={{ marginTop: "1.5rem" }}>
                      <div className="suggestion-title">Explanation</div>
                      <div className="suggestion-text">{questions[currentQuestion].explanation}</div>
                    </div>
                  )}
                </div>

                <div className="learning-actions">
                  <button
                    className="learning-button learning-skip"
                    onClick={showAnswer ? nextQuestion : () => setLearningModeActive(false)}
                  >
                    {showAnswer ? "Next Question" : "Exit Quiz"}
                  </button>

                  {!showAnswer && (
                    <button
                      className="learning-button learning-next"
                      onClick={checkAnswer}
                      disabled={selectedOption === null}
                    >
                      Check Answer
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="learning-results">
                <h2 className="results-title">Quiz Complete!</h2>
                <div className="results-score">
                  {score}/{questions.length}
                </div>
                <p className="results-message">
                  {score === questions.length
                    ? "Perfect score! You're an expert at spotting fake reviews."
                    : score >= questions.length / 2
                      ? "Good job! You're getting better at identifying fake reviews."
                      : "Keep practicing! Spotting fake reviews takes time to master."}
                </p>
                <button className="learning-button learning-next" onClick={() => setLearningModeActive(false)}>
                  Return to Detector
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
