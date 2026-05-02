import os
import asyncio
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai


async def entrypoint(ctx: JobContext):
    await ctx.connect()

    # Get agent configuration from room metadata or env
    room_name = ctx.room.name
    agent_config = get_agent_config(room_name)
    
    initial_ctx = llm.ChatContext()
    initial_ctx.messages.append(
        llm.ChatMessage(
            role=llm.ChatRole.SYSTEM,
            content=agent_config["system_prompt"]
        )
    )

    agent = VoicePipelineAgent(
        vad=rtc.VAD.load(),
        stt=openai.STT.load(),
        llm=openai.LLM(
            model="gpt-4o-mini",
            temperature=0.7,
        ),
        tts=openai.TTS(
            voice=openai.TTSVoice(id=agent_config.get("voice", "alloy"),)
        ),
        chat_ctx=initial_ctx,
    )

    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant: rtc.RemoteParticipant):
        if track.kind == rtc.TrackKind.KIND_AUDIO:
            agent.start(ctx.room, participant)

    await agent.spawn(ctx.room)


def get_agent_config(room_name: str) -> dict:
    """Get agent configuration - can be extended to fetch from database"""
    # Default configuration
    return {
        "system_prompt": os.getenv("AGENT_SYSTEM_PROMPT", "You are a helpful AI assistant. Be friendly and concise."),
        "voice": os.getenv("AGENT_VOICE", "alloy"),
    }


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=None,
        )
    )
