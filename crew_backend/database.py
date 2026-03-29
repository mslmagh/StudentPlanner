from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./partners.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Partner(Base):
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    course = Column(String, index=True)
    level = Column(String)
    time = Column(String)
    studyType = Column(String)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "course": self.course,
            "level": self.level,
            "time": self.time,
            "studyType": self.studyType
        }
