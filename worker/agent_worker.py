import os
import sys
from livekit import rtc
from livekit.agents import (
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import openai

# Debug: print all env vars
print("[DEBUG] All env vars:", {k: v for k, v in os.environ.items() if 'AGENT' in k.upper() or 'LIVEKIT' in k.upper()})

async def entrypoint(ctx: JobContext):
    print(f"[AGENT] Room connected: {ctx.room.name}")
    
    agent_config = get_agent_config()
    
    initial_ctx = llm.ChatContext()
    initial_ctx.messages.append(
        llm.ChatMessage(
            role=llm.ChatRole.SYSTEM,
            content=agent_config["system_prompt"]
        )
    )

    agent = openai.realtime.RealtimeModel(
        instructions=agent_config["system_prompt"],
        voice=agent_config.get("voice", "alloy"),
    )

    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant: rtc.RemoteParticipant):
        print(f"[AGENT] Track subscribed from {participant.identity}")
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            agent.start(ctx.room, participant)

    await ctx.connect()


def get_agent_config() -> dict:
    return {
        "system_prompt": os.getenv("AGENT_SYSTEM_PROMPT", "You are a helpful AI assistant."),
        "voice": os.getenv("AGENT_VOICE", "alloy"),
    }


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
