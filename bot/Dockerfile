FROM python:3.10-alpine

WORKDIR /src/app/bot/

COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY . .

CMD ["python", "main.py"]