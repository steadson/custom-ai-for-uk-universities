"use client";

import Image from "next/image";
import { useState,useRef, useEffect } from "react";
import preview1 from "./assets/Preview1.png";
import Bubble from "../component/Bubble";
import { Printer } from "lucide-react";

import LoadingBubble from "../component/LoadingBubble";
import PromtSuggestionRow from "../component/PromptSuggestionRow";
import { Send, MessageSquare, BotIcon, SendIcon } from 'lucide-react';
const Home = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const chatRef = useRef<HTMLDivElement>(null);

 const handlePrint = () => {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(`
      <html>
      <head>
        <title>Chat Transcript - UNIBot UK</title>
        <style>
          /* Base styles */
          * {
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            box-sizing: border-box;
          }
          
          body { 
          
            max-width: 100%;
          
            color: #333;
          }
          
          /* Header */
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2563eb;
          }
          
          .profile-container {
            background-color: white;
            padding: 0.5rem;
            border-radius: 9999px;
            border: 2px solid #2563eb;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
          }
          
          .profile-text {
            display: flex;
            height: 2rem;
            width: 2rem;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #2563eb;
          }
          
          .title {
            margin: 0;
            font-size: 1rem;
            font-weight: 700;
            color: #2563eb;
          }
          
          .subtitle {
            margin: 0;
            font-size: 0.875rem;
            color: #4b5563;
          }
          
          /* Messages */
          .message-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          
          .message {
           font-size:.8rem;
           line-height:1rem;
            border-radius: 8px;
            max-width: 80%;
            white-space: pre-wrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: relative;
            page-break-inside: avoid;
            padding:0
             margin:0;
          }
          
          .message.assistant {
            background-color: #f3f4f6;
             font-size:.8rem;
           line-height:1rem;
            color: #374151;
            margin-right: auto;
            padding:0
            border-bottom-left-radius: 0;
          }
          
          .message.user {
            background-color: #dbeafe;
             font-size:.8rem;
           line-height:1rem;
            color: #1e40af;
            margin-left: auto;
            border-bottom-right-radius: 0;
            text-align: left;
            padding:0
          }
          
          .message-label {
            font-size: 0.75rem;
            color: #6b7280;
         margin:0;
            font-weight: 600;
          }
          
          .timestamp {
            font-size: 0.7rem;
            color: #9ca3af;
            margin:0;
            text-align: right;
          }
          
          /* Page break utilities */
          .page-break {
            page-break-after: always;
          }
          
          /* Print-specific styles */
          @media print {
            body {
              padding: 0;
              font-size: 12pt;
            }
            
            .message {
              box-shadow: none;
              border: 1px solid #e5e7eb;
            }
            
            .header {
              margin-bottom: 30px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="profile-container">
            <div class="profile-text">UB</div>
          </div>
          <div>
            <h1 class="title">UNIBot UK</h1>
            <p class="subtitle">Computer Science Program Guide</p>
          </div>
        </div>
        
        <div class="message-container">
          ${messages.map((message, index) => `
            <div class="message ${message.role}">
              <div class="message-label">${message.role === 'assistant' ? 'UNIBot' : 'You'}</div>
              ${message.content}
              <div class="timestamp">${new Date().toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
};
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
   // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
const content=input
setInput(" ")
    setIsLoading(true);
    const userMessage = { role: "user", content: content };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
const data = await response.json();
      console.log(data);

      if (!response.ok) {
           const errorMessage = {
        role: "assistant",
        content: `Something went wrong: ${data.error + ', please try again in a moment.'|| ' Please try again.'}`,
          isError: true  // Add this flag for error messages
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('API Error:', data.error);

      }
      else {
      // Handle successful response
      const botMessage = { role: "assistant", content: data.response, isError: false };
      setMessages((prev) => [...prev, botMessage]);
    }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, there was a problem connecting to the server. Please try again later.`, 
             isError: true  // Add this flag for error messages 
             }
      ]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  const handlePrompt = (promptText: string) => {
    setInput(promptText);
  };

  const noMessages = messages.length === 0;
const handleRetry = async () => {
    // Get the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(msg => msg.role === "user");
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[messages.length - lastUserMessageIndex - 1];
    
    // Remove the error message
    setMessages(messages.slice(0, -1));
    
    // Retry the request
    setIsLoading(true);

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages.slice(0, -1), lastUserMessage] })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = {
          role: "assistant",
          content: `Something went wrong: ${data.error + ', please try again in a moment.' || ' Please try again.'}`,
          isError: true
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error('API Error:', data.error);
      } else {
        const botMessage = { role: "assistant", content: data.response, isError: false };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, there was a problem connecting to the server. Please try again later.`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="mainBody" >
      <div
        className="main">
    <div className="navbar">
      <div className="navbar-left">
        <div className="profile-container">
          <div className="profile-text">UB</div>
        </div>
        <div className="text-container">
          <h1>UNIBot UK</h1>
          <p>computer science program Guide</p>
        </div>
      </div>
      <div className="navbar-right">
        {/* <div className="navbar-button">UK</div>
        <div className="navbar-button-alt">CS</div> */}
            <button onClick={handlePrint} className="print-button">
  <Printer size={20} /> Print Chat
</button>

      </div>
    </div>
        {noMessages && <div className="suggestions">
          <PromtSuggestionRow onPromptClick={handlePrompt} />
        </div>}
        
        <section className={noMessages ? "" : "populated"} ref={chatRef}>
  {noMessages ? (
    <div className="noMessage">
      <div className="botMessageIcon">
        <BotIcon className="bot" />
      </div>
      <div className="noMessageBox">
        <p className="noMainMessage">
          Hello! I'm UniBot, your guide to UK Computer Science programs. How can I help you today?
        </p>
      </div>
    </div>
  ) : (
    <>
      {messages.map((message, index) => (
        <Bubble key={`message-${index}`} message={message} onRetry={handleRetry} />
      ))}
      {isLoading && <LoadingBubble />}
    </>
  )}
  <div ref={messagesEndRef} />
</section>

        
        <div className="form-container">
  <form onSubmit={handleSubmit} className="form-wrapper">
            <input
                 onChange={(e) => setInput(e.target.value)}
          value={input}
      placeholder="Ask about UK Computer Science programs..."
      className="input-field"
      type="text"
      
    />
    <button type="submit" className="submit-button">
    <SendIcon/>
    </button>
  </form>
</div>

       
     
      </div>
   
    </div>
  );
};

export default Home;

// Home.tsx
// "use client";

// import Image from "next/image";
// import { useState, useEffect } from "react";
// import preview1 from "./assets/Preview1.png";
// import Bubble from "./component/Bubble";
// import LoadingBubble from "./component/LoadingBubble";
// import PromtSuggestionRow from "./component/PromptSuggestionRow";

// interface Message {
//   role: string;
//   content: string;
// }

// const Home = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [chatHistory, setChatHistory] = useState<Message[]>([]);

//   // Load chat history from localStorage on component mount
//   useEffect(() => {
//     const savedHistory = localStorage.getItem('chatHistory');
//     if (savedHistory) {
//       const parsedHistory = JSON.parse(savedHistory);
//       setMessages(parsedHistory);
//       setChatHistory(parsedHistory);
//     }
//   }, []);

//   // Save chat history to localStorage whenever it changes
//   useEffect(() => {
//     if (messages.length > 0) {
//       localStorage.setItem('chatHistory', JSON.stringify(messages));
//     }
//   }, [messages]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     setIsLoading(true);
//     const userMessage: Message = { role: "user", content: input };

//     // Update messages and chat history
//     const updatedMessages = [...messages, userMessage];
//     setMessages(updatedMessages);
//     setChatHistory(updatedMessages);

//     try {
//       const response = await fetch("/api", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           messages: updatedMessages,  // Send full conversation history
//           lastMessage: input  // Send latest message separately for embedding
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch response");
//       }

//       const data = await response.json();
//       const botMessage: Message = { role: "assistant", content: data.response };

//       // Update with bot response
//       const finalMessages = [...updatedMessages, botMessage];
//       setMessages(finalMessages);
//       setChatHistory(finalMessages);
//     } catch (error) {
//       console.error(error);
//       const errorMessage: Message = {
//         role: "assistant",
//         content: "Sorry, something went wrong. Please try again."
//       };
//       setMessages(prev => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//       setInput("");
//     }
//   };

//   const clearChat = () => {
//     setMessages([]);
//     setChatHistory([]);
//     localStorage.removeItem('chatHistory');
//   };

//   const noMessages = messages.length === 0;

//   return (
//     <main>
//       <div className="flex justify-between items-center w-full px-4 py-2">
//         <Image src={preview1} width="250" height="250" alt="image" />
//         {!noMessages && (
//           <button
//             onClick={clearChat}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//           >
//             Clear Chat
//           </button>
//         )}
//       </div>
//       <section className={noMessages ? "" : "populated"}>
//         {noMessages ? (
//           <>
//             <p className="starter-text">
//               Welcome to the UK CS Masters Chatbot! I'm here to help you find information about Computer Science Master's programs at UK universities. Ask me anything about courses, entry requirements, fees, career prospects, and more!
//             </p>
//             <br />
//             <PromtSuggestionRow onPromptClick={setInput} />
//           </>
//         ) : (
//           <>
//             {messages.map((message, index) => (
//               <Bubble key={`message-${index}`} message={message} />
//             ))}
//             {isLoading && <LoadingBubble />}
//           </>
//         )}
//       </section>
//       <form onSubmit={handleSubmit}>
//         <input
//           className="question-box"
//           onChange={(e) => setInput(e.target.value)}
//           value={input}
//           placeholder="Ask me something...."
//         />
//         <input type="submit" value="Send" />
//       </form>
//     </main>
//   );
// };

// export default Home;