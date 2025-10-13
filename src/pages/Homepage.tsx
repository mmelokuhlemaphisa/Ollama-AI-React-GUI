import React, { useState } from "react";
import { queryOllama } from "../lib/ollama";
import logo from "/src/assets/ai-model.jpg";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface ChatMessage {
  text: string;
  sender: "user" | "ai";
}

export default function Homepage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userMessage: ChatMessage = { text: prompt, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    const reply = await queryOllama(prompt);
    const aiMessage: ChatMessage = { text: reply, sender: "ai" };
    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  return (
    <div className="main-grid">
      {/* Sidebar */}
      <aside className="sidebar">
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
          <h3 style={{ margin: 0 }}>MelChat</h3>
        </div>

        <div className="sidebar-section">
          <h4>Model</h4>
          <select>
            <option>Gemma-2B</option>
            <option>Phi-2</option>
            <option>Mistral-7B (Q4)</option>
          </select>
        </div>

        <div className="sidebar-section history">
          <h4>Recent Chats</h4>
          <div className="recent-item">
            <div className="recent-text">How are you today?</div>
          </div>
          <div className="recent-item">
            <div className="recent-text">Explain quantum computing</div>
          </div>
        </div>

        <div className="sidebar-section">
          <button className="btn primary">New Chat</button>
          <button className="btn ghost">Clear</button>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="chat-area">

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
              {msg.sender === "user" ? <p>{msg.text}</p> : <MarkdownPreview source={msg.text} />}
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
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            className="btn primary"
            onClick={handleSend}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
