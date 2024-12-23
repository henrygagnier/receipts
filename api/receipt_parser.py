import cv2
import pytesseract
import re
import json
from typing import Dict, Any
import fnmatch
from collections import namedtuple
from difflib import get_close_matches
import dateutil.parser
from dateutil.parser import parse
import imutils

# Load the config from a JSON file
def load_config(config_path):
    with open(config_path, "r") as file:
        return json.load(file)

# Config loading
conf = load_config("config.json")

def process_receipt_image(image_path: str) -> Dict[str, Any]:
    """
    Process a receipt image and extract key information

    :param image_path: Path to the receipt image
    :return: Dictionary of extracted receipt information
    """
    
    img_orig = cv2.imread(image_path)
    image = img_orig.copy()
    image = imutils.resize(image, width=500)
    ratio = img_orig.shape[1] / float(image.shape[1])
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    text2 = pytesseract.image_to_string(
        cv2.cvtColor(gray, cv2.COLOR_BGR2RGB), config=options
    )

    return(parse_receipt(conf, text2))

def normalize(lines):
    """
    Normalize the lines: strip empty lines and convert to lowercase
    :param lines: List of str
    :return: List of str
    """
    lines = lines.split("\n")
    
    # Remove empty lines and return the cleaned list
    return [line.lower() for line in lines if line.strip()]

def fuzzy_find(lines, keyword, accuracy=0.6):
    """
    Find the closest match for a keyword in the lines using fuzzy matching
    :param lines: List of str
    :param keyword: str
    :param accuracy: float
    :return: str
    """
    for line in lines:
        words = line.split()
        matches = get_close_matches(keyword, words, 1, accuracy)
        if matches:
            return line

def parse_date(lines, date_format):
    """
    Parse the date from the lines
    :param lines: List of str
    :param date_format: str
    :return: str
    """
    for line in lines:
        match = re.search(date_format, line)
        if match:
            # Find the first non-None capturing group
            date_str = next((g for g in match.groups() if g is not None), None)
            if date_str:
                date_str = date_str.replace(" ", "")  # Remove spaces
                try:
                    parse(date_str)
                    return date_str
                except ValueError:
                    return None
    return None

import re
import fnmatch
from collections import namedtuple

def parse_items(lines, config, market):
    """
    Parse items from the lines
    :param lines: List of str
    :param config: dict
    :param market: str
    :return: List of tuples
    """
    items = []
    item = namedtuple("item", ("article", "sum"))

    ignored_words = config["ignore_keys"]
    stop_words = config["sum_keys"]
    
    # Updated regex format for item parsing
    item_format = r"\b([A-Za-z][\w\s]*) (\d+[\.,]\d{2})\b"

    for line in lines:
        parse_stop = False
        for ignore_word in ignored_words:
            if fnmatch.fnmatch(line, f"*{ignore_word}*"):
                parse_stop = True
                break

        if parse_stop:
            continue

        match = re.search(item_format, line)
        if match:
            article_name = match.group(1).strip()  # Clean up any leading/trailing spaces
            article_sum = match.group(2).replace(",", ".")  # Replace commas with dots for decimal
            items.append(item(article_name, article_sum))

    return items


def parse_market(lines, config):
    """
    Parse market from the lines
    :param lines: List of str
    :param config: dict
    :return: str
    """
    for int_accuracy in range(10, 6, -1):
        accuracy = int_accuracy / 10.0
        min_accuracy, market_match = -1, None
        for market, spellings in config["markets"].items():
            for spelling in spellings:
                line = fuzzy_find(lines, spelling, accuracy)
                if line and (accuracy < min_accuracy or min_accuracy == -1):
                    min_accuracy = accuracy
                    market_match = market
                    return market_match
    return market_match

def parse_sum(lines, config, sum_keys, sum_format):
    """
    Parse sum from the lines
    :param lines: List of str
    :param config: dict
    :param sum_keys: list of str
    :param sum_format: str
    :return: str
    """
    for sum_key in sum_keys:
        sum_line = fuzzy_find(lines, sum_key)
        if sum_line:
            sum_line = sum_line.replace(",", ".")
            sum_float = re.search(sum_format, sum_line)
            if sum_float:
                return sum_float.group(0)

def to_json(market, date, total_sum, items):
    """
    Convert parsed data to JSON
    :param market: str
    :param date: str
    :param total_sum: str
    :param items: List of tuples
    :return: json string
    """
    object_data = {
        "market": market,
        "date": date,
        "sum": total_sum,
        "items": items,
    }
    return json.dumps(object_data)

def parse_receipt(config, raw):
    """
    Parse receipt from raw data
    :param config: dict
    :param raw: List of str
    :return: json string
    """
    lines = normalize(raw)
    print(lines)
    
    market = parse_market(lines, config)
    date = parse_date(lines, config["date_format"])
    total_sum = parse_sum(lines, config, config["sum_keys"], config["sum_format"])
    items = parse_items(lines, config, market)

    return (to_json(market, date, total_sum, items), lines)
