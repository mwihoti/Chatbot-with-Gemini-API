import React, { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  }

  const handleFileupload = async (e) => {
    const file = e.target.files[0];
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
    if (msg.type === "image") {
      return (
        <div key={msg.id} className="flex justify-end">
          <img
            src={msg.imageUrl}
            alt={msg.text}
            className="max-w-[200px] max-h-[200px] object-contain border rounded"
          />
        </div>
      );
    }
    if (msg.sender === "bot") {
      return (
        <p
          key={msg.id}
          className="bg-gray-200 text-gray-800 rounded-lg p-2 max-w-sm self-start"
          dangerouslySetInnerHTML={{ __html: msg.text }}
        ></p>
      );
    } else {
      return (
        <p
          key={msg.id}
          className="bg-blue-500 text-white rounded-lg p-2 max-w-sm self-end"
        >
          {msg.text}
        </p>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-grow flex flex-col space-y-2 overflow-y-auto">
        {messages.map((msg) => renderMessage(msg))}
        {showQuickResponses && (
          <div className="flex space-x-2">
            <button
              onClick={() => quickResponse("Hello")}
              className="bg-blue-500 text-white py-1 px-3 rounded"
            >
              Hello
            </button>
            <button
              onClick={() => quickResponse("Give a quick tip for a developer")}
              className="bg-green-500 text-white py-1 px-3 rounded"
            >
              Quick Tip
            </button>
            <button
              onClick={() => quickResponse("Tell me a joke!")}
              className="bg-yellow-500 text-white py-1 px-3 rounded"
            >
              Tell a Joke
            </button>
          </div>
        )}

        {/* Image Preview */}
        {previewImage && (
          <div className="flex flex-col items-center space-y-2">
            <img
              src={previewImage.preview}
              alt="Preview"
              className="max-w-[200px] max-h-[200px] object-contain border rounded"
            />
            <div className="flex space-x-2">
              <button
                onClick={sendImageMessage}
                className="bg-blue-500 text-white py-1 px-3 rounded"
              >
                Send Image
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-red-500 text-white py-1 px-3 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-2 items-center mt-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow border rounded-lg p-2"
          placeholder="Type a message..."
        />
        <button
          onClick={() => sendMessage(input)}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Send
        </button>
        <input
          type="file"
          onChange={handleFileupload}
          className="file:rounded-lg file:border file:px-4 file:py-2"
        />
      </div>
    </div>
  );
}