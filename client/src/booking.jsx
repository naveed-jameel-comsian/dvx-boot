import React, { useState, useRef, useEffect } from 'react';
import { SendOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import './Chatbot.css';
import parse from 'html-react-parser';
import { Input, Select, DatePicker, Button } from "antd";
import moment from "moment";
import axios from 'axios';
const { Option } = Select;

const questions = [
    { key: "first_name", text: "What is Your First Name?" },
    { key: "last_name", text: "What is Your Last Name?" },
    { key: "phone_number", text: "What is Your Phone Number?" },
    { key: "license_plate", text: "What is Your License Plate Number?" },
    { key: "brand", text: "What is the Brand of Your Vehicle?" },
    { key: "model", text: "Which Model is Your Vehicle?" },
    { key: "type", text: "What is the Variant or Trim of Your Vehicle?" },
    { key: "engine", text: "What is the Engine Type of Your Vehicle?" },
    { key: "manufacturing_year", text: "What is the Year of Manufacture?" },
    { key: "chipped", text: "Is Your Vehicle Chipped? (Yes/No)" },
    { key: "chip_tuning", text: "Would You Like to Get the Chip Auto-Tuned? (Yes/No)", condition: (data) => data.chipped?.toLowerCase() === "yes" },
    { key: "stage", text: "What Stage is Your Tuning? (Stage 1, 2, or 3)", condition: (data) => data.chipped?.toLowerCase() === "yes" },
    { key: "last_maintenance", text: "When Was Your Last Maintenance Date?" }
];

const questions2 = [
    { 
        key: "service_type", 
        text: 
            <p>Welcome to DVX Performance! What can we help you with today?
                <br/><span style={{fontSize:"12px"}}>1- Chip Tuning & Performance Upgrades ⚡</span>
                <br/><span style={{fontSize:"12px"}}>2- Maintenance & Tyre Services 🔧</span>
                <br/><span style={{fontSize:"12px"}}>3- General Questions ❓</span>
            </p> 
    },
]

const new_questions =
{
    "question": "Welcome to DVX Performance! What can we help you with today?",
    "options": [
        "Chip Tuning & Performance Upgrades ⚡",
        "Maintenance & Tyre Services 🔧",
        "General Questions ❓"
    ],
    "question": "Are you an existing customer?",
    "options": [
        "Chip Tuning & Performance Upgrades ⚡",
        "Maintenance & Tyre Services 🔧",
        "General Questions ❓"
    ],
    "question": {
        "question": "Are you an existing customer?",
        "yes": "Great! Please provide your name and license plate to retrieve your records. 🚗",
        "no": "No problem! I can guide you through our services."
    },
    "chip_tuning_performance_upgrades": {
        "question": "We specialize in various performance upgrades. What are you looking for?",
        "options": [
            "Chip Tuning (Stage 1-3+) 💾",
            "Engine Specialized Tuning 🔧",
            "Exhaust Tuning & Switches 🔥",
            "Describe Your Question ❓"
        ],
        "chip_tuning": {
            "step_1": "Let’s find the right tuning options for your car! 🚗 Please select your car details step by step.",
            "select_car": {
                "brand": "Please choose your car brand:",
                "model": "Now, choose your car model:",
                "year": "Great! What year was your car built?",
                "engine": "Lastly, choose your engine type:"
            },
            "confirmation": "Awesome! You’ve selected: [Brand] [Model] [Year] [Engine]. Is this correct?",
            "tuning_options": "Here’s the tuning data for your [Car Make, Model, Year, Engine] 🚗⚡:",
            "pricing": "The price for Stage [X] tuning varies based on specific customizations. We will call you to discuss details📞",
            "contact_info": "Please provide your phone number 📲, and our tuning expert will call you back.",
            "fallback": "Would you like to continue browsing other tuning options or book an appointment to visit our shop?"
        },
        "engine_specialized_tuning": {
            "step_1": "Let’s find the right tuning options for your car! 🚗 Please select your car details step by step.",
            "tuning_needs": "Engine tuning is highly customizable and depends on your car’s setup and performance goals. What are you looking for?",
            "options": [
                "Turbo & Boost Optimization 🚀",
                "Fuel Injection & Airflow Adjustments ⛽",
                "Other – Describe Your Needs ❓"
            ],
            "callback": "Since engine tuning is a fully customized process, we’ll need to discuss the best setup for your car. You can either contact us or request a callback from our tuning expert."
        },
        "exhaust_tuning": {
            "question": "Exhaust upgrades can boost performance and sound. What are you interested in?",
            "options": [
                "Performance Exhaust Systems 🔥",
                "Switchable Exhaust Valve Systems 🎶",
                "Custom Sound Adjustments 🎵",
                "Other – Describe Your Needs"
            ],
            "booking": "Would you like to book an installation or discuss options? 📅"
        },
        "describe_question": {
            "question": "Please describe your tuning-related question, and I’ll do my best to assist. 🤖",
            "fallback": "Would you like to talk to a human expert 📞 or request a callback?"
        }
    },
    "maintenance_tyre_services": {
        "question": "We provide a full range of maintenance services. What do you need help with?",
        "options": [
            "Oil Change 🔧",
            "Brake Check & Replacement 🚨",
            "Tyre Switch/Rotation & Balancing 🛞",
            "Other – Describe Your Needs"
        ],
        "booking": "Would you like to book a service appointment? 📅"
    },
    "general_questions": {
        "topics": [
            "Pricing for chip tuning, exhaust switches, and services 📌",
            "Estimated service duration 📌",
            "Contact details and workshop location 📌"
        ]
    },
    "handling_special_cases": {
        "unclear_requests": "Could you provide more details? I’ll do my best to assist!",
        "escalation": "It looks like you need specialized help. Would you like to chat with an expert? 🛠️"
    },
    "additional_features": [
        "Live Pricing & HP Gain Data (Fetched from Google Sheets)",
        "Google Calendar Integration (Self-service appointment booking)",
        "License Plate Recognition (For returning customers)",
        "Escalation to Human Agent (For complex queries)",
        "Multi-Language Support (DUTCH – English – French)"
    ]
}


const Booking = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const messagesEndRef = useRef(null);
    const [expanded, setExpanded] = useState(false);
    const [data, setData] = useState({
        first_name: null,
        last_name: null,
        phone_number: null,
        license_plate: null,
        brand: null,
        model: null,
        type: null,
        engine: null,
        manufacturing_year: null,
        chipped: null,
        chip_tuning: null,
        stage: null,
        last_maintenance: null,
    });
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [dateTime, setDateTime] = useState(null);
    const [showServices, setShowServices] = useState(false)
    const [showProcessAgain, setShowProcessAgain] = useState(false)
    const [loading, setLoading] = useState(false)
    const [duration, setDuration] = useState(null)

    useEffect(() => {
        axios.get("http://localhost:5000/services").then((response) => {
            console.log("response.data--------", response.data)
            setServices(response.data);
        })
        setMessages([{ type: "bot", text: questions[0].text }]);
    }, [])

    const handleBookAppointment = async () => {
        if (!selectedService || !dateTime) {
            setMessages([...messages, { type: "bot", text: "Please select a service and a date/time." }]);
            return;
        }

        const formattedDate = moment(dateTime).format("YYYY-MM-DDTHH:mm:ssZ");
        try {
            setLoading(true)
            axios.post("http://localhost:5000/add-event-to-calender", {
                service: selectedService,
                dateTime: formattedDate,
                duration: duration
            })
            await axios.post("http://localhost:5000/add-event-to-excel", data)

            if (duration === "Onbekend") {
                setMessages([...messages,
                { type: "bot", text: "Your appointment has been scheduled!" },
                { type: "bot", text: "Our Admin will contact you soon!" },
                ])

            }
            else setMessages([...messages, { type: "bot", text: "Your appointment has been scheduled!" }])
            setShowProcessAgain(true)
            setLoading(false)
        } catch (error) {
            setMessages([...messages, { type: "bot", text: "Failed to book appointment." }]);
        }
    }

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    const handleSaveInput = async () => {
        if (input.trim() !== '') {
            const userMessage = { type: 'user', text: input };
            setMessages((prevMessages) => [...prevMessages, userMessage]);

            // Save user input
            const currentQuestionKey = questions[currentQuestionIndex].key;
            setData((prevData) => ({
                ...prevData,
                [currentQuestionKey]: input.trim(),
            }));

            setInput('');
            setIsTyping(true);

            setTimeout(() => {
                setIsTyping(false);

                let nextIndex = currentQuestionIndex + 1;
                let updatedData = { ...data, [currentQuestionKey]: input.trim() };

                while (
                    nextIndex < questions.length &&
                    questions[nextIndex].condition &&
                    !questions[nextIndex].condition(updatedData)
                ) {
                    nextIndex++;
                }

                if (nextIndex < questions.length) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { type: "bot", text: questions[nextIndex].text }
                    ]);
                    setCurrentQuestionIndex(nextIndex);
                } else {
                    setShowServices(true)
                    // setMessages((prevMessages) => [
                    //     ...prevMessages,
                    //     { type: "bot", text: "Thank you for your responses!" }
                    // ]);
                }
            }, 1000);
        }
    }

    const handleSelectService = (service) => {
        setSelectedService(service)
        const selectedService = services?.find((s) => s.name === service);
        setDuration(selectedService?.duration);

    }

    const handleProcessAgain = () => {
        setShowServices(false)
        setShowProcessAgain(false)

        setSelectedService(null)
        setDateTime(null)
        setCurrentQuestionIndex(0)
        setData({
            first_name: null,
            last_name: null,
            phone_number: null,
            license_plate: null,
            brand: null,
            model: null,
            type: null,
            engine: null,
            manufacturing_year: null,
            chipped: null,
            chip_tuning: null,
            stage: null,
            last_maintenance: null,
        })
        setMessages([{ type: "bot", text: questions[0].text }]);
    }

    return (
        <div className={`chatbot ${expanded ? 'expanded' : ''}`}>
            <div className="header">
                <div className="profile">
                    <img
                        src="https://api.dicebear.com/7.x/miniavs/svg?seed=3"
                        alt="Avatar"
                        className="avatar-image"
                    />
                    <div className="profile-text-container">
                        <p className="assistant-name">Book Appointment</p>
                    </div>
                </div>
                <div className="actions">
                    {expanded ? (
                        <MinusOutlined onClick={toggleExpand} />
                    ) : (
                        <PlusOutlined onClick={toggleExpand} />
                    )}
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
            {!showServices ?
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            placeholder="Type your answer..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={handleSaveInput}
                        />
                        <SendOutlined className="send-icon" onClick={handleSaveInput} />
                    </div>
                </div>
                :
                !showProcessAgain ?
                    <div className="book-section">
                        <Input
                            placeholder="Enter Email"
                            value={data.email}
                            onChange={(e) => setData((prevData) => ({ ...prevData, ["email"]: e.target.value }))}
                            style={{ marginBottom: "10px" }}
                        />

                        <Select className='select-box-service' placeholder="Select a Service" onChange={handleSelectService} style={{ width: "100%" }}>
                            {services.map((service, index) => (
                                <Option key={index} value={service.name}>
                                    {service.name}
                                </Option>
                            ))}
                        </Select>

                        <DatePicker
                            showTime={{ format: 'HH:mm' }}
                            placeholder="Select Date & Time"
                            onChange={(_, dateString) => setDateTime(dateString)}
                            style={{ width: "100%", marginTop: "10px" }}
                        />



                        <Button loading={loading} type="primary" onClick={handleBookAppointment} style={{ width: "100%", marginTop: "10px" }}>
                            <SendOutlined /> Book Appointment
                        </Button>
                    </div> :
                    <div className="chat-input">
                        <Button type="primary" onClick={handleProcessAgain} style={{ width: "100%", marginTop: "10px" }}>
                            Process Again
                        </Button>
                    </div>
            }
        </div>
    );
};

export default Booking;
