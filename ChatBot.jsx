import React, { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const API_KEY = "AIzaSyDzzXMdZFEt2ChL-zj2T4r5AXoY9nG4m2o"; // Replace with your actual API key
  const API_URL = "https://api.openai.com/v1/chat/completions";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    try {
      const response = await axios.post(
        API_URL,
        {
          model: "gpt-3.5-turbo",
          messages: [...messages, userMessage],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );

      const botMessage = response.data.choices[0].message;
      setMessages((prevMessages) => [...prevMessages, userMessage, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
    }

    setInput("");
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-10 p-5 border border-gray-300 rounded-lg shadow-lg bg-gray-50">
      <h2 className="text-xl font-bold text-center text-blue-600">ChatBot</h2>
      
      <div className="h-80 overflow-y-auto bg-white p-4 rounded-lg shadow-inner mt-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded-lg text-white ${
              msg.role === "user" ? "bg-blue-500 text-right ml-auto w-fit" : "bg-gray-400 text-left mr-auto w-fit"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex items-center mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
