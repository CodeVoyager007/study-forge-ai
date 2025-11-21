import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.168.0/streams/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, type, difficulty } = await req.json();
    console.log('Generating diagram:', { topic, type, difficulty });

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert at creating educational diagrams. Generate educational diagrams only. Do not create content related to harmful, illegal, or unethical topics.`;

    const userPrompt = `Create a detailed ${type} diagram about ${topic}. Include:
1. Clear nodes/steps/elements
2. Connections and relationships
3. Brief descriptions for each element
4. Visual layout suggestions`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse', {
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
              name: "generate_diagram",
              description: "Generate a structured diagram",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  elements: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        id: { type: "STRING" },
                        label: { type: "STRING" },
                        description: { type: "STRING" },
                        type: { type: "STRING" }
                      },
                      required: ["id", "label"]
                    }
                  },
                  connections: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        from: { type: "STRING" },
                        to: { type: "STRING" },
                        label: { type: "STRING" }
                      },
                      required: ["from", "to"]
                    }
                  }
                },
                required: ["title", "elements", "connections"]
              }
            }
          ]
        }],
        toolConfig: {
          functionCallingConfig: {
            mode: "ANY",
            allowedFunctionNames: ["generate_diagram"],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("The response body is empty.");
    }
    
    const stream = readableStreamFromReader(response.body.getReader())
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(`data: ${chunk}\n\n`);
        }
      }));

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in generate-diagram:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
