from fastapi.testclient import TestClient
from json import loads, dumps
from pathlib import Path
from app.main import app

client = TestClient(app)

def test_simple():
    file_path = Path(__file__).resolve().parent / "file2.py"

    form_data = {
        "data": '{"answers": [["Hello World!"], ["Hello World!"]], "tests": []}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == True

def test_simple_wrong():
    file_path = Path(__file__).resolve().parent / "file2.py"

    form_data = {
        "data": '{"answers": [["Hello World!"], ["Hello World1!"]], "tests": []}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == False
    assert response_json["result"] == "Wrong answer at 2 test."

def test_without_data():
    file_path = Path(__file__).resolve().parent / "file2.py"

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", files=files)

    assert response.status_code == 422

def test_image():
    file_path = Path(__file__).resolve().parent / "image.jpg"

    form_data = {
        "data": '{"answers": [["Hello World!"], ["Hello World!"]], "tests": []}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 400

def test_pyimage():
    file_path = Path(__file__).resolve().parent / "file.py"

    form_data = {
        "data": '{"answers": [["Hello World!"], ["Hello World!"]], "tests": []}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == False
    assert response_json["result"] == "Failed to start testing."

def test_destroy_container():
    file_path = Path(__file__).resolve().parent / "file5.py"

    form_data = {
        "data": '{"answers": [[""], ["GOODBYE"]], "tests": [["DESTROY"], ["DESTROY"]]}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == False
    assert response_json["result"] == "Failed to start testing."

def test_3():
    file_path = Path(__file__).resolve().parent / "file3.py"

    form_data = {
        "data": '{"answers": [["33"], ["Hello World!Hello World!"]], "tests": [["3"], ["Hello World!"]]}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == True

def test_4():
    file_path = Path(__file__).resolve().parent / "file4.py"

    form_data = {
        "data": '{"answers": [["9"], ["16"]], "tests": [["3", "0"], ["4", "0"]]}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == True

def test_4_wrong():
    file_path = Path(__file__).resolve().parent / "file4.py"

    form_data = {
        "data": '{"answers": [["9"], ["4"]], "tests": [["3", "0"], ["4", "0"]]}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == False
    assert response_json["result"] == "Wrong answer at 2 test."

def test_4_wrong2():
    file_path = Path(__file__).resolve().parent / "file4.py"

    form_data = {
        "data": '{"answers": [["9"], ["4"]], "tests": [["3"], ["4"]]}'
    }

    with open(str(file_path), "rb") as f:
        files = {"file": (str(file_path), f, "application/octet-stream")}  # Передаем файл
        response = client.post("/api/run-code/", data=form_data, files=files)

    assert response.status_code == 200
    response_json = loads(response.text)
    assert response_json["successful"] == False
    assert response_json["result"] == "The runtime is out at 1 test."