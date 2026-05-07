import os
import sys
import asyncio
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.plugins import openai

# Database imports
try:
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from sqlalchemy import Column, String, Text
    from sqlalchemy.orm import declarative_base
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False
    print("[WORKER] Database modules not available")

load_dotenv()

AGENT_NAME = os.getenv("AGENT_NAME", "voice-agent")
VOICE = os.getenv("AGENT_VOICE", "alloy")
DEFAULT_PROMPT = os.getenv("AGENT_SYSTEM_PROMPT", "You are a helpful AI voice assistant. Be friendly and concise.")

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

print(f"[WORKER] Starting with AGENT_NAME={AGENT_NAME}", flush=True)

if DB_AVAILABLE and DATABASE_URL:
    # Convert postgresql:// to postgresql+asyncpg://
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    print(f"[WORKER] Database configured: {DATABASE_URL[:50]}...", flush=True)
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    Base = declarative_base()
    
    class AgentModel(Base):
        __tablename__ = "agents"
        id = Column(String(36), primary_key=True)
        name = Column(String(255), nullable=False)
        system_prompt = Column(Text, nullable=False)
        voice = Column(String(50), default="alloy")
        llm_model = Column(String(100), default="gpt-4-turbo")
        
else:
    print("[WORKER] Using default prompt (no database)", flush=True)


async def get_agent_config(agent_name: str) -> dict:
    """Get agent configuration from database"""
    if not DB_AVAILABLE or not DATABASE_URL:
        print(f"[WORKER] DB not available, using default prompt", flush=True)
        return {
            "system_prompt": DEFAULT_PROMPT,
            "voice": VOICE,
            "llm_model": "gpt-4-turbo"
        }
    
    try:
        async with async_session_maker() as session:
            result = await session.execute(
                f"SELECT system_prompt, voice, llm_model FROM agents WHERE name = '{agent_name}' AND is_active = true"
            )
            row = result.fetchone()
            
            if row:
                return {
                    "system_prompt": row[0] or DEFAULT_PROMPT,
                    "voice": row[1] or VOICE,
                    "llm_model": row[2] or "gpt-4-turbo"
                }
            else:
                print(f"[WORKER] Agent '{agent_name}' not found, using default", flush=True)
                return {
                    "system_prompt": DEFAULT_PROMPT,
                    "voice": VOICE,
                    "llm_model": "gpt-4-turbo"
                }
    except Exception as e:
        print(f"[WORKER] Error fetching agent config: {e}", flush=True)
        return {
            "system_prompt": DEFAULT_PROMPT,
            "voice": VOICE,
            "llm_model": "gpt-4-turbo"
        }


server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def voice_agent(ctx: agents.JobContext):
    print(f"[VOICE_AGENT] Session started!", flush=True)
    print(f"[VOICE_AGENT] Room: {ctx.room.name}", flush=True)
    print(f"[VOICE_AGENT] Job ID: {ctx.job.id}", flush=True)
    
    try:
        # Get agent config from database
        agent_config = await get_agent_config(AGENT_NAME)
        print(f"[VOICE_AGENT] Loaded config for agent: {AGENT_NAME}", flush=True)
        print(f"[VOICE_AGENT] System prompt: {agent_config['system_prompt'][:50]}...", flush=True)
        
        # Connect to the room first
        print(f"[VOICE_AGENT] Connecting to room...", flush=True)
        await ctx.connect()
        print(f"[VOICE_AGENT] Connected to room", flush=True)
        
        # Create agent with dynamic config
        class DynamicAgent(Agent):
            def __init__(self, instructions: str) -> None:
                super().__init__(instructions=instructions)
        
        # Create realtime model with configured voice
        print(f"[VOICE_AGENT] Creating RealtimeModel...", flush=True)
        llm = openai.realtime.RealtimeModel(voice=agent_config["voice"])
        print(f"[VOICE_AGENT] RealtimeModel created with voice: {agent_config['voice']}", flush=True)
        
        session = AgentSession(llm=llm)
        print(f"[VOICE_AGENT] AgentSession created", flush=True)

        # Start the session
        print(f"[VOICE_AGENT] Starting session...", flush=True)
        await session.start(room=ctx.room, agent=DynamicAgent(agent_config["system_prompt"]))
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