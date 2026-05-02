FROM python:3.14-slim

WORKDIR /app

RUN groupadd -r group && useradd -r -s /bin/false -g group user

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

VOLUME [ "/app/certs" ]

EXPOSE 8080

RUN mkdir /certs && chown -R user:group /certs

USER user

ENTRYPOINT [ "sh", "-c", "uvicorn --host 0.0.0.0 --port 8080 main:app" ]