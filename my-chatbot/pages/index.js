import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Example theme


export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);


  useEffect (() => {
    // Attach copyToClipboard to the window object
window.copyToClipboard = function (id) {
  const element = document.getElementById(id);
  if (element) {
    const text = element.innerText; // Get the content of the code block
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard!"); // Optional success feedback
      })
      .catch((err) => {
        alert("Failed to copy: " + err); // Optional error feedback
      });
  }
};  
  })
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
        <div key={msg.id} className="bg-gray-200 text-gray-800 rounded-lg p-4 max-w-md self-start">
        {msg.text.startsWith("```") ? (
          <pre>
            <code
              className="language-javascript"
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(
                  msg.text.replace(/```/g, ""),
                  Prism.languages.javascript,
                  "javascript"
                ),
              }}
            ></code>
          </pre>
        ) : (
          <p dangerouslySetInnerHTML={{ __html: formatBotResponse(msg.text) }}></p>
        )}
      </div>
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

  
  const formatBotResponse = (text) => {
    const parts = text.split(/```/);

    // process each part based on wether its a  code block or normal text
    return parts
      .map((part, index) => {
        if (index % 2 === 1) {
          // Code block
          const uniqueId = `code-block-${index}`;
          return `
          <div style="position: relative">
         <pre id="${uniqueId}" style="background-color: black; color: limegreen; padding: 10px; border-radius: 5px; white-space: pre-wrap; overflow-x: auto;">${part}</pre>
         <button onclick="copyToClipboard('${uniqueId}')" style="position: absolute; top: 5px; right: 5px; background-color: limegreen; color: black; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px;">Copy</button>        
         
           </div>
           `;
       
      
    } else {
            // Basic Markdown parsing (you can use a library like `marked` for more complex cases)
    return part
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italics
    .replace(/`([^`]+)`/g, "<code>$1</code>") // Inline code
    .replace(/<input(.*?)>/g, '<input$1 style="padding: 5px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; width: 100%; margin-top: 5px;" />') // Input field styling

    .replace(/\n/g, "<br/>"); // Newlines
        }
      })
      .join("");

    
  };
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);  
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav'});
        setAudioBlob(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing the micrphone", err);
    }
  }  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const handleSendAudio = async () => {

    if (!audioBlob) return;

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      const { text } = data;
      setMessages([...messages, { text, sender: "bot"}]);
      setAudioBlob(null)
    } catch (error) {
      console.error("Error sending audio message:", error);
    }
  }

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

      <div className="flex space-x-6 p-10 justify-content-center items-center mt-4">
      <div>
        <button onClick={isRecording ? handleStopRecording : handleStartRecording} className={`p-6 rounded-full ${
            isRecording ? "bg-red-500 text-black" : "bg-gray-200 text-gray-800"
          }`}
          title={isRecording ? "Stop Recording" : "Start Recording"}
          >
          <FontAwesomeIcon icon="fa-solid fa-microphone" />
          </button>
        {audioBlob && (
          <button onClick={handleSendAudio}>Send Audio</button>
        )}
      </div>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow border rounded-lg  p-20 scroll-m-2"
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

