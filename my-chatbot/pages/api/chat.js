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

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true});
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const form = formidable({
                uploadDir: "./public/uploads",
                keepExtensions: true,
                maxFileSize: 5 * 1024 * 1024
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
                        const fileBuffer = fs.readFileSync(filePath);
                        const base64Image = fileBuffer.toString('base64');

                        // preparen image part
                        const imagePart = {
                            inlineData: {
                                mimeType: uploadedFile.mimetype,
                                data: base64Image
                            }
                        }

                        const response = await model.generateContent(
                            ["Describe this image in detail. What do you see?", imagePart]
                        );

                        reply = response.response.text() || "Failed to interpret the file content.";
                    } catch (readError) {
                        console.error("Error while reading Image", readError);
                        reply = "Could not read image content.";
                    }
                }

                if (message) {
                    try {
                    const response = await model.generateContent(
                        
                        `Respond to this message: "${message}"`
                        
                    );

                    reply += `\n\n${response.response.text() || "No response from the model."}`;
                } catch (generateError) {
                    console.error("Error while genarating content", generateError);
                    reply += "\nFailed to generate a response.";
                }
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