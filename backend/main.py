from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database, asl_rules

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Sign Language Interpreter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sign Language Interpreter API"}

@app.post("/api/classify", response_model=schemas.ClassificationResponse)
def classify_landmarks(request: schemas.ClassificationRequest, db: Session = Depends(database.get_db)):
    # Convert Pydantic models to dicts/objects that asl_rules expects
    landmarks = request.landmarks
    
    # Classify the sign
    sign, confidence = asl_rules.classify_asl(landmarks)
    
    # Save to history if it's a valid sign
    if sign != "Unknown":
        history_entry = models.TranslationHistory(sign=sign, confidence=confidence)
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        
    return schemas.ClassificationResponse(sign=sign, confidence=confidence)

@app.get("/api/history")
def get_history(skip: int = 0, limit: int = 10, db: Session = Depends(database.get_db)):
    history = db.query(models.TranslationHistory).order_by(models.TranslationHistory.timestamp.desc()).offset(skip).limit(limit).all()
    return history

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
