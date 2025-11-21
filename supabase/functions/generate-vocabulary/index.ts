import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { topic, difficulty, count = 20 } = await req.json();
    console.log('Generating vocabulary:', { topic, difficulty, count });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert language teacher. Generate educational vocabulary only. Do not include offensive, harmful, or inappropriate words.`;

    const userPrompt = `Create a vocabulary list of ${count} words about ${topic}. For each word include:
1. Word
2. Part of speech
3. Definition
4. Example sentence
5. Synonyms
6. Memory tip or mnemonic`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n${userPrompt}` }],
            },
          ],
          tools: [{
            functionDeclarations: [
              {
                name: "generate_vocabulary",
                description: "Generate vocabulary words with definitions",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    words: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          word: { type: "STRING" },
                          partOfSpeech: { type: "STRING" },
                          definition: { type: "STRING" },
                          example: { type: "STRING" },
                          synonyms: { type: "ARRAY", items: { type: "STRING" } },
                          memoryTip: { type: "STRING" }
                        },
                        required: ["word", "definition", "example"]
                      }
                    }
                  },
                  required: ["words"]
                }
              }
            ]
          }],
          toolConfig: {
            functionCallingConfig: {
              mode: "ANY",
              allowedFunctionNames: ["generate_vocabulary"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error('Error in generate-vocabulary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
