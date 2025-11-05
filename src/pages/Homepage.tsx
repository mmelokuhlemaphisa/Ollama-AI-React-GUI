import React, { useState, useRef, useEffect } from "react";
import { queryOllama } from "../lib/ollama";
import logo from "/src/assets/ai-model.jpg";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { FaCamera, FaUpload, FaPaperPlane, FaTrash } from "react-icons/fa";

interface ChatMessage {
  text: string;
  sender: "user" | "ai";
  duration?: number;
  tokensPerSec?: number;
}

export default function Homepage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [history, setHistory] = useState<string[][]>([]); // Array of message arrays
  const [currentChatIndex, setCurrentChatIndex] = useState<number>(0);
  const [requestStart, setRequestStart] = useState<number | null>(null);

  // Load messages and history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    const savedHistory = localStorage.getItem("chatHistory");

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error("Error loading messages from localStorage:", error);
      }
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (error) {
        console.error("Error loading history from localStorage:", error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(history));
    }
  }, [history]);

  // Save current chat to history and start a new chat
  const handleNewChat = () => {
    if (messages.length > 0) {
      setHistory((prev) => [...prev, messages.map((m) => m.text)]);
    }
    setMessages([]);
    setPrompt("");
    setCurrentChatIndex(history.length);
    localStorage.removeItem("chatMessages"); // Clear current messages from localStorage
  };

  // Restore a chat from history
  const handleSelectHistory = (idx: number) => {
    setMessages(
      history[idx].map((text, i) => ({
        text,
        sender: i % 2 === 0 ? "user" : "ai",
      }))
    );
    setCurrentChatIndex(idx);
  };

  // Delete a chat from history
  const handleDeleteHistory = (idx: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering handleSelectHistory
    const newHistory = history.filter((_, i) => i !== idx);
    setHistory(newHistory);

    // If we deleted the current chat, clear messages
    if (idx === currentChatIndex) {
      setMessages([]);
      setCurrentChatIndex(-1);
    } else if (idx < currentChatIndex) {
      // Adjust current index if we deleted a chat before it
      setCurrentChatIndex(currentChatIndex - 1);
    }

    // Update localStorage
    if (newHistory.length === 0) {
      localStorage.removeItem("chatHistory");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Here you can handle the file upload logic
    }
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Here you can handle the camera stream
      // For example, you could open a modal with the camera view
      console.log("Camera accessed:", stream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userMessage: ChatMessage = { text: prompt, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    const start = Date.now();
    setRequestStart(start);

    const result = await queryOllama(prompt);
    const aiMessage: ChatMessage = {
      text: result.text,
      sender: "ai",
      duration: result.duration,
      tokensPerSec: result.tokensPerSec,
    };
    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
    setRequestStart(null);
  };

  return (
    <div className="main-grid">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-section history">
          <h4>History</h4>
          {history.length === 0 && (
            <div className="recent-text">No previous chats</div>
          )}
          {history.map((chat, idx) => (
            <div
              key={idx}
              className={`recent-item${
                currentChatIndex === idx ? " active" : ""
              }`}
              onClick={() => handleSelectHistory(idx)}
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem",
              }}
            >
              <div className="recent-text">
                {chat[0]?.slice(0, 30) || "Chat"} {chat.length > 1 ? "..." : ""}
              </div>
              <button
                onClick={(e) => handleDeleteHistory(idx, e)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  padding: "0.25rem",
                  fontSize: "0.9rem",
                }}
                title="Delete chat"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <div className="sidebar-section">
          <button className="btn primary" onClick={handleNewChat}>
            New Chat
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="chat-area">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <img
            src={logo}
            alt="MiraChat"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <h3 style={{ margin: 0, color: "black" }}>MelChat</h3>
        </div>
        <div className="messages">
          {messages.length === 0 && !prompt && !loading && (
            <div className="welcome-message">
              <h2>Welcome to MelChat AI!</h2>
              <p>Ask me anything or start a new conversation.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${
                msg.sender === "user" ? "user" : "assistant"
              }`}
            >
              {msg.sender === "user" ? (
                <p>{msg.text}</p>
              ) : (
                <>
                  <MarkdownPreview className="markdown" source={msg.text} />
                  {msg.duration && msg.tokensPerSec && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.85rem",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      Response time: {msg.duration}s | Tokens/sec:{" "}
                      {msg.tokensPerSec}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <img
                src="/src/assets/Loading_icon.gif"
                alt="loading..."
                style={{ width: "28px", height: "28px" }}
              />
            </div>
          )}
        </div>

        <div className="input-area">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
            accept="image/*,.pdf,.doc,.docx"
          />
          <div className="input-container">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={"Type your message..."}
            />
            <button
              className="btn icon-btn"
              onClick={handleCamera}
              title="Take a photo"
            >
              <FaCamera />
            </button>
            <button
              className="btn icon-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload file"
            >
              <FaUpload />
            </button>
          </div>
          <button
            className="btn primary send-btn"
            onClick={handleSend}
            disabled={loading}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}
