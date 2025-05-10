from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from models import Data
from utils import save_file
from pathlib import Path
from uuid import uuid4
from os import getenv
import shutil
import docker.errors
import docker


router = APIRouter()

@router.post("/run-code/")
async def run_code(file: UploadFile = File(...), data: str = Form(...)):
    # File validation
    if file.size > 1048576:
        return JSONResponse({"status": "Bad", "messages": "The file is too large."}, status_code=400)
    if file.filename.split(".")[-1] != "py":
        return JSONResponse({"status": "Bad", "messages": "The file must be .py format."}, status_code=400)

    # JSON validation
    try:
        data = Data.model_validate_json(data)
    except ValidationError as e:
        # errors = list()
        # for i in e.errors():
        #     if "ctx" in i:
        #         i.pop("ctx")
        #     errors.append(i)
        # return JSONResponse({"status": "Bad", "messages": errors}, status_code=400)
        return JSONResponse({"status": "Bad"}, status_code=400)
    
    
    # Saving file
    file_path, file_id = await save_file(file)

    # Working with docker
    client = docker.from_env()


    image = client.images.build(
        path=str(file_path.parent.parent.parent),
        tag=str(file_id),
        buildargs={"FILE": str(Path("files") / str(file_id) / f"{str(file_id)}.py")}
    )

    successful_flag = True

    for attempt in range(len(data.answers)):

        container = client.containers.run(
            image=f"{file_id}:latest",
            environment={"TIMEOUT": getenv("TIMEOUT")},
            detach=True,
            remove=False,
            stdin_open=True,
            tty=False,
            stdout=True,
            stderr=True
        )

        if data.tests:
            sock = container.attach_socket(params={'stdin': 1, 'stream': 1})
            for line in range(len(data.tests[attempt])):
                sock._sock.send((data.tests[attempt][line] + b"\n"))
            sock._sock.close()

        status_code = container.wait()

        if status_code["StatusCode"] == 0:

            logs = container.logs().decode()

            logs = logs.rstrip("\n").split("\n")

            if len(logs) != len(data.answers[attempt]):
                successful_flag = False
                break

            for line in range(len(logs)):
                if not logs[line] == data.answers[attempt][line]:
                    successful_flag = False
                    break
            
            if not successful_flag:
                break
        
        else:
            break

    successful = False
    result = None
    
    if status_code["StatusCode"] == 124:
        result = f"The runtime is out at {attempt + 1} test."

    if status_code["StatusCode"] == 1:
        result = "Failed to start testing."

    if status_code["StatusCode"] == 0:
        if successful_flag:
            successful = True
            result = "Successful"
        else:
            result = f"Wrong answer at {attempt + 1} test."
            

    client.containers.prune()

    client.images.remove(image=str(file_id))
    
    shutil.rmtree(file_path.parent)

    return {"successful": successful, "result": result}