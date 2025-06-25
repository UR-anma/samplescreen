FROM python:3.10-alpine

EXPOSE 55510

RUN pip install --no-cache-dir websockets

COPY ./src /home

WORKDIR /home

ENTRYPOINT python3 opscreenWorkerMain.py 