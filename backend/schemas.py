from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Landmark(BaseModel):
    x: float
    y: float
    z: float

class ClassificationRequest(BaseModel):
    landmarks: List[Landmark]

class ClassificationResponse(BaseModel):
    sign: str
    confidence: float
