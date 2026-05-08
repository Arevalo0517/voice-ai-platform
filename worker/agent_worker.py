import os
import sys
import asyncio
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.plugins import openai

# Try to import ElevenLabs plugin
try:
    from livekit.plugins import elevenlabs as elevenlabs_plugin
    ELEVENLABS_AVAILABLE = True
    print("[WORKER] ElevenLabs plugin available", flush=True)
except ImportError:
    ELEVENLABS_AVAILABLE = False
    print("[WORKER] ElevenLabs plugin not available", flush=True)

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
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")

print(f"[WORKER] Starting with AGENT_NAME={AGENT_NAME}", flush=True)

if DB_AVAILABLE and DATABASE_URL:
    # Convert postgresql:// to postgresql+asyncpg://
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    # Remove sslmode=require from URL (asyncpg handles SSL differently)
    DATABASE_URL = DATABASE_URL.split("?")[0]
    
    print(f"[WORKER] Database configured: {DATABASE_URL[:50]}...", flush=True)
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    Base = declarative_base()
    
    class AgentModel(Base):
        __tablename__ = "agents"
        id = Column(String(36), primary_key=True)
        name = Column(String(255), nullable=False)
        system_prompt = Column(Text, nullable=False)
        voice = Column(String(255), default="alloy")  # Extended to support longer voice IDs
        llm_provider = Column(String(50), default="openai")  # openai, anthropic, google, elevenlabs
        llm_model = Column(String(100), default="gpt-4-turbo")
        
else:
    print("[WORKER] Using default prompt (no database)", flush=True)


def is_elevenlabs_voice(voice: str) -> bool:
    """Check if the voice is an ElevenLabs voice"""
    if not voice:
        return False
    # ElevenLabs voice IDs are typically long alphanumeric strings (UUIDs)
    # They don't match standard OpenAI voice names
    openai_voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
    if voice.lower() in openai_voices:
        return False
    # If it's not a standard OpenAI voice, check if it's a valid ElevenLabs voice ID
    # ElevenLabs IDs are typically 36 characters (UUID format) or longer
    if len(voice) >= 20 and not voice.startswith("elevenlabs:"):
        return True  # Likely an ElevenLabs voice ID
    return voice.startswith("elevenlabs:") or voice.startswith("elevenlabs_")


def is_elevenlabs_provider(llm_provider: str) -> bool:
    """Check if the LLM provider indicates ElevenLabs voice"""
    if not llm_provider:
        return False
    return llm_provider.lower() in ["elevenlabs", "11labs"]


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
            from sqlalchemy import text
            query = text(f"SELECT system_prompt, voice, llm_provider, llm_model FROM agents WHERE name = :name AND is_active = true")
            result = await session.execute(query, {"name": agent_name})
            row = result.fetchone()
            
            if row:
                voice_id = row[1] or VOICE
                llm_provider = row[2]
                # Check both provider type and voice ID for ElevenLabs
                is_eleven = is_elevenlabs_provider(llm_provider) or is_elevenlabs_voice(voice_id)
                print(f"[WORKER] Found agent '{agent_name}' in DB!", flush=True)
                print(f"[WORKER] Voice: {voice_id}, Provider: {llm_provider}, Is ElevenLabs: {is_eleven}", flush=True)
                return {
                    "system_prompt": row[0] or DEFAULT_PROMPT,
                    "voice": voice_id,
                    "llm_provider": llm_provider,
                    "llm_model": row[3] or "gpt-4-turbo",
                    "is_elevenlabs": is_eleven
                }
            else:
                print(f"[WORKER] Agent '{agent_name}' NOT FOUND in DB, using default", flush=True)
                print(f"[WORKER] Available agents in DB:", flush=True)
                result2 = await session.execute(text("SELECT name FROM agents"))
                for r in result2:
                    print(f"  - {r[0]}", flush=True)
                return {
                    "system_prompt": DEFAULT_PROMPT,
                    "voice": VOICE,
                    "llm_model": "gpt-4-turbo",
                    "is_elevenlabs": False
                }
    except Exception as e:
        print(f"[WORKER] Error fetching agent config: {e}", flush=True)
        return {
            "system_prompt": DEFAULT_PROMPT,
            "voice": VOICE,
            "llm_model": "gpt-4-turbo",
            "is_elevenlabs": False
        }


def create_realtime_model(voice: str, is_elevenlabs: bool):
    """Create the appropriate realtime model based on voice type"""
    if is_elevenlabs and ELEVENLABS_AVAILABLE and ELEVENLABS_API_KEY:
        # Clean the voice ID (remove prefix if present)
        voice_id = voice.replace("elevenlabs:", "").replace("elevenlabs_", "")
        print(f"[WORKER] Creating ElevenLabs RealtimeModel with voice: {voice_id}", flush=True)
        return openai.realtime.RealtimeModel(
            voice="elevenlabs",
            model="elevenlabs/eleven_turbo_2"
        )
    else:
        # Use standard OpenAI voice
        print(f"[WORKER] Creating OpenAI RealtimeModel with voice: {voice}", flush=True)
        return openai.realtime.RealtimeModel(voice=voice)


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
        print(f"[VOICE_AGENT] Voice: {agent_config['voice']}", flush=True)
        print(f"[VOICE_AGENT] Is ElevenLabs: {agent_config.get('is_elevenlabs', False)}", flush=True)
        
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
        llm = create_realtime_model(
            agent_config["voice"],
            agent_config.get("is_elevenlabs", False)
        )
        print(f"[VOICE_AGENT] RealtimeModel created successfully", flush=True)
        
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


if __name__ == "__main__":
    print(f"[WORKER] Starting voice-agent with name: {AGENT_NAME}", flush=True)
    print(f"[WORKER] ElevenLabs available: {ELEVENLABS_AVAILABLE}", flush=True)
    agents.cli.run_app(server)
