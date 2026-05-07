import os
import sys
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.plugins import openai

load_dotenv()

AGENT_NAME = os.getenv("AGENT_NAME", "voice-agent")
SYSTEM_PROMPT = os.getenv("AGENT_SYSTEM_PROMPT", "You are a helpful AI voice assistant. Be friendly and concise.")
VOICE = os.getenv("AGENT_VOICE", "alloy")

print(f"[WORKER] Starting with AGENT_NAME={AGENT_NAME}", flush=True)
print(f"[WORKER] SYSTEM_PROMPT={SYSTEM_PROMPT[:50]}...", flush=True)


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)
        print(f"[ASSISTANT] Created with instructions: {SYSTEM_PROMPT[:50]}...", flush=True)


server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def voice_agent(ctx: agents.JobContext):
    print(f"[VOICE_AGENT] Session started!", flush=True)
    print(f"[VOICE_AGENT] Room: {ctx.room.name}", flush=True)
    print(f"[VOICE_AGENT] Job ID: {ctx.job.id}", flush=True)
    
    try:
        # Connect to the room first
        print(f"[VOICE_AGENT] Connecting to room...", flush=True)
        await ctx.connect()
        print(f"[VOICE_AGENT] Connected to room", flush=True)
        
        # Create agent session with realtime model
        print(f"[VOICE_AGENT] Creating RealtimeModel...", flush=True)
        llm = openai.realtime.RealtimeModel(voice=VOICE)
        print(f"[VOICE_AGENT] RealtimeModel created", flush=True)
        
        session = AgentSession(llm=llm)
        print(f"[VOICE_AGENT] AgentSession created", flush=True)

        # Start the session
        print(f"[VOICE_AGENT] Starting session...", flush=True)
        await session.start(room=ctx.room, agent=Assistant())
        print(f"[VOICE_AGENT] Session started!", flush=True)

        # Generate greeting
        print(f"[VOICE_AGENT] Generating reply...", flush=True)
        await session.generate_reply(
            instructions="Greet the user and offer your assistance."
        )
        print(f"[VOICE_AGENT] Reply sent!", flush=True)
        
    except Exception as e:
        print(f"[VOICE_AGENT] ERROR: {e}", flush=True)
        import traceback
        traceback.print_exc(file=sys.stdout)
        flush=True


if __name__ == "__main__":
    print(f"[WORKER] Starting voice-agent with name: {AGENT_NAME}", flush=True)
    agents.cli.run_app(server)