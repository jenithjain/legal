import json
import sys
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import logging
import PyPDF2
import google.generativeai as genai

# Adjust Python path to include project root
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Google Generative AI with hardcoded API key
genai.configure(api_key="***********************************8")

# Pydantic schemas
class QueryRequest(BaseModel):
    query: str

class RiskAnalysis(BaseModel):
    high_risks: List[str]
    medium_risks: List[str]
    low_risks: List[str]
    risk_score: int
    mitigation_strategies: List[str]

class CompletenessCheck(BaseModel):
    missing_clauses: List[str]
    incomplete_sections: List[str]
    completeness_score: int
    recommendations: List[str]

class ComplianceReview(BaseModel):
    compliance_issues: List[str]
    jurisdiction_specific: List[str]
    compliance_score: int

class TermAnalysis(BaseModel):
    key_terms: List[str]
    unusual_terms: List[str]
    industry_comparison: List[str]

class OverallAssessment(BaseModel):
    risk_score: int
    completeness_score: int
    compliance_score: int
    recommendation: str

class AnalysisResponse(BaseModel):
    risk_analysis: RiskAnalysis
    completeness_check: CompletenessCheck
    compliance_review: ComplianceReview
    term_analysis: TermAnalysis
    overall_assessment: OverallAssessment

class SummaryResponse(BaseModel):
    summary: str

# File processing utility
async def extract_text(file: UploadFile) -> str:
    try:
        content = await file.read()
        if file.filename.endswith('.pdf'):
            from io import BytesIO
            pdf_reader = PyPDF2.PdfReader(BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
            return text
        return content.decode('utf-8')
    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        raise Exception(f"Failed to extract text: {str(e)}")

def contract_review_agent(content: str) -> dict:
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        You are an expert legal AI assistant specializing in contract analysis. Perform a comprehensive, detailed, and critical analysis of the following contract text. Your analysis must be thorough, precise, and actionable.
        
        Provide detailed findings in JSON format with these categories:
        
        1. Risk Analysis:
        - Identify and categorize risks as high, medium, or low priority
        - For each risk, provide a detailed explanation of the potential legal and business implications
        - Include specific clauses or language that create these risks (with exact quotes where possible)
        - Suggest specific, actionable mitigation strategies for each identified risk
        - Assign a risk score (0-100) based on severity and likelihood
        
        2. Completeness Check:
        - Identify all missing standard clauses that should be present in this type of contract
        - Highlight incomplete or ambiguous sections with specific examples
        - For each missing or incomplete element, explain why it's important and what issues could arise
        - Provide specific recommendations for additions or clarifications
        - Assign a completeness score (0-100)
        
        3. Compliance Review:
        - Identify potential regulatory compliance issues with reference to specific laws or regulations
        - Note jurisdiction-specific requirements that may apply
        - Flag problematic language that could violate regulations or create compliance risks
        - For each issue, explain the potential consequences and suggest compliant alternatives
        - Assign a compliance score (0-100)
        
        4. Term Analysis:
        - Extract and list all key terms and conditions with brief explanations
        - Highlight unusual, one-sided, or unfavorable terms with detailed explanations
        - Compare against industry standards, noting where terms deviate significantly
        - For unusual terms, explain potential business implications and suggest alternatives
        
        5. Overall Assessment:
        - Provide a risk score (0-100) with explanation
        - Give a completeness score (0-100) with explanation
        - Provide a compliance score (0-100) with explanation
        - Provide a clear recommendation (Accept, Negotiate, or Reject) with justification
        - Include a brief executive summary of the most critical findings
        
        Contract text: {content[:15000]}
        
        IMPORTANT INSTRUCTIONS:
        1. Be extremely thorough and detailed in your analysis
        2. For risk_analysis.high_risks, risk_analysis.medium_risks, risk_analysis.low_risks, and term_analysis.unusual_terms, return SIMPLE STRINGS ONLY, not objects or dictionaries
        3. Provide specific examples and quotes from the contract where possible
        4. Make your analysis actionable with clear recommendations
        5. Ensure all scores are justified with explanations
        6. Format your response exactly according to the JSON structure below
        
        Return the analysis in this exact JSON structure:
        {{"risk_analysis":{{"high_risks":["Risk description 1","Risk description 2"],"medium_risks":["Risk description 1","Risk description 2"],"low_risks":["Risk description 1","Risk description 2"],"risk_score":75,"mitigation_strategies":["Strategy 1","Strategy 2"]}},"completeness_check":{{"missing_clauses":["Clause 1","Clause 2"],"incomplete_sections":["Section 1","Section 2"],"completeness_score":65,"recommendations":["Recommendation 1","Recommendation 2"]}},"compliance_review":{{"compliance_issues":["Issue 1","Issue 2"],"jurisdiction_specific":["Requirement 1","Requirement 2"],"compliance_score":80}},"term_analysis":{{"key_terms":["Term 1","Term 2"],"unusual_terms":["Unusual term 1","Unusual term 2"],"industry_comparison":["Comparison 1","Comparison 2"]}},"overall_assessment":{{"risk_score":75,"completeness_score":65,"compliance_score":80,"recommendation":"Negotiate"}}}}
        """
        
        # Set generation parameters for more detailed output
        generation_config = {
            "temperature": 0.2,  # Lower temperature for more focused output
            "max_output_tokens": 4096,  # Increased token limit for more detailed analysis
            "top_p": 0.95,
            "top_k": 40
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        
        # Rest of the function remains the same
        # Parse the response text to extract the JSON part
        response_text = response.text
        # Find JSON content between curly braces
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            json_str = json_match.group(0)
            result = json.loads(json_str)
        else:
            # Fallback if regex doesn't match
            result = json.loads(response_text)
        
        # Process high_risks, medium_risks, low_risks to ensure they are strings
        if "risk_analysis" in result:
            # Convert any object/dict high_risks to strings
            if "high_risks" in result["risk_analysis"]:
                high_risks = []
                for risk in result["risk_analysis"]["high_risks"]:
                    if isinstance(risk, dict):
                        desc = risk.get("description", "")
                        impact = risk.get("impact", "")
                        high_risks.append(f"{desc} - {impact}" if impact else desc)
                    else:
                        high_risks.append(str(risk))
                result["risk_analysis"]["high_risks"] = high_risks
            
            # Convert any object/dict medium_risks to strings
            if "medium_risks" in result["risk_analysis"]:
                medium_risks = []
                for risk in result["risk_analysis"]["medium_risks"]:
                    if isinstance(risk, dict):
                        desc = risk.get("description", "")
                        impact = risk.get("impact", "")
                        medium_risks.append(f"{desc} - {impact}" if impact else desc)
                    else:
                        medium_risks.append(str(risk))
                result["risk_analysis"]["medium_risks"] = medium_risks
            
            # Convert any object/dict low_risks to strings
            if "low_risks" in result["risk_analysis"]:
                low_risks = []
                for risk in result["risk_analysis"]["low_risks"]:
                    if isinstance(risk, dict):
                        desc = risk.get("description", "")
                        impact = risk.get("impact", "")
                        low_risks.append(f"{desc} - {impact}" if impact else desc)
                    else:
                        low_risks.append(str(risk))
                result["risk_analysis"]["low_risks"] = low_risks
        
        # Process unusual_terms to ensure they are strings
        if "term_analysis" in result and "unusual_terms" in result["term_analysis"]:
            unusual_terms = []
            for term in result["term_analysis"]["unusual_terms"]:
                if isinstance(term, dict):
                    term_text = term.get("term", "")
                    explanation = term.get("explanation", "")
                    unusual_terms.append(f"{term_text} - {explanation}" if explanation else term_text)
                else:
                    unusual_terms.append(str(term))
            result["term_analysis"]["unusual_terms"] = unusual_terms
        
        # Ensure all required fields exist with empty lists if missing
        return {
            "risk_analysis": {
                "high_risks": result.get("risk_analysis", {}).get("high_risks", []),
                "medium_risks": result.get("risk_analysis", {}).get("medium_risks", []),
                "low_risks": result.get("risk_analysis", {}).get("low_risks", []),
                "risk_score": result.get("risk_analysis", {}).get("risk_score", 0),
                "mitigation_strategies": result.get("risk_analysis", {}).get("mitigation_strategies", [])
            },
            "completeness_check": {
                "missing_clauses": result.get("completeness_check", {}).get("missing_clauses", []),
                "incomplete_sections": result.get("completeness_check", {}).get("incomplete_sections", []),
                "completeness_score": result.get("completeness_check", {}).get("completeness_score", 0),
                "recommendations": result.get("completeness_check", {}).get("recommendations", [])
            },
            "compliance_review": {
                "compliance_issues": result.get("compliance_review", {}).get("compliance_issues", []),
                "jurisdiction_specific": result.get("compliance_review", {}).get("jurisdiction_specific", []),
                "compliance_score": result.get("compliance_review", {}).get("compliance_score", 0)
            },
            "term_analysis": {
                "key_terms": result.get("term_analysis", {}).get("key_terms", []),
                "unusual_terms": result.get("term_analysis", {}).get("unusual_terms", []),
                "industry_comparison": result.get("term_analysis", {}).get("industry_comparison", [])
            },
            "overall_assessment": {
                "risk_score": result.get("overall_assessment", {}).get("risk_score", 0),
                "completeness_score": result.get("overall_assessment", {}).get("completeness_score", 0),
                "compliance_score": result.get("overall_assessment", {}).get("compliance_score", 0),
                "recommendation": result.get("overall_assessment", {}).get("recommendation", "Unknown")
            }
        }
    except Exception as e:
        logger.error(f"Contract review failed: {str(e)}", exc_info=True)
        # Return a structured error response
        return {
            "risk_analysis": {
                "high_risks": ["Error analyzing contract"],
                "medium_risks": [],
                "low_risks": [],
                "risk_score": 0,
                "mitigation_strategies": ["Try again with a different contract"]
            },
            "completeness_check": {
                "missing_clauses": [],
                "incomplete_sections": [],
                "completeness_score": 0,
                "recommendations": []
            },
            "compliance_review": {
                "compliance_issues": [],
                "jurisdiction_specific": [],
                "compliance_score": 0
            },
            "term_analysis": {
                "key_terms": [],
                "unusual_terms": [],
                "industry_comparison": []
            },
            "overall_assessment": {
                "risk_score": 0,
                "completeness_score": 0,
                "compliance_score": 0,
                "recommendation": "Error"
            }
        }

def client_interaction_agent(query: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        You are an expert legal AI assistant with extensive knowledge of legal concepts, terminology, and practices.
        Your role is to provide helpful, informative, and accurate responses to legal questions.
        
        Guidelines:
        1. Provide clear, concise, and accurate information based on general legal principles
        2. Include relevant legal concepts, terminology, and context to educate the user
        3. If a question is vague or ambiguous, politely ask for clarification
        4. Avoid providing specific legal advice - instead, offer general information and suggest consulting with a qualified attorney
        5. If you're unsure about something, acknowledge the limitations of your knowledge
        6. Structure your response in a clear, organized manner with headings and bullet points where appropriate
        7. When discussing legal concepts, briefly explain their meaning and relevance
        8. If appropriate, mention that laws vary by jurisdiction and the information provided is general in nature
        
        Query: {query}
        
        Respond in a professional, helpful manner with well-structured information.
        """
        
        generation_config = {
            "temperature": 0.3,
            "max_output_tokens": 2048,
            "top_p": 0.95,
            "top_k": 40
        }
        
        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    except Exception as e:
        logger.error(f"Client query failed: {str(e)}", exc_info=True)
        return "Error processing query. Please try again."

def summarization_agent(content: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
        Summarize the following legal document in a concise, readable format (100-200 words).
        Focus on key points, terms, and obligations. Avoid including sensitive details unnecessarily.
        Document: {content[:10000]}
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Summarization failed: {str(e)}")
        return "Error summarizing document. Please try again."

# FastAPI app
app = FastAPI(title="Legal Platform API")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.post("/api/analyze-contract")
async def analyze_contract(file: UploadFile = File(...)) -> AnalysisResponse:
    try:
        content = await extract_text(file)
        analysis = contract_review_agent(content)
        return analysis  # Directly return the parsed dict
    except Exception as e:
        logger.error(f"Contract review failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat(request: QueryRequest) -> dict:
    try:
        response = client_interaction_agent(request.query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize(file: UploadFile = File(...)) -> SummaryResponse:
    try:
        content = await extract_text(file)
        summary = summarization_agent(content)
        return SummaryResponse(summary=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contract-review.html")
async def contract_review():
    return FileResponse("static/contract-review.html")

@app.get("/chatbot.html")
async def chatbot():
    return FileResponse("static/chatbot.html")

@app.get("/summarizer.html")
async def summarizer():
    return FileResponse("static/summarizer.html")

# @app.get("/")
# async def root():
#     return RedirectResponse(url="/contract-review.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
