FROM python:3.10-alpine

WORKDIR /src/app/fastapi/

COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY ./entrypoint.sh .
RUN chmod +x /src/app/fastapi/entrypoint.sh

COPY . .

ENTRYPOINT ["/src/app/fastapi/entrypoint.sh"]
