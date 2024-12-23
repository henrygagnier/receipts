import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from receipt_parser import process_receipt_image

app = FastAPI(title="Receipt Processing API")

# Homepage route
@app.get("/")
async def homepage():
    return "i love receipts"

@app.post("/process-receipt/")
async def process_receipt(file: UploadFile = File(...)):
    """
    Endpoint to process an uploaded receipt image
    
    :param file: Uploaded image file
    :return: Parsed receipt contents as JSON
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Only image files are supported")
    
    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads", file.filename)
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        receipt_data = process_receipt_image(file_path)
        
        os.remove(file_path)
        
        return JSONResponse(content=receipt_data)
    
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing receipt: {str(e)}")

handler = Mangum(app)