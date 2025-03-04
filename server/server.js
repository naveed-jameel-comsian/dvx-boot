import express from "express"
import axios from "axios"
import { google } from "googleapis"
import cors from "cors"
import dotenv from "dotenv"
import fs from "fs"
import moment from "moment-timezone"
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SHEETS_ID = process.env.SHEETS_ID;
const GOOGLE_CREDENTIALS = JSON.parse(fs.readFileSync("kinetic-wind-451413-i6-06cb76b63bfb.json"));

// booking-bot@kinetic-wind-451413-i6.iam.gserviceaccount.com
const auth = new google.auth.JWT(
    GOOGLE_CREDENTIALS.client_email,
    null,
    GOOGLE_CREDENTIALS.private_key,
    ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/calendar"]
)

const sheets = google.sheets({ version: "v4", auth });

// Google Sheets - Check & Update Customer Info
app.post("/customer", async (req, res) => {
    const { name, phone, carBrand } = req.body;
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEETS_ID,
            range: "Customers!A:D"
        });

        const rows = response.data.values;
        let existingCustomer = rows.find(row => row[0] === name);

        if (existingCustomer) {
            return res.json({ message: "Customer found", carBrand: existingCustomer[2], lastService: existingCustomer[3] });
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEETS_ID,
                range: "Customers!A:D",
                valueInputOption: "RAW",
                resource: { values: [[name, phone, carBrand, "No history"]] }
            });
            return res.json({ message: "New customer added" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// **Fetch Services from Google Sheets**
app.get("/services", async (req, res) => {
    try {
        const serviceSpreadsheetId = "1796m94VhNbJHPSYR4Tk9O6wB0vDnzyUlYqUZ2xSMBFs"; // Replace with your Google Sheet ID
        const range = "Sheet1!A2:C"; // Change according to your sheet name

        const response = await sheets.spreadsheets.values.get({ spreadsheetId: serviceSpreadsheetId, range });
        const rows = response.data.values;
        if (!rows.length) return res.json([]);

        const services = rows.map(([name, duration, price]) => ({ name, duration, price }));
        res.json(services);
    } catch (error) {
        console.log("services error---------", error)
        res.status(500).json({ error: error.message });
    }
});

app.post("/add-event-to-excel", async (req, res) => {

    const { first_name, last_name, phone_number, license_plate, brand,
        email, model, type, engine, manufacturing_year, chipped,
        chip_tuning, stage, last_maintenance, maint_tyre_service, wheel_tyre_type
    } = req.body

    try {
        const data = [ first_name, last_name, license_plate, phone_number,
            email, brand, model, type, engine, manufacturing_year, chipped,
            stage, last_maintenance, maint_tyre_service, wheel_tyre_type
        ]
        await sheets.spreadsheets.values.append({
            spreadsheetId: "1sgEFsZk96TNtkr1Ml8zouW-KZtdSlhctf6P9xYunkSg",
            range: "Sheet1!A:M",
            valueInputOption: "RAW",
            resource: { values: [data] }
        });
        return res.json({ message: "New Record added" });
    } catch (error) {
        console.log("error--------------",error)
        res.status(500).json({ error: error.message });
    }
});

// **Add Event to Google Calendar**
app.post("/add-event-to-calender", async (req, res) => {
    try {
        const { service, dateTime, duration } = req.body;
        const calendar = google.calendar({ version: "v3", auth });

        const startDateTime = moment.parseZone(dateTime); // Keeps the original timezone
        const timeZone = moment.parseZone(dateTime).format("Z");

        let endDateTime = startDateTime.clone().add(60, "minutes")
        // if(duration === "Onbekend") endDateTime = startDateTime.clone().add(60, "minutes")
        // else endDateTime = startDateTime.clone().add(duration, "minutes")
        
        // summary: `Appointment for ${service}`,
        const event = {
            summary: `${service}`,
            start: { dateTime: startDateTime.format(), timeZone: timeZone },
            end: { dateTime: endDateTime.format(), timeZone: timeZone },
        }

        const createdEvent = await calendar.events.insert({
            calendarId: "tailormate.ai@gmail.com",
            resource: event,
        });
        res.json({ message: "Event created!", eventId: createdEvent.data.id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
});

// OpenAI Chatbot
app.post("/chat", async (req, res) => {
    const { message, lang } = req.body;
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "system", content: `You are a helpful assistant that speaks ${lang}.` }, { role: "user", content: message }],
        }, { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.log("error--------", error)
        res.status(500).json({ error: error.message });
    }
});

app.get("/cars", async (req, res) => {
    try {
        const serviceSpreadsheetId = "1UG1lfNFtjUYg0X7-brY9Hb8gSzYaWM1mjUvbjihohAo"; // Replace with your Google Sheet ID
        const range = "Sheet1!A2:D"; // Change according to your sheet name

        const response = await sheets.spreadsheets.values.get({ spreadsheetId: serviceSpreadsheetId, range });
        const rows = response.data.values;
        if (!rows.length) return res.json([]);

        const services = rows.map(([brand, models, year, engine]) => ({ brand, models, year, engine }));
        res.json(services);
    } catch (error) {
        console.log("services error---------", error)
        res.status(500).json({ error: error.message });
    }
});


// boot assistant
// import OpenAI from 'openai';
// const openai = new OpenAI({
//     apiKey: "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"
// });
// app.post('/api/dating-ai/chat', async (req, res) => {
//     const { prompt } = req.body;
//     const conversationHistory = JSON.parse(prompt)

//     try {
//       const threadResponse = await openai.beta.threads.create({
//         messages: conversationHistory,
//       });

//       const threadId = threadResponse.id;

//       let reply = '';

//       const streamCompletion = new Promise((resolve, reject) => {

//         const stream = openai.beta.threads.runs.stream(threadId, {
//           assistant_id: "asst_hfEWt9zx3PTcjBUTosh1uXQx" || '',
//         });

//         stream.on('textDelta', (textDelta) => {
//           reply += textDelta.value;
//         });

//         stream.on('end', () => {
//           resolve(reply);
//         });

//         stream.on('error', (error) => {
//           console.error('Error processing prompt:', error);
//           reject(error);
//         });
//       });
//       const finalReply = await streamCompletion;
//       return res.json({ reply: finalReply });

//     } catch (error) {
//       console.error('Error fetching response from OpenAI:', error);
//       return res.json({ error: 'Error fetching response from OpenAI' }, { status: 500 });
//     }
// });


app.listen(5000, () => console.log("Backend running on port 5000"));
