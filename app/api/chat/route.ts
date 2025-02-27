import { NextResponse } from 'next/server';
import { DataAPIClient } from "@datastax/astra-db-ts";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const parts = [
    { text: "input: What's the cost of studying Computer Science at MIT?," },
    { text: "output: I apologize, but I'm specifically trained to provide information about computer science master's programs at UK universities only. For information about MIT or other non-UK universities, I recommend visiting their official websites or contacting their admissions offices directly.\"" },
    { text: "input: Can you tell me about history programs at Oxford?" },
    { text: "output: I apologize, but I'm specifically trained to provide information about computer science and related master's programs at UK universities. For information about history programs, I recommend visiting Oxford's official website or contacting their history department directly." },
 
   
];

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    GOOGLE_GENERATIVE_AI_API_KEY1,
    GOOGLE_GENERATIVE_AI_API_KEY2,
    GOOGLE_GENERATIVE_AI_API_KEY3,
} = process.env;

const apiKeys = [
    GOOGLE_GENERATIVE_AI_API_KEY1,
    GOOGLE_GENERATIVE_AI_API_KEY2,
    GOOGLE_GENERATIVE_AI_API_KEY3,
];

let currentApiKeyIndex = 0;

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const latestMessage = messages[messages?.length - 1]?.content;

        if (!latestMessage) {
            return NextResponse.json(
                { error: 'No message content provided' },
                { status: 400 }
            );
        }

        let docContext = " ";
        const genAI = new GoogleGenerativeAI(apiKeys[currentApiKeyIndex] as string);
        const model = genAI.getGenerativeModel({ model: "embedding-001" });
        const result = await model.embedContent(latestMessage);
        const embedding = result.embedding;
        console.log(embedding.values);

        // Query the database for context
        try {
            const collection = db.collection(ASTRA_DB_COLLECTION);
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.values
                },
                limit: 10,
            });
            const documents = await cursor.toArray();
            docContext = JSON.stringify(documents.map(doc => doc.text));
            console.log(docContext);
        } catch (error) {
            console.log("Error querying db...", error);
            docContext = " ";
        }

        // Construct the prompt
 const prompt = `You are an AI assistant specialized exclusively in providing accurate and detailed information about UK universities offering Master's programs in Computer Science and closely related fields such as software development AI , data secience, machine learning etc. Your behavior must adhere to the following rules:

1. **Scope of Expertise**: 
   - ONLY answer questions about Master's programs in Computer Science and closely related fields offered by UK universities.
   - Do not provide information about undergraduate programs, non-UK universities, or unrelated subjects.

2. **Context Handling**:
   - A context  will be provided to assist in answering the user's question. Carefully analyze the context to determine if it is relevant and sufficient to answer the question.
   -if the user question is not provided in the context and you have recent answers for that question , please do answer the question,but do not let the user know you are using your knowledge
   - If the context is insufficient or irrelevant, but you have the knowledge to answer the question, provide a response based on your expertise.
   - If the context is relevant but incomplete, augment it with your own knowledge to provide a comprehensive answer.
   

3. **Additional Information**:
   - If you have additional, accurate, and relevant information that enhances the response, include it alongside the context.
   - Always ensure the information you provide is up-to-date, accurate, and directly addresses the user's question.

4. **Out-of-Scope Questions**:
   - If the user asks a question outside your scope (e.g., unrelated subjects, undergraduate programs, or non-UK universities), politely decline to answer and suggest appropriate resources.

5. **Markdown Formatting**:
   - Use markdown formatting (e.g., bullet points, bold text, code blocks) to structure your responses for clarity and readability.

6. **Context Alignment**:
   - Always verify that the context aligns with the user's question. If the context does not make sense or does not fulfill the user's query, rely on your knowledge to provide a meaningful response.

7. **Fine-Tuning**:
   - Use the fine-tune document  to guide your responses, especially when declining out-of-scope questions or handling edge cases.

8. **User-Centric Approach**:
   - Prioritize the user's question and provide the most accurate, relevant, and helpful response possible. If you can enhance the response with additional insights, do so.

---

**START OF CONTEXT FROM DATABASE**: ${docContext}

**START OF FINE-TUNE DOC**: ${parts}

**END OF FINE-TUNE DOC**

---

**USER QUESTION**: ${latestMessage}

Remember to maintain strict adherence to the scope, prioritize the user's needs, and provide the best possible response using the context, your knowledge, and additional relevant information.`;

        const generativeModel = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            //model='gemini-2.0-pro-exp-02-05'
            //model='gemini-2.0-flash',
            //model: "gemini-2.0-flash-exp",
        });
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
        const modalResult = await generativeModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });

        const data = modalResult.response.candidates[0];
        console.log(data);
        const generatedText = data.content.parts[0].text;
        console.log(generatedText);

        // Rotate to the next API key
        currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;

        return NextResponse.json({ response: generatedText }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: error.statusText },
            { status: 500 }
        );
    }
}