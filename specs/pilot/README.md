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


{ "zn": 0.62, "orr": false }
pip install -r pilot/requirements.txt
uvicorn pilot.ingest_api:app --reload --port 8080
curl -X POST http://127.0.0.1:8080/ingest -H "Content-Type: application/json" \
-d '{"stream_id":"demo","ts":1734471000,"audio_f0":220,"audio_energy":0.73,"video_motion":0.41,"rolling_hash":"abc","symbols":["word:hello"]}'
### `pilot/requirements.txt`
### `pilot/zn_meter.py`
```python
# Minimal Z(n) "coherence" placeholder.
# Idea: higher stability + coupling across channels → higher zn.
# This will be replaced by the real lattice mapping later.

import numpy as np

def zn_score(audio_f0: float, audio_energy: float, video_motion: float, symbols: list[str]) -> float:
    # Normalize to [0,1] ranges
    f0 = np.tanh((audio_f0 or 0) / 400)            # ~0–400 Hz voice band → 0–0.76
    eng = np.clip(audio_energy or 0, 0.0, 1.0)
    mot = np.clip(video_motion or 0, 0.0, 1.0)

    # Symbol density: more consistent symbols → higher stability (toy heuristic)
    sym_density = np.clip(len(symbols or []) / 10.0, 0.0, 1.0)

    # Cross-channel coupling (if channels agree, reward)
    avg = (eng + mot) / 2
    coupling = 1.0 - abs(eng - mot)  # closer → higher

    # Blend (weights are placeholders)
    zn = 0.25*f0 + 0.3*avg + 0.25*coupling + 0.2*sym_density
    return float(np.clip(zn, 0.0, 1.0))

def orr_event(zn: float, threshold: float = 0.9) -> bool:
    return zn >= threshold