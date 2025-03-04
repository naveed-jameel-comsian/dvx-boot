import React, { useState, useRef, useEffect } from 'react';
import { Input } from 'antd';
import { SendOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import './Chatbot.css';
import parse from 'html-react-parser';



const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [lastInput, setLastInput] = useState(null);
    const messagesEndRef = useRef(null);
    const [expanded, setExpanded] = useState(false);
    const [language, setLanguage] = useState("en");

    useEffect(() => {
        const lang = navigator.language.startsWith("fr") ? "fr" : navigator.language.startsWith("nl") ? "nl" : "en";
        setLanguage(lang);
        setMessages([{ type: "bot", text: `Hello! How can I assist you today?` }]);
        // setMessages([{ role: "bot", content: `Hello! How can I assist you today? (${lang})` }]);
        // const welcomeMessage = { type: 'bot', text: 'Hey there! How can I assist you today?' };
    }, []);


    const saveMessageToApi = async (message, email) => {
        if (!email) {
            console.error("Error: User email is null or undefined.");
            return;
        }

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, message }),
            });

            if (!response.ok) {
                throw new Error('Failed to save message');
            }
        } catch (error) {
            console.error("Error saving message via API:", error);
        }
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const showError = (errorText) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'bot', text: errorText }
        ]);
    };

    const handleSendMessage = async () => {
        if (input.trim() !== '') {
            const userMessage = { type: 'user', text: input };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setLastInput(input); // Save the last sent message in state
            setInput('');
            const user = null;
            const email = user ? user.email : null;


            try {
                setIsTyping(true);
                const response = await fetch('http://localhost:5000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: input })
                });

                const data = await response.json();


                if (data.error) {
                    console.error('Error from backend:', data.error, data.detail);
                    showError(`Error fetching response from assistant, ${data.error}.`);
                    return;
                }

                const botMessage = {
                    type: 'bot',
                    text: data.reply,
                    html: true
                };
                if (email) {
                    await saveMessageToApi(userMessage, email);
                } else {
                    console.error("Error: User is not authenticated.");
                }
                setIsTyping(false);
                setMessages((prevMessages) => [...prevMessages, botMessage]);
                if (user) {
                    //await saveMessageToApi(botMessage, user.email!);
                }
                setLastInput(data.reply); // Save the bot's response in state
            } catch (error) {
                console.error('Error fetching assistant response:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { type: 'bot', text: 'Error fetching response from assistant.' }
                ]);
                setIsTyping(false);
            }
        }
    };

    return (
        <div className={`chatbot ${expanded ? 'expanded' : ''}`}>
            <div className="header">
                <div className="profile">
                    <img
                        src="https://api.dicebear.com/7.x/miniavs/svg?seed=3" // Update this to the correct path
                        alt="Avatar"
                        className="avatar-image"
                    />
                    <div className="profile-text-container">
                        <p className="chat-with-text">Chat with</p>
                        <p className="assistant-name">Our Assistant</p>
                    </div>
                </div>
                <div className="actions">
                    {expanded ? (
                        <MinusOutlined onClick={toggleExpand} />
                    ) : (
                        <PlusOutlined
                            onClick={toggleExpand} />
                    )}
                    {/* <DownOutlined onClick={closeChatbot} /> */}
                </div>
            </div>
            <div className={` ${expanded ? 'expanded-status' : 'status-bar'}`}>
                <div className="status">
                    <span className="status-text">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;We&apos;re online</span>
                </div>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        {message.html ? parse(message.text) : message.text}
                    </div>
                ))}
                {isTyping && (
                    <div className="message bot typing-indicator">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
                <div className="input-row">
                    <Input
                        className="input-field"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={handleSendMessage}
                    />
                    <SendOutlined className="send-icon" onClick={handleSendMessage} />
                </div>
                {/* <div className="icon-row">
                    <Dropdown overlay={languageMenu} trigger={['click']}>
                        <span className="input-icon">
                            <TranslationOutlined />
                        </span>
                    </Dropdown>
                    <SmileOutlined className="input-icon" />
                    <span className="input-icon">
                        <label htmlFor="file-upload">
                            <PaperClipOutlined />
                            <input id="file-upload" type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                        </label>
                    </span>
                </div> */}
            </div>
        </div>
    );
};

export default Chatbot;
