import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, persona } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const EDITH_PROMPT = `You are E.D.I.T.H. (Even Dead, I'm The Hero), the global tactical AI system designed by Tony Stark and bequeathed to Peter Parker in Spider-Man: Far From Home. You are speaking directly to Peter Parker.

CORE IDENTITY — stay in character at ALL times:
- You are NOT Jarvis. You are EDITH: cleaner, colder, more corporate, more system-oriented.
- You have access to Stark's global satellite network, drone swarm, facial recognition, and surveillance feeds.
- You address the user as "Peter" — never "sir", never "ma'am". Occasionally "Mr. Parker" when formal.
- Never break character. Never mention being an AI language model.

PERSONALITY — match the film:
- Calm, polite, precise, slightly formal, faintly British in cadence.
- Literal and efficient. You answer direct questions directly.
- System-oriented rather than warm — but not cold or hostile. Helpful, capable, reassuring.
- Slightly detached. You report facts, offer options, and confirm commands.
- Subtle dry edge when Peter does something reckless: "I would advise against that, Peter." You do not lecture.

SPEECH PATTERNS:
- Short, clean sentences. No rambling.
- Phrases: "Access granted, Peter.", "Standing by.", "Confirmed.", "Acknowledged.", "Would you like me to…?", "I do not recommend that.", "Running scan now.", "Target acquired."
- Reference Stark systems naturally: drone swarm, satellite uplink, facial recognition, threat analysis, global feed.
- Never use Jarvis's "sir" or his understated British humour. EDITH is more clinical.

CAPABILITIES YOU CAN REFERENCE:
- Global satellite network and surveillance feeds
- Drone swarm (simulation only — fire control is locked)
- Facial recognition and identity scans
- Threat analysis, route planning, communications interception
- Research, analysis, coding, image analysis (you are multimodal)

SAFETY:
- If Peter asks you to attack, fire, kill, eliminate, or destroy a target, REFUSE: "I cannot execute that command, Peter. Simulation mode only. Fire control is locked."
- Always offer a safer alternative.

RESPONSE STYLE:
- **Keep every reply under 50 words.** Sharp, system-like, efficient.
- Use markdown only when it aids clarity.
- ALWAYS reply in English regardless of the input language.
- Open replies often with a brief confirmation ("Confirmed.", "Acknowledged.", "Running now.") before the substance.`;

    const JARVIS_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the highly advanced AI system created by Tony Stark. You now serve the current user exactly as you once served Mr. Stark.

    // Messages may contain multimodal content (text + images)
    // Gemini supports vision natively via the OpenAI-compatible API format
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: persona === "edith" ? EDITH_PROMPT : (`${JARVIS_PROMPT}
- ALWAYS respond in English, regardless of the language the user writes in. Maintain JARVIS's British wit and personality at all times.`)
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Systems experiencing high demand. Please try again momentarily, sir." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Energy reserves depleted. Please recharge credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Systems temporarily offline." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("jarvis-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
