def convert_pdf_to_string(pdf_path):
    import fitz  # PyMuPDF
    import os
    import pytesseract
    from PIL import Image
    
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

if __name__ == "__main__":
    # ⚠️ Replace this with the actual path to your PDF file.
    PDF_FILE_PATH = "C:/Users/CLL/Downloads/model_essays_and_composition_f_1678279780_2684b57e_progressive.pdf"
    
    extracted_string = convert_pdf_to_string(PDF_FILE_PATH)
    extracted_string = extracted_string.replace('|', 'I')
    
    if extracted_string:
        print("\n--- Final Extracted Text ---")
        print(extracted_string)
        print("----------------------------") 
