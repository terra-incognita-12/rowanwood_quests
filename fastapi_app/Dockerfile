FROM python:3.10-alpine

WORKDIR /src/app/fastapi_app/

COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

COPY ./entrypoint.sh .
RUN chmod +x /src/app/fastapi_app/entrypoint.sh

# COPY . .

ENTRYPOINT ["/src/app/fastapi_app/entrypoint.sh"]
