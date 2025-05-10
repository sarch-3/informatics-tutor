from pathlib import Path
from uuid import uuid4
import asyncio
import shutil

async def save_file(file):
    loop = asyncio.get_event_loop()
    file_id = uuid4()
    file_path = Path(__file__).resolve().parent.parent.parent / "files" / str(file_id) / f"{str(file_id)}.py"
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_path, file_id