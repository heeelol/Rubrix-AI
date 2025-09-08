import sys
import pymupdf  # use pymupdf instead of fitz
import pytesseract
from PIL import Image
import os
import json
import traceback

# Configure logging
def log_error(error_type, error_message, details=None):
    error_data = {
        "error": error_message,
        "type": error_type,
        "details": details
    }
    print(json.dumps(error_data), file=sys.stderr)

# Check Tesseract installation
try:
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    # Test if Tesseract is working
    if not os.path.exists(pytesseract.pytesseract.tesseract_cmd):
        log_error("ConfigError", "Tesseract not found", 
                 f"Expected at: {pytesseract.pytesseract.tesseract_cmd}")
        sys.exit(1)
except Exception as e:
    log_error("ConfigError", "Failed to configure Tesseract", str(e))
    sys.exit(1)

def extract_text_from_image(image_path):
    """Extract text from an image file"""
    try:
        # Check if file exists
        if not os.path.exists(image_path):
            log_error("FileError", "Image file not found", image_path)
            return None

        # Open and verify the image
        try:
            image = Image.open(image_path)
            image.verify()  # Verify it's a valid image
        except Exception as e:
            log_error("ImageError", "Invalid image file", str(e))
            return None
        
        # Reopen image after verification (as verify() closes the file)
        image = Image.open(image_path)
        
        try:
            text = pytesseract.image_to_string(image).strip()
            if not text:
                log_error("OCRError", "No text extracted from image", "The OCR process completed but no text was found")
                return None
            return text
        except Exception as e:
            log_error("OCRError", "Failed to process image with Tesseract", str(e))
            return None
            
    except Exception as e:
        log_error("UnexpectedError", "Image processing failed", 
                 {"error": str(e), "traceback": traceback.format_exc()})
        return None

def convert_pdf_to_string(pdf_path):
    """Extract text from a PDF file"""
    if not os.path.exists(pdf_path):
        log_error("FileError", "File not found", pdf_path)
        return None

    try:
        # Get file extension
        file_ext = os.path.splitext(pdf_path)[1].lower()
        
        # Handle PDFs
        if file_ext == '.pdf':
            try:
                doc = pymupdf.open(pdf_path)
                full_text = ""

                for page_num in range(len(doc)):
                    try:
                        page = doc.load_page(page_num)
                        pix = page.get_pixmap(dpi=300)
                        pil_image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        page_text = pytesseract.image_to_string(pil_image)
                        if page_text.strip():  # Only add non-empty pages
                            full_text += page_text + "\n"
                    except Exception as e:
                        log_error("PDFPageError", f"Failed to process page {page_num + 1}", str(e))
                        continue

                doc.close()
                
                if not full_text.strip():
                    log_error("OCRError", "No text extracted from PDF", "The OCR process completed but no text was found")
                    return None
                    
                return full_text.strip()
                
            except Exception as e:
                log_error("PDFError", "Failed to process PDF", str(e))
                return None
        
        # Handle images
        elif file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
            return extract_text_from_image(pdf_path)
        
        else:
            log_error("FormatError", "Unsupported file format", file_ext)
            return None

    except Exception as e:
        log_error("UnexpectedError", "Processing failed", 
                 {"error": str(e), "traceback": traceback.format_exc()})
        return None

if __name__ == "__main__":
    try:
        # Check command line arguments
        if len(sys.argv) != 2:
            log_error("ArgumentError", "File path argument required", "Expected 1 argument, got " + str(len(sys.argv) - 1))
            sys.exit(1)

        file_path = sys.argv[1]
        
        # Check if file exists and is readable
        if not os.path.isfile(file_path):
            log_error("FileError", "File does not exist or is not accessible", file_path)
            sys.exit(1)
            
        if not os.access(file_path, os.R_OK):
            log_error("PermissionError", "File is not readable", file_path)
            sys.exit(1)

        # Extract text
        extracted_text = convert_pdf_to_string(file_path)

        if not extracted_text:
            log_error("ExtractionError", "Failed to extract text", "No text could be extracted from the file")
            sys.exit(1)

        # Return the extracted text for further processing by Node.js
        result = {
            "text": extracted_text,
            "metadata": {
                "charCount": len(extracted_text),
                "wordCount": len(extracted_text.split()),
                "lineCount": len(extracted_text.splitlines())
            }
        }

        # Print JSON to stdout so Node can parse it
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        log_error("UnexpectedError", "Script execution failed", 
                 {"error": str(e), "traceback": traceback.format_exc()})
        sys.exit(1)
