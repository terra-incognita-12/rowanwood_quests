#!/bin/sh

echo "*ENTRYPOINT*: Waiting for postgres connection..."

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
    sleep 0.1
done

echo "*ENTRYPOINT*: Postgres connected!"

alembic upgrade head

while ! python create_admin.py; do
    sleep 0.1
done

echo "*ENTRYPOINT*: Admin created!"

exec "$@"