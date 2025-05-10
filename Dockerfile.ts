FROM python:3.12

WORKDIR /usr/src/app

COPY testing_system/ .

RUN pip install -r requirements.txt

WORKDIR /usr/src/app/app

ENV DEBUG=0
ENV TIMEOUT=5
ENV HOST=0.0.0.0
ENV PORT=8000
ENV WORKERS=4

CMD ["sh", "-c", "uvicorn main:app --host ${HOST} --port ${PORT} --workers ${WORKERS}"]