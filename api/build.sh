#!/bin/bash

# Update the package list
apt-get update

# Install Tesseract OCR and any necessary dependencies
apt-get install -y tesseract-ocr

# Optional: Install additional language packs for Tesseract
# Uncomment and modify the following line if you need other language data (e.g., for French)
# apt-get install -y tesseract-ocr-fra
