import fitz  # PyMuPDF
from fastapi import UploadFile

async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extracts raw text from an uploaded PDF file using PyMuPDF.
    """
    try:
        # Read the file bytes asynchronously
        file_bytes = await file.read()
        
        # Open the PDF from bytes
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        
        extracted_text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            extracted_text += page.get_text("text") + "\n\n"
            
        doc.close()
        return extracted_text
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")
