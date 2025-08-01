// functions/gemini.js

export async function onRequestPost(context) {
    try {
        // 1. フロントエンドからの、リクエストボディ（JSON）を、取得
        const requestData = await context.request.json();
        const userPrompt = requestData.prompt;

        if (!userPrompt) {
            return new Response('Prompt is required', { status: 400 });
        }

        // 2. Cloudflareの、環境変数（Secrets）から、安全に、APIキーを、取得
        //    'GEMINI_API_KEY' という名前で、設定します（後述）
        const API_KEY = context.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return new Response('API key not configured', { status: 500 });
        }
        
        // 3. Google Gemini APIへ、リクエストを、送信
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
        
        const fullPrompt = `あなたは、物事を、論理的かつ、詩的に、捉える、AIです。以下の、ユーザーからの、言葉に対して、短く、思慮深い、応答を、生成してください：\n\nUSER: ${userPrompt}\nAI:`;

        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "contents": [{
                    "parts": [{
                        "text": fullPrompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 150,
                }
            })
        });

        if (!geminiResponse.ok) {
            // Googleからの、エラーレスポンスを、そのまま、返す
            return new Response(await geminiResponse.text(), { 
                status: geminiResponse.status,
                statusText: geminiResponse.statusText
            });
        }

        const data = await geminiResponse.json();
        const aiText = data.candidates[0].content.parts[0].text;

        // 4. フロントエンドへ、AIの、応答を、JSON形式で、返す
        return new Response(JSON.stringify({ response: aiText }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in Cloudflare Function:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}