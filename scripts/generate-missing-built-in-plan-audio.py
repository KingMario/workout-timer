#!/usr/bin/env python3.11

import argparse
import asyncio
import json
from pathlib import Path

import edge_tts


DEFAULT_VOICE = "zh-CN-YunxiNeural"
SPOKEN_KINDS = {"section", "exercise", "exercise-name", "periodic-prompt"}


def load_missing_rows(audit_path: Path):
    audit = json.loads(audit_path.read_text(encoding="utf-8"))
    rows = audit.get("rows", [])
    return [
        row
        for row in rows
        if row.get("status") in {"missing", "matched"}
        and row.get("kind") in SPOKEN_KINDS
        and row.get("newFilename")
    ]


def spoken_text(row):
    text = row.get("matchedText") or row.get("name") or ""
    return text.strip()


async def generate_one(row, audio_dir: Path, voice: str, rate: str):
    text = spoken_text(row)
    if not text:
        return "skipped-empty", row.get("newFilename")

    output_path = audio_dir / row["newFilename"]
    if output_path.exists():
        return "skipped-existing", row["newFilename"]

    communicate = edge_tts.Communicate(text, voice=voice, rate=rate)
    await communicate.save(str(output_path))
    return "generated", row["newFilename"]


async def main():
    parser = argparse.ArgumentParser(
        description="Generate missing built-in workout MP3 assets from audit.json.",
    )
    parser.add_argument(
        "--audit",
        type=Path,
        default=Path("public/audio/built-in-plans/yunxi/audit.json"),
    )
    parser.add_argument(
        "--audio-dir",
        type=Path,
        default=Path("public/audio/built-in-plans/yunxi"),
    )
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument("--rate", default="+0%")
    args = parser.parse_args()

    rows = load_missing_rows(args.audit)
    counts = {}

    for index, row in enumerate(rows, start=1):
        status, filename = await generate_one(row, args.audio_dir, args.voice, args.rate)
        counts[status] = counts.get(status, 0) + 1
        print(f"[{index}/{len(rows)}] {status}: {filename}")

    print(json.dumps(counts, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
