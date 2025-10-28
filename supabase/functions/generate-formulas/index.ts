import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, difficulty } = await req.json();
    console.log('Generating formulas:', { topic, difficulty });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_formulas",
            description: "Generate a structured formula sheet",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                categories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      formulas: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            formula: { type: "string" },
                            variables: { type: "object" },
                            whenToUse: { type: "string" },
                            example: { type: "string" },
                            commonMistakes: { type: "string" }
                          },
                          required: ["name", "formula"]
                        }
                      }
                    },
                    required: ["name", "formulas"]
                  }
                }
              },
              required: ["title", "categories"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_formulas" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No structured output received from AI');
    }

    const formulas = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ formulas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-formulas:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
