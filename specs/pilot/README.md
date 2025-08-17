# Pilot: Z(n) Coherence & ORR Detection

This folder holds the minimal pilot for the livestream miner.

## Components
- **ingest_api.py** — tiny FastAPI endpoint that receives rolling hashes + A/V features + provisional Z(n) score.
- **zn_meter.py** — placeholder Z(n) coherence score from simple signal stats (std/entropy/correlation).
- **requirements.txt** — libs to run the API.

## Data shape (JSON)
```json
{
  "stream_id": "string",
  "ts": 1734471000,
  "audio_f0": 220.0,
  "audio_energy": 0.73,
  "video_motion": 0.41,
  "rolling_hash": "abc123...",
  "symbols": ["word:hello","edge:face","emoji:✨"]
}