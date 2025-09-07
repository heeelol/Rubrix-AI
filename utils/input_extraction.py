# ----------------------------
# 1️⃣ PDF Extraction
# ----------------------------
import pdfplumber
import os
import fitz

def convert_pdf_to_string(pdf_path):
    """
    Extracts all text from a PDF file using Tesseract OCR.
    
    Args:
        pdf_path (str): The file path to the PDF document.
        
    Returns:
        str: A string containing all the text from the PDF, or None if an error occurs.
    """
    
    if not os.path.exists(pdf_path):
        print(f"Error: The file '{pdf_path}' was not found.")
        return None

    try:
        # Open the PDF document
        doc = fitz.open(pdf_path)
        print(f"Reading text from '{pdf_path}'...")
        
        full_text = ""
        
        # Loop through each page in the document
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            
            # Get the page as a high-resolution image
            pix = page.get_pixmap(dpi=300)
            pil_image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Use pytesseract to recognize text from the image
            page_text = pytesseract.image_to_string(pil_image)
            
            full_text += page_text + "\n"
            
        doc.close()
        
        return full_text
        
    except Exception as e:
        print(f"An error occurred while processing the PDF with Tesseract: {e}")
        return None


# ----------------------------
# 3️⃣ Image / OCR Extraction
# ----------------------------
from PIL import Image
import pytesseract

def convert_png_to_string(file_path):
    """
    Extracts text from an image file using Tesseract OCR.
    Returns the recognized text as a string.
    """
    image = Image.open(file_path)
    text = pytesseract.image_to_string(image)
    return text.strip()

