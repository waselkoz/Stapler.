import json
import os
from duckduckgo_search import DDGS
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import List

# Use your local Ollama model to generate the dataset
OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://global.prd.ga.run.brev.nvidia.com:44205/v1")
llm = ChatOpenAI(
    base_url=OLLAMA_URL,
    api_key="ollama",
    model="nemotron", # Using the incredibly smart Nemotron model
    temperature=0.7
)

# Structured Output for the dataset entries
class DatasetEntry(BaseModel):
    instruction: str = Field(description="The prompt asking about a specific business scenario or failure.")
    input: str = Field(description="Context about the business (can be empty).")
    output: str = Field(description="The highly detailed response explaining why it worked or failed based on real data.")

class DatasetOutput(BaseModel):
    entries: List[DatasetEntry]

def search_case_studies(query: str):
    print(f"Searching the web for: {query}")
    with DDGS() as ddgs:
        results = list(ddgs.text(query, max_results=3))
    
    context = "\n".join([f"Title: {r['title']}\nSnippet: {r['body']}" for r in results])
    return context

def generate_dataset_entries(niche: str):
    # 1. Search for successful and failed businesses in this niche
    fail_context = search_case_studies(f"{niche} startup failure postmortem case study")
    success_context = search_case_studies(f"{niche} startup success pivot strategy case study")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an elite Silicon Valley investor building a training dataset. Based on the real-world web search data, generate 3 highly detailed training examples in Instruction/Input/Output format. The 'instruction' should ask about a specific business idea. The 'output' MUST NOT be a generic roast. It must be a highly analytical breakdown of exactly WHERE this idea usually fails, WHY it fails, and a tactical strategy to ensure the idea does not fail."),
        ("human", "Web Data (Failures & Successes):\n{fail_context}\n\n{success_context}\n\nGenerate the dataset entries for the {niche} niche.")
    ])
    
    chain = prompt | llm.with_structured_output(DatasetOutput)
    
    print(f"Generating dataset entries for {niche}...")
    result = chain.invoke({
        "fail_context": fail_context,
        "success_context": success_context,
        "niche": niche
    })
    
    return [entry.dict() for entry in result.entries]

def main():
    niches = [
        "SaaS tools for real estate",
        "Direct to consumer ecommerce dropshipping",
        "AI productivity apps",
        "Local service marketplaces"
    ]
    
    all_entries = []
    
    # Load existing if available
    if os.path.exists("custom_dataset.json"):
        with open("custom_dataset.json", "r") as f:
            try:
                all_entries = json.load(f)
            except:
                pass

    for niche in niches:
        try:
            entries = generate_dataset_entries(niche)
            all_entries.extend(entries)
            print(f"Added {len(entries)} entries for {niche}!")
        except Exception as e:
            print(f"Error generating for {niche}: {e}")
            
    # Save the huge dataset
    with open("custom_dataset.json", "w") as f:
        json.dump(all_entries, f, indent=2)
        
    print(f"Dataset generation complete! Total entries: {len(all_entries)}")

if __name__ == "__main__":
    main()
