from pydantic import BaseModel, Field
from typing import Optional

class AgentOutput(BaseModel):
    text: str

class PageOutput(BaseModel):
    filename: str
    html: str

class DeveloperOutput(BaseModel):
    pages: list[PageOutput] = Field(default_factory=list, description="List of pages generated")
    notes: str = ""

class QAItem(BaseModel):
    severity: str = "minor"
    page: str = ""
    component: str = ""
    issue: str = ""
    fix: str = ""

class QAOutput(BaseModel):
    scores: dict[str, int] = Field(default_factory=dict)
    average: float = 0.0
    approved: bool = False
    items: list[QAItem] = Field(default_factory=list)
    summary: str = ""

class StrategyOutput(BaseModel):
    business_overview: str = ""
    swot: str = ""
    priorities: list[str] = Field(default_factory=list)
    visual_direction: str = ""
    copy_strategy: str = ""
    raw: str = ""

class BrandingOutput(BaseModel):
    brand_essence: str = ""
    personality: str = ""
    tone_of_voice: str = ""
    color_palette: list[dict] = Field(default_factory=list)
    typography: str = ""
    raw: str = ""

class DesignOutput(BaseModel):
    design_philosophy: str = ""
    color_system: str = ""
    typography: str = ""
    layout: str = ""
    components: str = ""
    raw: str = ""

class GoodExample(BaseModel):
    url: str = ""
    domain: str = ""
    code: str = ""
    qa_score: float = 0.0
    tags: list[str] = Field(default_factory=list)
    timestamp: float = 0.0
