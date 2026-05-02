import os
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.plugins import openai

load_dotenv()

AGENT_NAME = os.getenv("AGENT_NAME", "voice-agent")
SYSTEM_PROMPT = os.getenv("AGENT_SYSTEM_PROMPT", "You are a helpful AI voice assistant. Be friendly and concise.")
VOICE = os.getenv("AGENT_VOICE", "alloy")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)


server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def voice_agent(ctx: agents.JobContext):
    print(f"[VOICE_AGENT] Session started for room: {ctx.room.name}")
    print(f"[VOICE_AGENT] Job ID: {ctx.job.id}")
    
    try:
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                voice=VOICE,
            )
        )

        print(f"[VOICE_AGENT] Starting session...")
        await session.start(
            room=ctx.room,
            agent=Assistant(),
        )
        print(f"[VOICE_AGENT] Session started successfully")

        print(f"[VOICE_AGENT] Generating greeting...")
        await session.generate_reply(
            instructions="Greet the user and offer your assistance."
        )
        print(f"[VOICE_AGENT] Greeting sent")
        
    except Exception as e:
        print(f"[VOICE_AGENT] ERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print(f"[WORKER] Starting voice-agent with name: {AGENT_NAME}")
    agents.cli.run_app(server)
