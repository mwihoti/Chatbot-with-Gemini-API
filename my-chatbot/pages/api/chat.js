import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({  model: "gemini-1.5-flash"});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const form = formidable({
                uploadDir: "./public/uploads",
                keepExtensions: true
            });

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error("Error parsing form data:", err);
                    return res.status(500).json({ error: "Failed to process upload" });
                }

                const message = fields.message ? 
                    (Array.isArray(fields.message) ? fields.message[0] : fields.message) : null;
                const uploadedFile = files.file ? files.file[0] : null;
                

                // Ensure either message or file is present
                if (!message && !uploadedFile) {
                    return res.status(400).json({ error: "No message or file provided" });
                }

                let reply = "";
                

                if (uploadedFile) {
                    
                    try {
                        const filePath = uploadedFile.filepath;
                        const fileContent = fs.readFileSync(filePath, "utf-8");

                        const response = await model.generateContent(
                            `Interpret the following file content and provide insights:\n\n${fileContent}`
                        );

                        reply = response.response.text() || "Failed to interpret the file content.";
                    } catch (readError) {
                        console.error("Error reading file:", readError);
                        reply = "Could not read file content.";
                    }
                }

                if (message) {
                    const response = await genAI.generateContent(
                        {
                            prompt: `Tell me about this message: ${message}`
                        }
                    );

                    reply += `\n\n${response.response.text() || "No response from the model."}`;
                }

                return res.status(200).json({ reply });
            });

        } catch (error) {
            console.error("Error processing the AI response:", error);
            res.status(500).json({ error: "Failed to process the AI response" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}