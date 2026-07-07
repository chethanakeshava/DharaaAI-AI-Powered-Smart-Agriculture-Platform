from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
import os
import joblib
import requests
import numpy as np

from fastapi.middleware.cors import CORSMiddleware

import logging
import traceback

logger = logging.getLogger("ml_api")
logger.setLevel(logging.DEBUG)
_handler = logging.StreamHandler()
_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger.addHandler(_handler)

# Primary crop prediction model (used by /predict)
MODEL_URL = "https://cdn.builder.io/o/assets%2F5680a15109244889a620a2ce16c108ae%2F6b5ca8cd82b04a098b4f70a09b086348?alt=media&token=b16ee6e3-778d-41c1-a621-da68541e0056&apiKey=5680a15109244889a620a2ce16c108ae"

# Fertilizer recommendation model (used by /predict-fertilizer)
FERTILIZER_MODEL_URL = "https://cdn.builder.io/o/assets%2F5680a15109244889a620a2ce16c108ae%2Fa03c445586a54e37a5050d494a71ae25?alt=media&token=6c4054a9-8e0b-4570-8f05-c8dfb5c7c8b2&apiKey=5680a15109244889a620a2ce16c108ae"

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE_DIR, "models")
CROP_MODEL_PATH = os.path.join(MODEL_DIR, "crop_prediction_model.pkl")
FERTILIZER_MODEL_PATH = os.path.join(MODEL_DIR, "fertilizer_prediction_model.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)


def _download(url: str, path: str):
    if not os.path.exists(path):
        logger.info(f"Downloading model from {url} to {path}...")
        r = requests.get(url, stream=True, timeout=60)
        r.raise_for_status()
        with open(path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        logger.info("Download complete.")


model = None
fertilizer_model = None

# Load local pre-trained models if available
try:
    if os.path.exists(CROP_MODEL_PATH):
        model = joblib.load(CROP_MODEL_PATH)
        logger.info("Loaded crop prediction model from local file")
    else:
        logger.warning("Crop model file not found, using fallback predictions")
    
    if os.path.exists(FERTILIZER_MODEL_PATH):
        fertilizer_model = joblib.load(FERTILIZER_MODEL_PATH)
        logger.info("Loaded fertilizer prediction model from local file")
    else:
        logger.warning("Fertilizer model file not found, using fallback predictions")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    model = None
    fertilizer_model = None

app = FastAPI(title="DharaaAI ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')

    nitrogen: float = Field(..., description="Nitrogen content in soil")
    phosphorus: float = Field(..., description="Phosphorus content in soil")
    potassium: float = Field(..., description="Potassium content in soil")
    temperature: float = Field(..., description="Temperature in celsius")
    humidity: float = Field(..., description="Humidity percentage")
    ph: float = Field(..., description="Soil pH value")
    rainfall: float = Field(..., description="Rainfall in mm")
    season: str = Field(default="kharif", description="Season (kharif/rabi/zaid)")


class FertilizerPredictRequest(BaseModel):
    model_config = ConfigDict(extra='allow')

    nitrogen: float = Field(..., description="Nitrogen content in soil")
    phosphorus: float = Field(..., description="Phosphorus content in soil")
    potassium: float = Field(..., description="Potassium content in soil")
    temperature: float = Field(default=25, description="Temperature in celsius")
    humidity: float = Field(default=65, description="Humidity percentage")
    ph: float = Field(default=6.5, description="Soil pH value")
    rainfall: float = Field(default=100, description="Rainfall in mm")
    season: str = Field(default="kharif", description="Season (kharif/rabi/zaid)")
    crop: str = Field(default="General", description="Crop name")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/models")
def models_status():
    return {
        "crop_model_loaded": model is not None,
        "fertilizer_model_loaded": fertilizer_model is not None,
    }


def get_fallback_crop_prediction(req: PredictRequest):
    """Fallback crop prediction using simple rules when model is unavailable."""
    season_lower = req.season.lower() if isinstance(req.season, str) else "kharif"
    
    # Simple rule-based crop recommendation
    crops = []
    
    # Rice: needs high water, warm temp
    if req.rainfall >= 800 and req.temperature >= 20 and season_lower in ["kharif", "monsoon"]:
        crops.append(("Rice", 0.85))
    
    # Wheat: winter crop, low water needs
    if req.temperature <= 25 and season_lower in ["rabi", "winter"]:
        crops.append(("Wheat", 0.80))
    
    # Maize: moderate water, warm temp
    if req.rainfall >= 400 and req.temperature >= 15 and req.temperature <= 30:
        crops.append(("Maize", 0.75))
    
    # Cotton: warm, moderate water
    if req.temperature >= 21 and req.rainfall >= 400 and season_lower in ["kharif", "summer"]:
        crops.append(("Cotton", 0.70))
    
    # Sugarcane: high water, long season
    if req.rainfall >= 1000 and req.temperature >= 18:
        crops.append(("Sugarcane", 0.75))
    
    # Chickpea: winter, low water
    if req.temperature <= 25 and req.rainfall <= 400 and season_lower in ["rabi", "winter"]:
        crops.append(("Chickpea", 0.70))
    
    # Default recommendations
    if not crops:
        if req.temperature >= 25:
            crops.append(("Maize", 0.60))
        else:
            crops.append(("Wheat", 0.60))
    
    # Sort by confidence
    crops.sort(key=lambda x: x[1], reverse=True)
    
    return {
        "predictions": [
            {"crop": crop, "confidence": round(conf * 100, 1)}
            for crop, conf in crops[:3]
        ],
        "fallback": True
    }


@app.post("/predict")
def predict(req: PredictRequest):
    try:
        if model is None:
            logger.info("Using fallback crop prediction")
            return get_fallback_crop_prediction(req)
        
        # Use loaded model
        season_map = {"kharif": 0, "rabi": 1, "zaid": 2}
        season_code = season_map.get(req.season.lower(), 0) if isinstance(req.season, str) else 0

        features = [
            req.nitrogen,
            req.phosphorus,
            req.potassium,
            req.temperature,
            req.ph,
            req.rainfall,
            season_code,
        ]

        import numpy as np
        X = np.asarray(features, dtype=float).reshape(1, -1)

        try:
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(X)
                classes = getattr(model, "classes_", None)
                top_idx = probs.argmax(axis=1)[0]
                pred = classes[top_idx] if classes is not None else str(top_idx)
                conf = float(probs[0, top_idx])
                return {"predictions": [{"crop": str(pred), "confidence": round(conf * 100, 1)}]}
            else:
                pred = model.predict(X)[0]
                return {"predictions": [{"crop": str(pred), "confidence": 80.0}]}
        except Exception as e:
            tb = traceback.format_exc()
            logger.warning(f"Model prediction failed, using fallback: {e}\n{tb}")
            return get_fallback_crop_prediction(req)
    except Exception as e:
        tb = traceback.format_exc()
        logger.exception("Unexpected error in /predict\n%s", tb)
        raise HTTPException(status_code=500, detail=str(e))


def get_fallback_fertilizer_prediction(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    crop: str = "General"
):
    """Fallback fertilizer recommendation using simple rules."""
    # Base N-P-K recommendations for common crops
    recommendations = {
        "rice": {"n": 80, "p": 40, "k": 40, "name": "NPK 20:10:10"},
        "wheat": {"n": 120, "p": 60, "k": 40, "name": "NPK 10:26:26"},
        "maize": {"n": 150, "p": 60, "k": 60, "name": "NPK 10:26:26"},
        "sugarcane": {"n": 150, "p": 80, "k": 100, "name": "NPK 10:26:26"},
        "cotton": {"n": 100, "p": 60, "k": 60, "name": "NPK 20:20:0"},
        "groundnut": {"n": 25, "p": 50, "k": 40, "name": "DAP + MOP"},
        "soybean": {"n": 0, "p": 50, "k": 40, "name": "DAP + MOP"},
        "chickpea": {"n": 20, "p": 50, "k": 40, "name": "DAP + MOP"},
        "potato": {"n": 100, "p": 80, "k": 120, "name": "NPK 20:20:0"},
        "tomato": {"n": 100, "p": 50, "k": 50, "name": "NPK 10:52:34"},
        "onion": {"n": 80, "p": 60, "k": 40, "name": "NPK 10:26:26"},
        "banana": {"n": 80, "p": 40, "k": 100, "name": "NPK 8:24:24"},
        "mango": {"n": 60, "p": 40, "k": 60, "name": "NPK 10:26:26"},
    }

    crop_lower = crop.lower() if isinstance(crop, str) else "general"
    rec = recommendations.get(crop_lower, {"n": 100, "p": 50, "k": 50, "name": "NPK 10:26:26"})

    # Calculate actual dose needed based on soil NPK levels
    current_npk = nitrogen + phosphorus + potassium

    # Adjust recommended dose based on current soil levels
    if current_npk > 200:
        dose_adjustment = 0.7  # High nutrients in soil, lower dose
    elif current_npk > 150:
        dose_adjustment = 0.85
    else:
        dose_adjustment = 1.0  # Low nutrients, full dose needed

    total_dose = int((rec["n"] + rec["p"] + rec["k"]) * dose_adjustment)

    return {
        "predictions": [{
            "fertilizer": rec["name"],
            "dose": total_dose,
            "dosage": f"{total_dose} kg/ha",
            "confidence": 78.0,
            "benefits": [
                "Balanced nutrient supply",
                "Improved crop yield",
                "Better soil health",
                "Efficient nutrient uptake"
            ],
            "applicationMethod": "Broadcasting or banding with incorporation",
            "timing": "Apply in split doses during growth stages"
        }],
        "fallback": True
    }


@app.post("/predict-fertilizer")
def predict_fertilizer(req: FertilizerPredictRequest):
    try:
        # Extract crop name if provided
        crop_name = getattr(req, 'crop', 'General')

        if fertilizer_model is None:
            logger.info("Using fallback fertilizer prediction")
            return get_fallback_fertilizer_prediction(
                req.nitrogen,
                req.phosphorus,
                req.potassium,
                crop_name
            )

        # Use loaded model
        season_map = {"kharif": 0, "rabi": 1, "zaid": 2, "summer": 0, "winter": 1, "monsoon": 0}
        season_code = season_map.get(req.season.lower(), 0) if isinstance(req.season, str) else 0

        features = [
            req.nitrogen,
            req.phosphorus,
            req.potassium,
            req.temperature,
            req.humidity,
            req.ph,
            req.rainfall,
            season_code,
        ]

        import numpy as np
        X = np.asarray(features, dtype=float).reshape(1, -1)

        try:
            predictions = []

            if hasattr(fertilizer_model, "predict_proba"):
                probs = fertilizer_model.predict_proba(X)
                classes = getattr(fertilizer_model, "classes_", None)

                # Get top predictions
                top_indices = np.argsort(probs[0])[-3:][::-1]

                for idx in top_indices:
                    pred = classes[idx] if classes is not None else str(idx)
                    conf = float(probs[0, idx])
                    predictions.append({
                        "fertilizer": str(pred),
                        "confidence": round(conf * 100, 1)
                    })
            else:
                pred = fertilizer_model.predict(X)[0]
                try:
                    dose = float(pred)
                    predictions.append({
                        "fertilizer": "Recommended Mix",
                        "dose": int(dose),
                        "dosage": f"{int(dose)} kg/ha",
                        "confidence": 85.0
                    })
                except Exception:
                    predictions.append({
                        "fertilizer": str(pred),
                        "confidence": 80.0
                    })

            if not predictions:
                return get_fallback_fertilizer_prediction(
                    req.nitrogen,
                    req.phosphorus,
                    req.potassium,
                    crop_name
                )

            return {"predictions": predictions}
        except Exception as e:
            tb = traceback.format_exc()
            logger.warning(f"Fertilizer model prediction failed, using fallback: {e}\n{tb}")
            return get_fallback_fertilizer_prediction(
                req.nitrogen,
                req.phosphorus,
                req.potassium,
                crop_name
            )
    except Exception as e:
        tb = traceback.format_exc()
        logger.exception("Unexpected error in /predict-fertilizer\n%s", tb)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
