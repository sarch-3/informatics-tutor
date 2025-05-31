FROM python:3.12-slim

ARG FILE=file.py

ENV TIMEOUT=5

WORKDIR /usr/src/app

COPY ${FILE} file.py

CMD ["sh", "-c", "timeout ${TIMEOUT} python3 file.py"]