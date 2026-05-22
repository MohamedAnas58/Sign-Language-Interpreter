from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from .database import Base

class TranslationHistory(Base):
    __tablename__ = "translation_history"

    id = Column(Integer, primary_key=True, index=True)
    sign = Column(String, index=True)
    confidence = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
