import React, { useState } from "react";
import styles from "@/styles/Home.module.css";


export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(true);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  }

  const handleFileupload = async (e) => {
    const file = e.target.file[0];
    if (!file) return;


    const formData = FormData();
    formData.append('file', file);

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData,
    });

    const { reply, fileUrl } = await response.json();
    setMessages(messages => [...messages,
      { id: Date.now(), text: file.name, sender: 'user', type: 'file', fileUrl}
    ]);
    
    if (reply) {
      setMessages(messages => [...messages, { id: Date.now() + 1, text: reply, sender: 'bot' }]);
    }
    
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage(input);
      e.preventDefault();
    }
  };
  const quickResponse = (text) => {
    sendMessage(text);
    setShowQuickResponses(false);
  };
  const sendMessage = async (message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setShowQuickResponses(false);

    const newMessage = { id: Date.now(), text: trimmedMessage, sender: 'user'};
    setMessages(messages => [...messages, newMessage]);
    setInput('');


    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: trimmedMessage})
    });

    const {reply } = await response.json();
    setMessages(messages => [ ...messages,
      { id: Date.now + 1, text: reply, sender: 'bot'}
    ]);
  };
    


  const renderMessage = (msg) => {
    if (msg.type === 'file') {
      return (
        <p key={msg.id} className={styles.userMessage}>

          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
            {msg.text}
          </a>
        </p>
      );
    }
    if (msg.sender === 'bot') {
      return <p key={msg.id} className={styles.botMessage} dangerouslySetInnerHTML={{ __html: msg.text }}></p>;

    } else {
      return <p key={msg.id} className={styles.userMessage}>{msg.text}</p>;
    }
  };




  return (
    
      <div className={styles.container}>
        <div className={styles.chatArea}>
          {messages.map(msg => renderMessage(msg))}
          {showQuickResponses && (
            <div className={styles.quickResponses}>
              <button onClick={() => quickResponse('Hello')} >Hello</button>
              <button onClick={() => quickResponse('Give a quick tip for a developer')}>Quick Tip</button>
              <button onClick={() => quickResponse('Tell me a joke!')}>Tell a Joke</button>
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
                <input type="file" onchange={handleFileupload} className={styles.fileInput} />
          </div>
      </div>

  );
}
