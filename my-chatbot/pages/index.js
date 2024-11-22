import React, { useState } from "react";
import styles from "@/styles/Home.module.css";


export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const handleInputChange = (e) => {
    setInput(e.target.value);
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(input);
      e.preventDefault();
    }
  };
  const quickResponse = (text) => {
    sendMessage(text);
    setShowQuickResponses(false);
  }
  return (
    
      <div className={styles.container}>
        <div className={styles.chatArea}>
          {messages.map(msg => renderMessage(msg))}
          {showQuickResponses && (
            <div className={styles.quickResponses}>
              <button onClick={() => quickResponses('Hello')} >Hello</button>
              <button onClick={() => quickResponses('Give a quick tip for a developer')}>Quick Tip</button>
              <button onClick={() => quickResponses('Tell me a joke!')}>Tell a Joke</button>
            </div>
          )}


        </div>

          <div className={styles.controls}>
          <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={styles.input}
                />
                <button onClick={() => sendMessage(input)} className={styles.sendButton}>Send</button>
          </div>
      </div>

  );
}
