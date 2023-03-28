INSTALL:

0) Clone project
1) Create ".env.dev" inside "fastapi_app" folder and copy everything from "test.env".
2) Create ".env" inside "bot" folder and copy everything from "test.env". To run telegram bot in dev mode required working telegram bot api key
3) run <code>docker-compose up</code> in root folder
4) Login as admin, in Editor mode create quest with URL "training" and if you have working telegram api key you can test telegram bot in dev mode.

USAGE:

0) Website react frontend is available on localhost:3000. Admin credentials are: email=admin@admin.com pass=adminadmin
1) Website fastapi backend is avaliable on localhost:8000. Swagger for API is on localhost:8000/docs
2) Database is available on port 5432
3) Mailing service is available on localhost:5000.
4) DB adminer is available on localhost:8080. Syetem=PostgreSQL Server=db Username=postgres Password=postgres Database=rowanwoodtestdb
5) Localstack is available on port 4566
6) Telegram app is available on port 9000

IN DEV MODE:

0) Can only exist one telegram bot
1) Telegram bot not able to retrieve pictures from server
2) Every reload of container all static data in localstack erased
