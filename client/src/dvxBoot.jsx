import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Select, DatePicker, Menu, Dropdown } from "antd";
import { SendOutlined, MinusOutlined, PlusOutlined, TranslationOutlined } from "@ant-design/icons";
import "./Chatbot.css";
import moment from "moment";
import axios from 'axios';
import parse from "html-react-parser";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
const { Option } = Select;

// const baseUrl = "http://localhost:5000"
const baseUrl = "http://13.48.147.159:5000"

const DvxBot = () => {
    const { t } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [expanded, setExpanded] = useState(false);
    const [conversationStep, setConversationStep] = useState("welcome");
    const [isExistingCustomer, setIsExistingCustomer] = useState(false);
    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        licensePlate: "",
    });
    const [carDetails, setCarDetails] = useState({
        brand: "",
        model: "",
        year: "",
        engine: "",
    });
    const [selectedOption, setSelectedOption] = useState("");
    const [carSelectionStep, setCarSelectionStep] = useState("brand");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [tuningStage, setTuningStage] = useState("");
    const [dateTime, setDateTime] = useState(null);
    const [loading, setLoading] = useState(false)
    const [general, setGeneral] = useState(false)
    const [isBooking, setBooking] = useState(false)
    const [section, setSection] = useState("")
    const [thirdB1, setThirdB1] = useState("")
    const [thirdC1, setThirdC1] = useState("")
    const [maintenanceService, setMaintenanceService] = useState("")
    const [isMaintenanceServiceCarSelect, setMaintenanceServiceCarSelect] = useState(false)
    const [customerVerifyName, setCustomerVerifyName] = useState(false)
    const [customerVerifyLicense, setCustomerVerifyLicense] = useState(false)
    const [name, setName] = useState("")
    const [license, setLicense] = useState("")

    const [carBrands, setCarBrands] = useState([]);
    const [carModels, setCarModels] = useState({});
    const [carYears, setCarYears] = useState({});
    const [carEngines, setCarEngines] = useState({});

    const [isFirstName, setShowFirstName] = useState(false)
    const [isLastName, setShowLastName] = useState(false)
    const [isPhoneNum, setShowPhoneNum] = useState(false)
    const [isLicensePlate, setShowLicensePlate] = useState(false)
    const [isType, setShowType] = useState(false)
    const [isLastMaintenanceDate, setShowLastMaintenanceDate] = useState(false)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone_number, setPhone_number] = useState("")
    const [licensePlate, setLicensePlate] = useState("")
    const [type, setType] = useState("")
    const [lastMaintenanceDate, setLastMaintenanceDate] = useState("")

    const [isTyreType, setShowTyreType] = useState(false)
    const [tyreType, setTyreType] = useState("")

    const [processAgain, setProcessAgain] = useState(false)

    // const carBrands = ["BMW", "Audi", "Mercedes", "Volkswagen"];
    // const carModels = {
    //     BMW: ["M3", "M5", "X5"],
    //     Audi: ["A4", "A6", "Q7"],
    //     Mercedes: ["C63", "E63", "GLE"],
    //     Volkswagen: ["Golf R", "Tiguan", "Passat"],
    // };
    // const carYears = ["2018", "2019", "2020", "2021", "2022"];
    // const carEngines = ["2.0L TSI", "3.0L Turbo", "V8"];

    useEffect(() => {
        const lang = navigator.language.startsWith("fr") ? "fr" : navigator.language.startsWith("nl") ? "nl" : "en";
        console.log("lang---------", lang)
        const langKey = localStorage.getItem("language")
        i18n.changeLanguage(lang)
        setMessages([
            {
                type: "bot",
                //text: "Welcome to DVX Performance! 💨 What can we help you with today?",
                html: true,
                key: "welcome"
            },
        ]);
    }, []);

    useEffect(() => {
        if (messages.length === 1) {
            setTimeout(() => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        type: "bot",
                        //text: "Please choose an option:",
                        html: true,
                        buttons: [
                            "main-btn1",
                            "main-btn2",
                            "main-btn3",
                            // "Chip Tuning & Performance Upgrades ⚡",
                            // "Maintenance & Tyre Services 🔧",
                            // "General Questions ❓",
                        ],
                        key: "choose-option"
                    },
                ]);
            }, 1000);
        }
    }, [messages]);

    useEffect(() => {
        axios.get(`${baseUrl}/cars`).then((response) => {
            const formattedData = formatCarData(response.data);
            setCarBrands(formattedData.carBrands);
            setCarModels(formattedData.carModels);
            setCarYears(formattedData.carYears);
            setCarEngines(formattedData.carEngines);
        });
    }, [])

    const formatCarData = (data) => {
        let brands = [];
        let models = {};
        let years = {};
        let engines = {};

        data.forEach((car) => {
            const brand = car.brand.trim(); // Ensure no extra spaces
            if (!brands.includes(brand)) {
                brands.push(brand);
            }

            models[brand] = JSON.parse(car.models);
            years[brand] = JSON.parse(car.year);
            engines[brand] = JSON.parse(car.engine);
        });

        return { carBrands: brands, carModels: models, carYears: years, carEngines: engines };
    };

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (text) => {
        console.log("text---------", text)
        console.log("conversationStep---------", conversationStep)
        const userMessage = { type: "user", text, key: text };
        setMessages((prevMessages) => [...prevMessages, userMessage]);

        setIsTyping(true); // stop
        setTimeout(() => {
            let botMessage;
            switch (conversationStep) {
                case "welcome":
                    if (
                        text.includes("main-btn1") ||
                        text.includes("main-btn2") ||
                        text.includes("main-btn3")
                    ) {
                        if (text.includes("main-btn3")) {
                            setSelectedOption(text);
                            setConversationStep("generalQuestions");
                            setGeneral(true)
                            botMessage = {
                                type: "bot",
                                key: "common-tips",
                                html: true,
                                buttons: [
                                    "price",
                                    "duration",
                                    "contact",
                                ],
                            };

                        }
                        else {
                            setSelectedOption(text);
                            botMessage = {
                                type: "bot",
                                //text: "Are you an existing customer?",
                                html: true,
                                buttons: ["yes", "no"],
                                key: "existing-customer"
                            };
                            setConversationStep("identifyCustomer");
                        }
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Please select a valid option.",
                            html: true,
                        };
                    }
                    break;
                case "identifyCustomer":
                    if (text.toLowerCase() === "yes") {
                        botMessage = {
                            type: "bot",
                            key: "verify-name",
                            html: true,
                        };
                        setCustomerVerifyName(true)
                        setConversationStep("verifyCustomer");
                    } else if (text.toLowerCase() === "no") {
                        setIsExistingCustomer(false);
                        botMessage = {
                            type: "bot",
                            //text: "No problem! I can guide you through our services.",
                            html: true,
                            key: "no-problem"
                        };
                        setMessages((prevMessages) => [...prevMessages, botMessage]);
                        setConversationStep("newCustomer");
                        console.log("selectedOption-------", selectedOption)
                        if (selectedOption.includes("main-btn1")) {
                            setConversationStep("chipTuningOptions");
                            botMessage = {
                                type: "bot",
                                // text: "We specialize in various performance upgrades. What are you looking for?",
                                key: "chip-option-text",
                                html: true,
                                buttons: [
                                    "chip-option-1",
                                    "chip-option-2",
                                    "chip-option-3",
                                    "chip-option-4",
                                ],
                            };
                        } else if (selectedOption.includes("main-btn2")) {
                            setConversationStep("maintenanceServices");
                            botMessage = {
                                type: "bot",
                                //text: "Here’s your past service history: [Service History]. What are you looking for today?",
                                key: "service-option-text",
                                html: true,
                                buttons: [
                                    "service-option-btn1",
                                    "service-option-btn2",
                                    "service-option-btn3",
                                    "service-option-btn4",
                                ],
                            };
                        } else if (selectedOption.includes("General Questions")) {
                            setConversationStep("generalQuestions");
                            botMessage = {
                                type: "bot",
                                key: "common-tips",
                                html: true,
                                buttons: [
                                    "price",
                                    "duration",
                                    "contact",
                                ],
                            };
                        }
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Please answer with 'yes' or 'no'.",
                            html: true,
                        };
                    }
                    break;
                case "newCustomer":
                    if (selectedOption.includes("Maintenance")) {
                        setConversationStep("maintenanceServices");
                        botMessage = {
                            type: "bot",
                            text: "Here’s your past service history: [Service History]. What are you looking for today?",
                            html: true,
                            buttons: [
                                "Oil Change 🔧",
                                "Brake Check & Replacement 🚨",
                                "Tyre Switch/Rotation & Balancing 🛞",
                                "Other – Describe Your Needs",
                            ],
                        };
                    } else if (selectedOption.includes("General Questions")) {
                        setConversationStep("generalQuestions");
                        setGeneral(true)
                        botMessage = {
                            type: "bot",
                            key: "common-tips",
                            html: true,
                            buttons: [
                                "price",
                                "duration",
                                "contact",
                            ],
                        };

                    }
                    break;
                case "chipTuningOptions":
                    if (text.includes("chip-option-1")) {
                        botMessage = {
                            type: "bot",
                            key: "select-brand",
                            html: true,
                            carSelection: true,
                            carSelectionStep: "brand",
                        };
                        setConversationStep("carSelection");
                        setSection("3A")
                    } else if (text.includes("chip-option-2")) {
                        botMessage = {
                            type: "bot",
                            key: "select-brand",
                            html: true,
                            carSelection: true,
                            carSelectionStep: "brand",
                        };
                        setConversationStep("carSelection");
                        setSection("3B")
                    } else if (text.includes("chip-option-3")) {
                        botMessage = {
                            type: "bot",
                            //text: "Exhaust upgrades can boost performance and sound. What are you interested in?",
                            key: "chip-option-3-text",
                            html: true,
                            buttons: [
                                "chip-option-3-btn1",
                                "chip-option-3-btn2",
                                "chip-option-3-btn3",
                                "chip-option-3-btn4",
                            ],
                        };
                        setConversationStep("3C");
                        setSection("3C")
                    } else if (text.includes("chip-option-4")) {
                        botMessage = {
                            type: "bot",
                            //text: "Please describe your tuning-related question, and I’ll do my best to assist. 🤖",
                            key: "chip-option-4-text",
                            html: true,
                        };
                        setGeneral(true)
                        // setConversationStep("describeQuestion");
                    } else {
                        botMessage = {
                            type: "bot",
                            // text: "Please select a valid option.",
                            key: "valid-option",
                            html: true,
                        };
                    }
                    break;
                case "carSelection":
                    if (carSelectionStep === "brand") {
                        setCarDetails((prev) => ({ ...prev, brand: text }));
                        setCarSelectionStep("model");
                        botMessage = {
                            type: "bot",
                            // text: "Now, choose your car model:",
                            key: "select-brand",
                            html: true,
                            carSelection: true,
                            carSelectionStep: "model",
                        };
                    } else if (carSelectionStep === "model") {
                        setCarDetails((prev) => ({ ...prev, model: text }));
                        setCarSelectionStep("year");
                        botMessage = {
                            type: "bot",
                            // text: "Great! What year was your car built?",
                            key: "select-year",
                            html: true,
                            carSelection: true,
                            carSelectionStep: "year",
                        };
                    } else if (carSelectionStep === "year") {
                        setCarDetails((prev) => ({ ...prev, year: text }));
                        setCarSelectionStep("engine");
                        botMessage = {
                            type: "bot",
                            // text: "Lastly, choose your engine type:",
                            key: "select-type",
                            html: true,
                            carSelection: true,
                            carSelectionStep: "engine",
                        };
                    } else if (carSelectionStep === "engine") {
                        setCarDetails((prev) => ({ ...prev, engine: text }));
                        setCarSelectionStep("confirm");
                        botMessage = {
                            type: "bot",
                            // text: `Awesome! You’ve selected: ${carDetails.brand} ${carDetails.model} ${carDetails.year} ${carDetails.engine}. Is this correct?`,
                            text: `${t("awsome")} ${carDetails.brand} ${carDetails.model} ${carDetails.year} ${carDetails.engine}. ${t("correct")}`,
                            html: true,
                            buttons: ["✅yes", "❌no"],
                        };
                        setConversationStep("confirmCarSelection");
                    }
                    break;
                case "confirmCarSelection":
                    if (text === "✅yes") {
                        if (section == "3A") {
                            botMessage = {
                                type: "bot",
                                text: `${t("tuining-data")} ${carDetails.brand} ${carDetails.model} ${carDetails.year} ${carDetails.engine} 🚗⚡:`,
                                html: true,
                                buttons: ["stage1", "stage2", "stage3"],
                            }
                            setConversationStep("tuningOptions");
                        }
                        else if (section == "3B") {
                            botMessage = {
                                type: "bot",
                                // text: "Engine tuning is highly customizable. What are you looking for?",
                                key: "3b-option-text",
                                html: true,
                                buttons: [
                                    "3b-btn1",
                                    "3b-btn2",
                                    "3b-btn3",
                                ],
                            };
                            setConversationStep("3B");
                        }
                        else if (section == "maintenanceServices") {
                            botMessage = {
                                type: "bot",
                                key: "book-appointment",
                                html: true,
                                buttons: ["yes", "no"],
                            }
                            setConversationStep("maintenanceServices");
                        }
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Let’s restart the car selection process.",
                            html: false,
                        };
                        setMessages((prevMessages) => [...prevMessages, botMessage]);
                        botMessage = {
                            type: "bot",
                            key: "select-brand",
                            html: true,
                            carSelection: true,
                            carSelectionStep: "brand",
                        };
                        setCarSelectionStep("brand");
                        setConversationStep("carSelection");
                    }
                    break;
                case "tuningOptions":
                    if (text === "stage1" || text === "stage2" || text === "stage3") {
                        setTuningStage(text);
                        if (text === "stage1") {
                            let botMessage2 = {
                                type: "bot",
                                text: `${t("stage1-for")} ${carDetails.brand} ${carDetails.model} ${carDetails.year} ${carDetails.engine}`,
                                html: true,
                            };
                            setMessages((prevMessages) => [...prevMessages, botMessage2]);
                            botMessage = {
                                type: "bot",
                                key: "book-appointment",
                                html: true,
                                buttons: ["yes", "no"],
                            }
                            setConversationStep("3A")
                        } else if (text === "stage2") {
                            let botMessage2 = {
                                type: "bot",
                                text: `${t("stage2-for")} ${carDetails.brand} ${carDetails.model} ${carDetails.year} ${carDetails.engine}`,
                                html: true,
                            };
                            setMessages((prevMessages) => [...prevMessages, botMessage2]);
                            botMessage = {
                                type: "bot",
                                key: "book-appointment",
                                html: true,
                                buttons: ["yes", "no"],
                            }
                            setConversationStep("3A")
                        } else if (text === "stage3") {
                            let botMessage2 = {
                                type: "bot",
                                text: `${t("stage3-for")} ${carDetails.brand} ${carDetails.model} ${carDetails.year} ${carDetails.engine}`,
                                html: true,
                            };
                            setMessages((prevMessages) => [...prevMessages, botMessage2]);
                            botMessage = {
                                type: "bot",
                                key: "book-appointment",
                                html: true,
                                buttons: ["yes", "no"],
                            }
                            setConversationStep("3A")

                        }
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Please select a valid option.",
                            html: true,
                        };
                    }
                    break;
                case "pricingDiscussion":
                    if (tuningStage === "Stage 3") {
                        botMessage = {
                            type: "bot",
                            text: "The price for Stage 3 tuning varies based on specific customizations. We will call you to discuss details📞",
                            html: true,
                        };
                        setConversationStep("provideContactDetails");
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Would you like to book an appointment or continue browsing other tuning options?",
                            html: true,
                            buttons: ["✅ Book an Appointment 📅", "❌ End Chat"],
                        };
                        setConversationStep("appointmentOrEnd");
                    }
                    break;
                case "provideContactDetails":
                    if (!phoneNumber) {
                        botMessage = {
                            type: "bot",
                            text: "Please provide your phone number 📲, and our tuning expert will call you back.",
                            html: true,
                        };
                        setPhoneNumber(text);
                    } else if (!email) {
                        botMessage = {
                            type: "bot",
                            text: "No problem! Drop your email here ✉️, and we’ll get back to you with pricing details.",
                            html: true,
                        };
                        setEmail(text);
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Got it! We’ll send you the details soon. ✅",
                            html: true,
                        };
                        setConversationStep("appointmentOrEnd");
                    }
                    break;
                case "appointmentOrEnd":
                    if (text === "✅ Book an Appointment 📅") {
                        botMessage = {
                            type: "bot",
                            text: "Please select a date and time for your appointment.",
                            html: true,
                        };
                        setConversationStep("bookAppointment");
                    } else if (text === "❌ End Chat") {
                        botMessage = {
                            type: "bot",
                            text: "Thank you for chatting with us! Have a great day! 🚗",
                            html: true,
                        };
                        setConversationStep("endChat");
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Please select a valid option.",
                            html: true,
                        };
                    }
                    break;
                case "generalQuestions":
                    if (text.includes("price")) {
                        botMessage = {
                            type: "bot",
                            // text: `Here’s a rough estimate of our pricing:
                            //     - Chip Tuning: Starting from $500
                            //     - Exhaust Switches: Starting from $300
                            //     - General Services: Starting from $100
                            //     For exact pricing and personalized quotes, please contact our employee. Would you like to connect with someone?`,
                            html: true,
                            key: "price-text"
                        };
                    } else if (text.includes("duration")) {
                        botMessage = {
                            type: "bot",
                            html: true,
                            key: "duration-text"
                        };
                    } else if (text.includes("contact")) {
                        botMessage = {
                            type: "bot",
                            html: true,
                            key: "contact-text"
                        };
                    } else {
                        botMessage = {
                            type: "bot",
                            text: "Please select a valid option.",
                            html: true,
                        };
                    }
                    break;
                case "contactEmployee":
                    if (text === "✅ Yes, connect me") {
                        // Ask for contact details
                        botMessage = {
                            type: "bot",
                            text: "Great! Please provide your phone number or email, and our employee will contact you shortly.",
                            html: true,
                        };
                        setConversationStep("collectContactDetails"); // Move to the next step
                    } else if (text === "❌ No, thanks") {
                        // Handle "No" response
                        botMessage = {
                            type: "bot",
                            text: "No problem! Let us know if you need anything else. 😊",
                            html: true,
                        };
                        setConversationStep("welcome"); // Return to the main menu
                    } else {
                        // Handle invalid options
                        botMessage = {
                            type: "bot",
                            text: "Please select a valid option.",
                            html: true,
                        };
                    }
                    break;
                case "collectContactDetails":
                    if (!phoneNumber && !email) {
                        // Check if the input is a phone number or email
                        if (text.match(/^\d{10}$/)) {
                            setPhoneNumber(text); // Save phone number
                            botMessage = {
                                type: "bot",
                                text: "Thank you! Our employee will call you shortly. 📞",
                                html: true,
                            };
                        } else if (text.includes("@")) {
                            setEmail(text); // Save email
                            botMessage = {
                                type: "bot",
                                text: "Thank you! Our employee will email you shortly. 📧",
                                html: true,
                            };
                        } else {
                            // Handle invalid input
                            botMessage = {
                                type: "bot",
                                text: "Please provide a valid phone number or email.",
                                html: true,
                            };
                        }
                    } else {
                        // Handle case where contact details are already provided
                        botMessage = {
                            type: "bot",
                            text: "Got it! We’ll contact you soon. ✅",
                            html: true,
                        };
                        setConversationStep("welcome"); // Return to the main menu
                    }
                    break;
                case "3A":
                    if (text.toLowerCase() === "yes") {
                        botMessage = {
                            type: "bot",
                            // text: `Enter Your first name`,
                            key: "enter-first-name",
                            html: true,
                        };
                        setShowFirstName(true)
                    }
                    break;
                case "3B":
                    if (!thirdB1) {
                        setThirdB1(text)
                        botMessage = {
                            type: "bot",
                            key: "book-appointment",
                            html: true,
                            buttons: ["yes", "no"],
                        }
                    }
                    else {
                        if (text.toLowerCase() === "yes") {
                            botMessage = {
                                type: "bot",
                                // text: `Enter Your first name`,
                                key: "enter-first-name",
                                html: true,
                            };
                            setShowFirstName(true)
                        }
                    }
                    break;
                case "3C":
                    if (!thirdC1) {
                        setThirdC1(text)
                        botMessage = {
                            type: "bot",
                            key: "book-appointment",
                            html: true,
                            buttons: ["yes", "no"],
                        }
                    }
                    else {
                        if (text.toLowerCase() === "yes") {
                            botMessage = {
                                type: "bot",
                                // text: `Enter Your first name`,
                                key: "enter-first-name",
                                html: true,
                            };
                            setShowFirstName(true)
                        }
                    }
                    break;
                case "maintenanceServices":
                    setSection("maintenanceServices")
                    if (!maintenanceService) {
                        console.log("text----321----", text)
                        setMaintenanceService(text)
                        if (text.includes("service-option-btn3")) {
                            botMessage = {
                                type: "bot",
                                key: "wheel-size"
                            };
                            setShowTyreType(true)
                        }
                        else if (text.includes("service-option-btn4")) {
                            setGeneral(true)
                        }
                        else {
                            setMaintenanceServiceCarSelect(true)
                            botMessage = {
                                type: "bot",
                                key: "select-brand",
                                html: true,
                                carSelection: true,
                                carSelectionStep: "brand",
                            };
                            setCarSelectionStep("brand");
                            setConversationStep("carSelection");
                        }
                    }
                    else {
                        if (text.toLowerCase() === "yes") {
                            botMessage = {
                                type: "bot",
                                // text: `Enter Your first name`,
                                key: "enter-first-name",
                                html: true,
                            };
                            setShowFirstName(true)
                        }
                    }
                    break;
                default:
                    botMessage = {
                        type: "bot",
                        text: "I'm not sure how to help with that. Can you please rephrase?",
                        html: true,
                    };
            }
            setIsTyping(false);
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        }, 1000);
    };

    const handleButtonClick = (buttonText, index) => {
        if (index === messages?.length - 1) {
            handleSendMessage(buttonText);
        }
    };

    const handleCarSelection = (value, type) => {
        setCarDetails((prev) => ({ ...prev, [type]: value }));
        handleSendMessage(value);
    };

    const handleGeneralQuestion = async () => {
        if (input.trim() !== '') {
            const userMessage = { type: 'user', text: input };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInput('');

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
                    setIsTyping(false);
                    return;
                }
                const botMessage = {
                    type: 'bot',
                    text: data.reply,
                    html: true
                };
                setIsTyping(false);
                setMessages((prevMessages) => [...prevMessages, botMessage]);

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

    const handleEnterName = () => {
        const userMessage = { type: 'user', text: name };
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setName("")

        setIsTyping(true);
        setTimeout(() => {
            setCustomerVerifyName(false)
            setCustomerVerifyLicense(true)
            const botMessage = { type: 'bot', key: "verify-license" }
            setMessages((prevMessages) => [...prevMessages, botMessage]);
            setIsTyping(false);
        }, 1000);

    }

    const handleEnterLicense = async () => {
        const userMessage = { type: 'user', text: license };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setLicense("")
        setIsTyping(true)

        const data = { name: name, license_plate: license }
        try {
            const res = await axios.post(`${baseUrl}/customer`, data)
            setCustomerVerifyName(false)
            setCustomerVerifyLicense(false)

            if(res?.data?.isFound){
                let recordFound = {
                    type: "bot",
                    text: `${t("history")} ${res?.data?.brand}, ${res?.data?.model}. ${t("today-looking")}`,
                    html: true,
                }
                setMessages((prevMessages) => [...prevMessages, recordFound]);
            }

            let botMessage;
            if (selectedOption.includes("main-btn1")) {
                setConversationStep("chipTuningOptions");
                botMessage = {
                    type: "bot",
                    key: "chip-option-text",
                    html: true,
                    buttons: [
                        "chip-option-1",
                        "chip-option-2",
                        "chip-option-3",
                        "chip-option-4",
                    ],
                };
            }
            else if (selectedOption.includes("main-btn2")) {
                setConversationStep("maintenanceServices");
                botMessage = {
                    type: "bot",
                    key: "service-option-text",
                    html: true,
                    buttons: [
                        "service-option-btn1",
                        "service-option-btn2",
                        "service-option-btn3",
                        "service-option-btn4",
                    ],
                };
            }

            setIsTyping(false);
            setMessages((prevMessages) => [...prevMessages, botMessage]);
            
        }
        catch (err) {
            setIsTyping(false);
        }
    }

    const handleBookFirstName = async () => {
        const userMessage = { type: 'user', text: firstName };
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setShowFirstName(false)
        setShowLastName(true)


        setIsTyping(true)
        setTimeout(() => {
            const botMessage = { type: 'bot', key: "enter-last-name" };
            setMessages((prevMessages) => [...prevMessages, botMessage])
            setIsTyping(false)
        }, 1000);
    }

    const handleBookLastName = async () => {
        const userMessage = { type: 'user', text: lastName };
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setShowLastName(false)
        setShowPhoneNum(true)

        setIsTyping(true)
        setTimeout(() => {
            const botMessage = { type: 'bot', key: "enter-phone" };
            setMessages((prevMessages) => [...prevMessages, botMessage])
            setIsTyping(false)
        }, 1000);
    }

    const handleBookPhone_number = async () => {
        const userMessage = { type: 'user', text: phone_number };
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setShowPhoneNum(false)
        setShowLicensePlate(true)

        setIsTyping(true)
        setTimeout(() => {
            const botMessage = { type: 'bot', key: "enter-plate" };
            setMessages((prevMessages) => [...prevMessages, botMessage])
            setIsTyping(false)
        }, 1000);
    }

    const handleBookLicensePlate = async () => {
        const userMessage = { type: 'user', text: licensePlate };
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setShowLicensePlate(false)
        setShowType(true)

        setIsTyping(true)
        setTimeout(() => {
            const botMessage = { type: 'bot', key: "enter-variant" };
            setMessages((prevMessages) => [...prevMessages, botMessage])
            setIsTyping(false)
        }, 1000);
    }

    const handleBookType = async () => {
        const userMessage = { type: 'user', text: type };
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setShowType(false)
        setShowLastMaintenanceDate(true)

        setIsTyping(true)
        setTimeout(() => {
            const botMessage = { type: 'bot', key: "enter-maint-date" };
            setMessages((prevMessages) => [...prevMessages, botMessage])
            setIsTyping(false)
        }, 1000);
    }

    const handleBookLastMaintenanceDate = async () => {
        const userMessage = { type: 'user', text: licensePlate };
        setMessages((prevMessages) => [...prevMessages, userMessage])
        setShowLastMaintenanceDate(false)
        setBooking(true)
    }

    const handleSaveTyreType = async () => {
        const userMessage = { type: 'user', text: tyreType };
        setMessages((prevMessages) => [...prevMessages, userMessage])

        setIsTyping(true)
        setTimeout(() => {
            setShowTyreType(false)
            let botMessage = {
                type: "bot",
                key: "book-appointment",
                html: true,
                buttons: ["yes", "no"],
            }
            setConversationStep("maintenanceServices");
            setIsTyping(false)
            setMessages((prevMessages) => [...prevMessages, botMessage])
        }, 1000);

    }

    const handleBookAppointment = async () => {
        // console.log("tuningStage---------", tuningStage)
        // console.log("carDetails---------", carDetails)
        // console.log("email---------", email)
        // console.log("dateTime---------", dateTime)
        // console.log("thirdB1---------", thirdB1)
        // console.log("thirdC1---------", thirdC1)
        // console.log("maintenanceService---------", maintenanceService)

        const data = {
            first_name: firstName,
            last_name: lastName,
            phone_number: phone_number,
            email: email,
            license_plate: licensePlate,
            brand: carDetails?.brand,
            model: carDetails?.model,
            engine: carDetails?.engine,
            manufacturing_year: carDetails?.year,
            type: type,
            chipped: tuningStage ? t("yes") : t("no"),
            chip_tuning: null,
            stage: tuningStage,
            last_maintenance: lastMaintenanceDate,
            maint_tyre_service: t(maintenanceService),
            wheel_tyre_type: tyreType
        }

        // return
        const formattedDate = moment(dateTime).format("YYYY-MM-DDTHH:mm:ssZ");
        try {
            setLoading(true)
            axios.post(`${baseUrl}/add-event-to-calender`, {
                service: maintenanceService ? t("main-btn2") : t("main-btn1"),
                dateTime: formattedDate,
            })
            await axios.post(`${baseUrl}/add-event-to-excel`, data)
            setMessages([...messages, { type: "bot", key: "appoint-scheduled" }])
            setLoading(false)
            setBooking(false)
            setProcessAgain(true)
        } catch (error) {
            setMessages([...messages, { type: "bot", key: "appoint-failed" }]);
        }
    }

    const handleProcessAgain = async () => {
        setMessages([
            {
                type: "bot",
                text: "Welcome to DVX Performance! 💨 What can we help you with today?",
                html: true,
            }
        ])
        setInput("")
        setIsTyping(false)
        setConversationStep("welcome")
        setIsExistingCustomer(false)
        setCustomerDetails({ name: "", licensePlate: "" })
        setCarDetails({ brand: "", model: "", year: "", engine: "" })
        setSelectedOption("")
        setCarSelectionStep("brand")
        setPhoneNumber("")
        setEmail("")
        setTuningStage("")
        setDateTime(null)
        setLoading(false)
        setGeneral(false)
        setBooking(false)
        setSection("")
        setThirdB1("")
        setThirdC1("")
        setMaintenanceService("")
        setMaintenanceServiceCarSelect(false)
        setCustomerVerifyName(false)
        setCustomerVerifyLicense(false)
        setName("")
        setLicense("")
        setShowFirstName(false)
        setShowLastName(false)
        setShowPhoneNum(false)
        setShowLicensePlate(false)
        setShowType(false)
        setShowLastMaintenanceDate(false)
        setFirstName("")
        setLastName("")
        setPhone_number("")
        setLicensePlate("")
        setType("")
        setLastMaintenanceDate("")
        setShowTyreType(false)
        setTyreType("")
        setProcessAgain(false)
    }

    const languageMap = {
        en: 'English',
        nl: 'Dutch',
        fr: 'French',
    };

    const handleMenuClick = async (e) => {
        i18n.changeLanguage(e.key)
        const selectedLang = { code: e.key, name: languageMap[e.key] };
        setSelectedLanguage(selectedLang);
        localStorage.setItem("language", e.key)
    }

    const languageMenu = (
        <Menu onClick={handleMenuClick}>
            {Object.keys(languageMap).map(key => (
                <Menu.Item key={key}>{languageMap[key]}</Menu.Item>
            ))}
        </Menu>
    );

    return (
        <div className={`chatbot ${expanded ? "expanded" : ""}`}>
            <div className="header">
                <div className="profile">
                    <img
                        src="/logo.jpeg"
                        alt="Avatar"
                        className="avatar-image"
                    />
                    <div className="profile-text-container">
                        <p className="chat-with-text">{t("chat-with")}</p>
                        <p className="assistant-name">{t("our-assistance")}</p>
                    </div>
                </div>
                <div className="actions">
                    <Dropdown overlay={languageMenu} trigger={['click']}>
                        <span className="input-icon" style={{ color: "white" }}>
                            <TranslationOutlined />
                        </span>
                    </Dropdown>
                    {expanded ? (
                        <MinusOutlined onClick={toggleExpand} />
                    ) : (
                        <PlusOutlined onClick={toggleExpand} />
                    )}
                </div>
            </div>
            <div className={` ${expanded ? "expanded-status" : "status-bar"}`}>
                <div className="status">
                    <span className="status-text">
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t("online")}
                    </span>
                </div>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => {
                    if (!message || !message.type) {
                        console.error("Invalid message:", message);
                        return null; // Skip rendering invalid messages
                    }
                    return (
                        <div key={index} className={`message ${message.type}`}>
                            {message.html ? parse(message.key ? t(message.key) : message.text) : message.key ? t(message.key) : message.text}
                            {message.buttons && (
                                <div className="button-container">
                                    {message.buttons.map((buttonText, idx) => (
                                        <Button
                                            key={idx}
                                            className="option-button"
                                            onClick={() => handleButtonClick(buttonText, index)}
                                        >
                                            {t(buttonText)}
                                        </Button>
                                    ))}
                                </div>
                            )}
                            {message.carSelection && (
                                <div className="car-selection">
                                    {message?.carSelectionStep === "brand" && (
                                        <Select
                                            disabled={!(index === messages?.length - 1)}
                                            placeholder={t("select-brand")}
                                            onChange={(value) => handleCarSelection(value, "brand")}
                                        >
                                            {carBrands.map((brand) => (
                                                <Option key={brand} value={brand}>
                                                    {brand}
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                    {message?.carSelectionStep === "model" && (
                                        <Select
                                            disabled={!(index === messages?.length - 1)}
                                            placeholder={t("select-model")}
                                            onChange={(value) => handleCarSelection(value, "model")}
                                        >
                                            {carModels[carDetails.brand].map((model) => (
                                                <Option key={model} value={model}>
                                                    {model}
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                    {message?.carSelectionStep === "year" && (
                                        <Select
                                            disabled={!(index === messages?.length - 1)}
                                            placeholder={t("select-year")}
                                            // placeholder="Select Year of Manufacture 📅"
                                            onChange={(value) => handleCarSelection(value, "year")}
                                        >
                                            {/* {carYears.map((year) => (
                                                <Option key={year} value={year}>
                                                    {year}
                                                </Option>
                                            ))} */}
                                            {carYears[carDetails.brand].map((year) => (
                                                <Option key={year} value={year}>
                                                    {year}
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                    {message?.carSelectionStep === "engine" && (
                                        <Select
                                            disabled={!(index === messages?.length - 1)}
                                            placeholder={t("select-type")}
                                            // placeholder="Select Engine Type & Size 🔧"
                                            onChange={(value) => handleCarSelection(value, "engine")}
                                        >
                                            {/* {carEngines.map((engine) => (
                                                <Option key={engine} value={engine}>
                                                    {engine}
                                                </Option>
                                            ))} */}
                                            {carEngines[carDetails.brand].map((engine) => (
                                                <Option key={engine} value={engine}>
                                                    {engine}
                                                </Option>
                                            ))}
                                        </Select>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="message bot typing-indicator">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {
                customerVerifyName &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            placeholder={t("type-here")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onPressEnter={() => handleEnterName()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleEnterName()}
                        />
                    </div>
                </div>
            }

            {
                customerVerifyLicense &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            placeholder={t("type-here")}
                            value={license}
                            onChange={(e) => setLicense(e.target.value)}
                            onPressEnter={() => handleEnterLicense()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleEnterLicense()}
                        />
                    </div>
                </div>
            }

            {
                isFirstName &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            // placeholder="Type here..."
                            placeholder={t("type-here")}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onPressEnter={() => handleBookFirstName()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleBookFirstName()}
                        />
                    </div>
                </div>
            }
            {
                isLastName &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            // placeholder="Type here..."
                            placeholder={t("type-here")}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            onPressEnter={() => handleBookLastName()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleBookLastName()}
                        />
                    </div>
                </div>
            }
            {
                isPhoneNum &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            // placeholder="Type here..."
                            placeholder={t("type-here")}
                            value={phone_number}
                            onChange={(e) => setPhone_number(e.target.value)}
                            onPressEnter={() => handleBookPhone_number()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleBookPhone_number()}
                        />
                    </div>
                </div>
            }
            {
                isLicensePlate &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            // placeholder="Type here..."
                            placeholder={t("type-here")}
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value)}
                            onPressEnter={() => handleBookLicensePlate()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleBookLicensePlate()}
                        />
                    </div>
                </div>
            }
            {
                isType &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            // placeholder="Type here..."
                            placeholder={t("type-here")}
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            onPressEnter={() => handleBookType()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleBookType()}
                        />
                    </div>
                </div>
            }
            {
                isLastMaintenanceDate &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            // placeholder="Type here..."
                            placeholder={t("type-here")}
                            value={lastMaintenanceDate}
                            onChange={(e) => setLastMaintenanceDate(e.target.value)}
                            onPressEnter={() => handleBookLastMaintenanceDate()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleBookLastMaintenanceDate()}
                        />
                    </div>
                </div>
            }
            {
                isTyreType &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            // placeholder="Type here..."
                            placeholder={t("type-here")}
                            value={tyreType}
                            onChange={(e) => setTyreType(e.target.value)}
                            onPressEnter={() => handleSaveTyreType()}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleSaveTyreType()}
                        />
                    </div>
                </div>
            }

            {isBooking &&
                <div className="book-section">
                    <Input
                        placeholder={t("enter-email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ marginBottom: "10px" }}
                    />

                    <DatePicker
                        showTime={{ format: 'HH:mm' }}
                        placeholder={t("select-date")}
                        onChange={(_, dateString) => setDateTime(dateString)}
                        style={{ width: "100%", marginTop: "10px" }}
                    />

                    <Button loading={loading} type="primary" onClick={handleBookAppointment} style={{ width: "100%", marginTop: "10px" }}>
                        <SendOutlined /> {t("booking-btn")}
                    </Button>
                </div>
            }

            {general &&
                <div className="chat-input">
                    <div className="input-row">
                        <Input
                            className="input-field"
                            placeholder={t("type-msg")}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPressEnter={() => handleGeneralQuestion(input)}
                        />
                        <SendOutlined
                            className="send-icon"
                            onClick={() => handleGeneralQuestion(input)}
                        />
                    </div>
                </div>
            }

            {processAgain &&
                <div className="book-section">
                    <Button type="primary" onClick={handleProcessAgain} style={{ width: "100%", marginTop: "10px" }}>
                        {t("process-btn")}
                    </Button>
                </div>
            }
        </div>
    );
};

export default DvxBot;
