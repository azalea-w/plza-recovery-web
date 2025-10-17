import asyncio
import json
import os
import subprocess
from pathlib import Path
import sys
import tempfile
from uuid import uuid4
from concurrent.futures import ThreadPoolExecutor

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse

# Configuration
src_dir = Path(__file__).parent
sys.path.insert(0, str((src_dir / "plza-recovery").absolute()))

# Global state
file_map = {}
app = FastAPI(title="PLZA Save Recovery Tool")

# Load index.html
with open(src_dir / "dist" / "index.html") as f:
    index = f.read()

# noinspection PyTypeChecker
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for IO-bound tasks
thread_pool = ThreadPoolExecutor(max_workers=10)

# Serve static files
app.mount("/dist", StaticFiles(directory=src_dir / "dist"), name="dist")


# noinspection PyTypeChecker
async def run_repair_process(temp_input_path: str) -> dict:
    loop = asyncio.get_event_loop()

    def _execute_repair():
        proc = subprocess.Popen([
            "python",
            f"{src_dir / 'plza-recovery' / 'main.py'}",
            temp_input_path, 'json_out'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        return json.loads(proc.stdout.read())

    return await loop.run_in_executor(thread_pool, _execute_repair)


# noinspection PyTypeChecker
@app.post("/repair")
async def repair_save(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()

    # Create temporary file in thread pool
    loop = asyncio.get_event_loop()

    def _create_temp_file():
        with tempfile.NamedTemporaryFile(delete=False) as temp_input:
            temp_input.write(content)
            return temp_input.name

    temp_input_path = await loop.run_in_executor(thread_pool, _create_temp_file)

    try:
        output = await run_repair_process(temp_input_path)

        if not output["success"]:
            return JSONResponse(output, 400)

        save_id = str(uuid4())
        file_map[save_id] = temp_input_path + "_modified"

        return {
            "success": True,
            "download_url": f"/download/{save_id}",
            "filename": "main"
        } | output

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Clean up temp input file in thread pool
        def _cleanup_temp_file():
            if os.path.exists(temp_input_path):
                os.unlink(temp_input_path)

        await loop.run_in_executor(thread_pool, _cleanup_temp_file)


@app.get("/download/{save_id}")
async def download_file(save_id: str):
    file_path = file_map.get(save_id)

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        file_path,
        media_type='application/octet-stream',
        filename="main"
    )


@app.get("/", response_class=HTMLResponse)
async def main():
    return HTMLResponse(index, 200)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)