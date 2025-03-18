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
    const { name, phone, carBrand, license_plate } = req.body;
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: "1sgEFsZk96TNtkr1Ml8zouW-KZtdSlhctf6P9xYunkSg",
            range: "Sheet1!A2:O"
        });

        const rows = response.data.values;
        let existingCustomer = rows.find(row => row[2] === license_plate);

        if (existingCustomer) {
            return res.json(
                { 
                    isFound: true, 
                    first_name: existingCustomer[0], 
                    last_name: existingCustomer[1], 
                    license_plate: existingCustomer[2], 
                    phone_number: existingCustomer[3], 
                    email: existingCustomer[4], 
                    brand: existingCustomer[5], 
                    model: existingCustomer[6], 
                    type: existingCustomer[7], 
                    engine: existingCustomer[8], 
                    manufacturing_year: existingCustomer[9], 
                    chipped: existingCustomer[10], 
                    stage: existingCustomer[11], 
                    last_maintenance: existingCustomer[12], 
                    maint_tyre_service: existingCustomer[13], 
                    wheel_tyre_type: existingCustomer[14] 
                });
        } else {
            return res.json({ isFound: false });
        }
    } catch (error) {
        console.log(error)
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
        email, model, type, engine, manufacturing_year, chipped, chip_tuning,
        stage, last_maintenance, maint_tyre_service, wheel_tyre_type, isFollowUp
    } = req.body

    try {
        const data = [ first_name, last_name, license_plate, phone_number,
            email, brand, model, type, engine, manufacturing_year, chipped,
            stage, last_maintenance, maint_tyre_service, wheel_tyre_type
        ]
        if(isFollowUp) data.push("Yes Follow Up")
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

app.post("/get-busy-slots", async (req, res) => {
    try {
        const { date } = req.body; // Expecting date in 'YYYY-MM-DD' format
        const calendar = google.calendar({ version: "v3", auth });

        const startOfDay = moment(date).startOf("day").toISOString();
        const endOfDay = moment(date).endOf("day").toISOString();

        const events = await calendar.events.list({
            calendarId: "tailormate.ai@gmail.com",
            timeMin: startOfDay,
            timeMax: endOfDay,
            singleEvents: true,
            orderBy: "startTime",
        });

        const busySlots = events.data.items.map((event) => ({
            start: moment(event.start.dateTime).format("HH:mm"),
            end: moment(event.end.dateTime).format("HH:mm"),
        }));

        res.json({ busySlots });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// **Add Event to Google Calendar**
app.post("/add-event-to-calender", async (req, res) => {
    try {
        const { service, startDateTime, endDateTime } = req.body;
        const calendar = google.calendar({ version: "v3", auth });

        const start = moment.parseZone(startDateTime); // Keeps the original timezone
        const end = moment.parseZone(endDateTime); // Keeps the original timezone
        const timeZone = start.format("Z");

        // const startDateTime = moment.parseZone(dateTime); // Keeps the original timezone
        // const timeZone = moment.parseZone(dateTime).format("Z");

        // let endDateTime = startDateTime.clone().add(60, "minutes")

        const event = {
            summary: `${service}`,
            start: { dateTime: start.format(), timeZone: timeZone },
            end: { dateTime: end.format(), timeZone: timeZone },
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
