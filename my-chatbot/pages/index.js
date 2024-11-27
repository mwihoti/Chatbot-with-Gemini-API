import React, { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  }

  const handleFileUpload = async (e) => {
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

      setMessages(messages => [
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
    if (!input.trim() && !previewImage) return;

    const formData = new FormData();
    if (previewImage) {
      formData.append("file", previewImage.file);
    }
    formData.append("message", input.trim());

    try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData,
    });

    const {reply } = await response.json();
    setMessages((messages) => [ ...messages,
      ...(previewImage 
        ? [
          {
            id: Date.now(),
            text: input.trim(),
            sender: "user",
            type: "image",
            imageUrl: previewImage.preview,
          }
        ] : [
          {
            id: Date.now(),
            text: input.trim(),
            sender: "user",
          },
        ]),
      { id: Date.now + 1, text: reply, sender: 'bot'}
    ]);;
    setInput('');
    setPreviewImage(null);
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
        <div key={msg.id} className="flex justify-end space-y-2">
        <div className="flex flex-col">  
          {msg.text && (
            <p className="bg-blue-500 text-white rounded-lg p-2 max-w-sm self-end">
              {msg.text}
            </p>
          )}
          <img
            src={msg.imageUrl}
            alt={msg.text}
            className="max-w-[200px] max-h-[200px] object-contain border rounded"
          />

</div>
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

       
      </div>

      <div className="flex space-x-6 items-center mt-4">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow border rounded-lg p-2"
          placeholder="Type a message..."
        />
        {previewImage && (
          <div className="relative">
            <img
              src={previewImage.preview}
              alt="Preview"
              className="max-w-[50px] max-h-[50px] object-cover rounded-full"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
            >
              ×
            </button>
          </div>
        )}
        <label className="bg-gray-200 text-gray-800 py-2 px-4 rounded cursor-pointer">
          Upload
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}