import sys
import pymupdf  # use pymupdf instead of fitz
import pytesseract
from PIL import Image
import os
import json

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def convert_pdf_to_string(pdf_path):
    if not os.path.exists(pdf_path):
        return None

    doc = pymupdf.open(pdf_path)  # open PDF
    full_text = ""

    for page_num in range(len(doc)):  # iterate pages
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=300)  # render at 300 DPI
        pil_image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        page_text = pytesseract.image_to_string(pil_image)
        full_text += page_text + "\n"

    doc.close()
    return full_text

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    extracted_text = convert_pdf_to_string(pdf_path)

    if not extracted_text:
        print(json.dumps({"error": "Failed to extract text"}))
        sys.exit(1)

    # Example weakness detection (dummy rules for now)
    weaknesses = []
    if "algebra" in extracted_text.lower():
        weaknesses.append("Algebra")
    if "grammar" in extracted_text.lower():
        weaknesses.append("Grammar")

    if not weaknesses:
        weaknesses.append("No obvious weaknesses found")

    result = {
        "text": extracted_text[:1000],  # send preview
        "weaknesses": list(weaknesses)
    }

    # Print JSON to stdout so Node can parse it
    print(json.dumps(result))
