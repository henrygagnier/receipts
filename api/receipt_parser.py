import cv2
import pytesseract
import re
import json
from typing import Dict, Any

def process_receipt_image(image_path: str) -> Dict[str, Any]:
    """
    Process a receipt image and extract key information

    :param image_path: Path to the receipt image
    :return: Dictionary of extracted receipt information
    """
    image = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding to preprocess the image
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    
    # Perform text extraction
    text = pytesseract.image_to_string(gray)
    
    # Parse the extracted text
    return parse_receipt_text(text)

def parse_receipt_text(text: str) -> Dict[str, Any]:
    """
    Parse the extracted text to structure receipt information
    
    :param text: Raw OCR extracted text
    :return: Structured receipt data
    """
    # Basic parsing - these are example regex patterns
    receipt_data = {
        "store_name": _extract_store_name(text),
        "total": _extract_total(text),
        "date": _extract_date(text),
        "items": _extract_items(text)
    }
    
    return receipt_data

def _extract_store_name(text: str) -> str:
    """Extract store name from receipt text"""
    # Example store name extraction
    match = re.search(r'^([A-Za-z\s]+)', text, re.MULTILINE)
    return match.group(1).strip() if match else "Unknown Store"

def _extract_total(text: str) -> float:
    """Extract total amount from receipt text"""
    # Look for total with optional currency symbol
    match = re.search(r'TOTAL\s*[:]*\s*[\$€]?(\d+\.\d{2})', text, re.IGNORECASE)
    return float(match.group(1)) if match else 0.0

def _extract_date(text: str) -> str:
    """Extract date from receipt text"""
    # Look for date in common formats
    date_patterns = [
        r'\d{1,2}/\d{1,2}/\d{2,4}',  # MM/DD/YYYY or DD/MM/YYYY
        r'\d{2,4}-\d{1,2}-\d{1,2}'   # YYYY-MM-DD or DD-MM-YYYY
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    
    return "Unknown Date"

def _extract_items(text: str) -> list:
    """Extract individual items from receipt text"""
    items = []
    item_lines = re.findall(r'(.+)\s+(\d+\.\d{2})', text)
    
    for item, price in item_lines:
        items.append({
            "name": item.strip(),
            "price": float(price)
        })
    
    return items