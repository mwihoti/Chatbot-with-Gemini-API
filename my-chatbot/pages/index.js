import React, { useState } from "react";
import styles from "@/styles/Home.module.css";


export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  }

  const handleFileupload = async (e) => {
    const file = e.target.file[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage({
        file: file,
        preview: reader.result
      });
    };
    reader.readAsDataURL(file);
    
   
    
  };
  
 
  const sendImageMessage = async () => {
    if (!previewImage) return;

    const formData = new FormData();
    formData.append('file', previewImage.file);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData
      });

      const { reply } = await response.json();

      sendMessage(messages => [
        ...messages,
        {
          id: Date.now(),
          text: previewImage.file.name,
          sender: 'user',
          type: 'image',
          imageUrl: previewImage.preview
        },
        { id: Date.now() + 1, text: reply, sender: 'bot' }
      ]);

      setPreviewImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }


  const sendMessage = async (message) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setShowQuickResponses(false);

    const newMessage = { id: Date.now(), text: trimmedMessage, sender: 'user'};
    setMessages(messages => [...messages, newMessage]);
    setInput('');

    try {
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
  } catch (error) {
    console.error("Error sending message:", error);
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


  const renderMessage = (msg) => {
    if (msg.type === 'image') {
      return (
        <div key={msg.id} className={styles.userMessage}>

          <img 
          src={msg.imageUrl}
          alt={msg.text}
          className={styles.uploadedImage}
          style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain'          }}
          />
            </div>
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

          {/*Image preview */}
          {previewImage && (
            <div className={styles.imagePreview}>
              <img src={previewImage.preview}
              alt="Preview"
              style={{maxWidth: '200px', maxHeight: '200px', objectFit: 'contain'}}
              />

              <button onClick={sendImageMessage}>send Image</button>
              <button onClick={() => setPreviewImage(null)}>Cancel</button>
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
