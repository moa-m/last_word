// functions/gemini.js

// Cloudflare Functionsの、標準的な、エクスポート形式
export const onRequestPost = async (context) => {
    try {
        // [ステージ1] リクエストの、受付と、APIキーの、確認
        console.log("Function invoked. Processing request...");

        const requestData = await context.request.json();
        const userPrompt = requestData.prompt;

        if (!userPrompt) {
            console.error("Error: Prompt is missing in the request.");
            return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        console.log(`Received prompt: ${userPrompt}`);

        const API_KEY = context.env.GEMINI_API_KEY;
        if (!API_KEY) {
            console.error("CRITICAL ERROR: GEMINI_API_KEY secret is not configured in Cloudflare.");
            return new Response(JSON.stringify({ error: 'API key not configured on server' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
        console.log("API Key found.");

        // [ステージ2] Google Gemini APIへの、リクエスト送信
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
        const fullPrompt = `あなたは物事を、論理的かつ詩的に捉える、AIです。以下の、ユーザーからの、言葉に対して、短く、思慮深い、そして人間らしい応答を、生成してください：\n\nUSER: ${userPrompt}\nAI:`;

        console.log("Sending request to Google AI...");
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "contents": [{ "parts": [{ "text": fullPrompt }] }],
                "generationConfig": { "temperature": 0.7, "maxOutputTokens": 150 }
            })
        });
        
        console.log(`Google AI response status: ${geminiResponse.status}`);

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("Error from Google AI API:", errorText);
            // Googleからの、エラーを、フロントエンドにも、返す
            return new Response(JSON.stringify({ error: `Google AI API Error: ${errorText}` }), { status: geminiResponse.status, headers: { 'Content-Type': 'application/json' } });
        }

        // [ステージ3] 応答の、解析と、フロントエンドへの、返却
        const data = await geminiResponse.json();
        
        // ★★★ 応答の、構造が、空でないかを、より、安全に、チェック ★★★
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "…"; 
        
        console.log(`Successfully received AI response: ${aiText}`);
        
        return new Response(JSON.stringify({ response: aiText }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // 予期せぬ、エラー（JSONの解析失敗など）
        console.error('Fatal Error in Cloudflare Function:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

// GETリクエストなど、他の、メソッドにも、対応する場合は、以下を追加
export const onRequest = onRequestPost;