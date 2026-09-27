import json
import os
from duckduckgo_search import DDGS
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List

# Connect to the remote Brev Ollama server
OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://global.prd.ga.run.brev.nvidia.com:44205/v1")
llm = ChatOpenAI(
    base_url=OLLAMA_URL,
    api_key="ollama",
    model="nemotron",
    temperature=0.7
)

class DatasetEntry(BaseModel):
    instruction: str = Field(description="The prompt asking how to design a specific component or app using elite design principles.")
    input: str = Field(description="Context about the brand or design challenge (can be empty).")
    output: str = Field(description="Highly detailed breakdown of why the UX/UI works, including typography, spacing, color psychology, and how to replicate it.")

class DatasetOutput(BaseModel):
    entries: List[DatasetEntry]

def search_ux_case_studies(brand: str):
    print(f"Searching the web for UX case studies on: {brand}")
    with DDGS() as ddgs:
        results = list(ddgs.text(f"{brand} UX UI design system case study analysis", max_results=3))
    
    context = "\n".join([f"Title: {r['title']}\nSnippet: {r['body']}" for r in results])
    return context

def generate_ux_dataset_entries(brand: str):
    context = search_ux_case_studies(brand)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an elite Silicon Valley Design Engineer building a training dataset. Based on the real-world web search data, generate 3 highly detailed training examples in Instruction/Input/Output format. The 'instruction' should ask how to apply a specific design pattern from the target brand. The 'output' MUST NOT be generic. It must be a highly analytical breakdown of exactly WHY the brand's UX/UI is successful, focusing on restraint, typography, soft shadows, borders, and how to replicate it for high conversion."),
        ("human", "Web Data on {brand}'s Design System:\n{context}\n\nGenerate the dataset entries focusing on {brand}'s elite UX/UI.")
    ])
    
    chain = prompt | llm.with_structured_output(DatasetOutput)
    
    print(f"Generating UX dataset entries for {brand}...")
    result = chain.invoke({
        "context": context,
        "brand": brand
    })
    
    return [entry.dict() for entry in result.entries]

def main():
    brands = [
        "Stripe",
        "Vercel",
        "Linear (Issue Tracker)",
        "Airbnb",
        "Apple"
    ]
    
    all_entries = []
    
    # Load the existing dataset so we can append to it
    if os.path.exists("custom_dataset.json"):
        with open("custom_dataset.json", "r") as f:
            try:
                all_entries = json.load(f)
                print(f"Loaded {len(all_entries)} existing entries.")
            except:
                pass

    for brand in brands:
        try:
            entries = generate_ux_dataset_entries(brand)
            all_entries.extend(entries)
            print(f"Added {len(entries)} UX entries for {brand}!")
        except Exception as e:
            print(f"Error generating for {brand}: {e}")
            
    # Save the enriched dataset
    with open("custom_dataset.json", "w") as f:
        json.dump(all_entries, f, indent=2)
        
    print(f"Dataset generation complete! Total entries is now: {len(all_entries)}")

if __name__ == "__main__":
    main()
