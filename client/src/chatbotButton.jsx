import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { CloseOutlined, RightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Chatbot from './chatbot';
import './ChatbotButton.css';

const ChatbotButton = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMainChatPage, setIsMainChatPage] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/chat') {
      setIsMainChatPage(true);
    } else {
      setIsMainChatPage(false);
    }
  }, []);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="chatbot-button-container">
        {!isOpen ? (
          isMainChatPage ? (
            <div className="chatbot-info-container" onClick={toggleChatbot}>
              &nbsp;
              <img
                src="/landing/assets/images/avatar.jpeg" // Update with the correct path to your image
                alt="Avatar"
                className="chatbot-avatar"
              />
              &nbsp;
              <div className="chatbot-info">
                <div className="chatbot-header">
                  <span className="chatbot-name">Rudy Assistant</span>
                  &nbsp;
                  <CheckCircleOutlined className="chatbot-verified" />
                </div>
              </div>
              &nbsp;
              <RightOutlined className="chatbot-arrow" />
            </div>
          ) : (
           
            <img
              src="/landing/assets/images/avatar.jpeg" // Update with the correct path to your image
              alt="Avatar"
              className="chatbot-avatar"
              onClick={toggleChatbot}
            />
       
          )
        ) : (
          <Button
            className="chatbot-round-button"
            type="primary"
            icon={<CloseOutlined />}
            onClick={toggleChatbot}
          />
        )}
      </div>
      {isOpen && (
        <div className="chatbot-container">
          <Chatbot session={session} closeChatbot={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default ChatbotButton;
