import { GoogleGenerativeAI } from "@google/generative-ai";
import formidable from 'formidable';
import fs from 'fs';


const genAI = new GoogleGenerativeAI(process.env.API_KEY);


export const config = {
    api: {
        bodyParser: false,
    },
};


export default async function handler(req, res) {
    if (req.method === 'POST') {
        


        try {
            const form = new formidable.IncomingForm({
                uploadDir: "./public/uploads",
                keepExtensions: true

            });
          

            // Parse the request for fields and files

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error("Error parsing form data:", err);
                    return res.status(500).json({ error: "Failed to process upload"});
                }

                const { message } = fields;
                const uploadedFile = files.file;

                // Ensure either message or file is present
                if (!message && !uploadedFile) {
                    return res.status(400).json({error: "No message or file provded"});
                }

                let reply = "";

                if (uploadedFile) {
                    const filePath = uploadedFile.filePath;
                    const fileContent = fs.readFileSync(filePath, "utf-8");  // Read file content (assuming rext-based files like pdfs or txt)


                    const response = await genAI.generateContent({
                        model: "gemini-1.5-flash-8b",
                        prompt: `Interpret the following file content and provide insights:\n\n${fileContent}`,
                    });

                    reply = response?.candidates?.[0]?.content || "Failed to interpret the file content.";

                }
                if (message) {
                    const response = await genAI.generateContent({
                        model: "gemini-1.5-flash-8b",
                        prompt: `Respond to this message:  "{message}"`,
                    });

                    reply += `\n\n${response?.candidates?.[0]?.conent || "No response from the model."}`;

                }
                return res.status(200).json({reply});


            });
            

        } catch (error) {
            console.error("Error processing the AI response:", error);
            res.status(500).json({ error: "Failed to process the AI response"});

        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}