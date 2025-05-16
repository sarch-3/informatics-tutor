from classrooms.models import Solution, Task
from django.conf import settings
from celery import shared_task
from json import loads, dumps
import requests

@shared_task
def test_file(solution_id: Solution, task_id: Task):
    solution = Solution.objects.get(id = solution_id)
    task = Task.objects.get(id = task_id)

    data = {
        "data": dumps({
            "answers": task.answers,
            "tests": task.tests
        })
    }

    with solution.file.open("rb") as f:
        files = {
            'file': (str(solution.file), f)
        }
        response = requests.post(settings.TS_URL, data=data, files=files)

    if response.status_code == 200:
        response_json = loads(response.text)
        solution.tested = True
        solution.successful = response_json["successful"]
        solution.message = response_json["message"]
        solution.save()