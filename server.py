from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from rembg import remove
import uuid


app = FastAPI()

# Configurar carpeta de templates
templates = Jinja2Templates(directory="templates")

# Servir archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/subir_img")
async def subir_img(request: Request):
    return templates.TemplateResponse("subir_img.html", {"request": request})


@app.post("/remove_bg")
async def remove_bg(image: UploadFile = File(...)):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No se seleccionó archivo")
    
    # Leer la imagen
    input_data = await image.read()
    
    # Eliminar el fondo
    output_data = remove(input_data)
    
    # Generar ID único y obtener nombre original
    unique_id = str(uuid.uuid4())[:8]
    original_name = image.filename.rsplit('.', 1)[0]
    new_filename = f'{original_name}_rendx_{unique_id}.png'
    
    # Retornar la imagen sin fondo
    return StreamingResponse(
        iter([output_data]),
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename={new_filename}"}
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return templates.TemplateResponse("404.html", {"request": request}, status_code=404)


if __name__ == '__main__':
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 8000))  # Render usa PORT automáticamente
    
    uvicorn.run(
        app,
        host="0.0.0.0",     # Render requiere esto
        port=port
    )


    
