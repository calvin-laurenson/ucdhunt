FROM python:3.10.4-slim


ENV PYTHONUNBUFFERED True

ENV APP_HOME /app
WORKDIR $APP_HOME


COPY . ./

RUN pip install --no-cache-dir -r requirements.txt


CMD exec uvicorn api.main:app --port $PORT --host 0.0.0.0