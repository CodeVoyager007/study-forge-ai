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
    const { topic, difficulty } = await req.json();
    console.log('Generating formulas:', { topic, difficulty });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert mathematics and science educator. Generate educational formula sheets. Do not include any harmful, unethical, or inappropriate content.`;

    const userPrompt = `Create a detailed formula sheet for ${topic}. For each formula include:
1. Formula name
2. The formula (use LaTeX notation)
3. Variable definitions
4. When to use it
5. Example application
6. Common mistakes to avoid

Organize formulas by category.`;

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
                name: "generate_formulas",
                description: "Generate a structured formula sheet",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING" },
                    categories: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          name: { type: "STRING" },
                          formulas: {
                            type: "ARRAY",
                            items: {
                              type: "OBJECT",
                              properties: {
                                name: { type: "STRING" },
                                formula: { type: "STRING" },
                                variables: { type: "OBJECT" },
                                whenToUse: { type: "STRING" },
                                example: { type: "STRING" },
                                commonMistakes: { type: "STRING" }
                              },
                              required: ["name", "formula"]
                            }
                          }
                        },
                        required: ["name", "formulas"]
                      }
                    }
                  }
                },
                required: ["title", "categories"]
              }
            }
          ]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: "ANY",
            allowedFunctionNames: ["generate_formulas"],
          },
        },
      }),
    });

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
    console.error('Error in generate-formulas:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
