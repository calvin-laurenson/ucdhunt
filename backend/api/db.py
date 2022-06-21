from sqlmodel import SQLModel, create_engine
from sqlalchemy.engine.url import URL
import os

if os.environ.get("INSTANCE_CONNECTION_NAME") is not None:
    db_user = os.environ["DB_USER"]
    db_pass = os.environ["DB_PASS"]
    db_name = os.environ["DB_NAME"]
    db_socket_dir = os.environ.get("DB_SOCKET_DIR", "/cloudsql")
    instance_connection_name = os.environ["INSTANCE_CONNECTION_NAME"]
    conn_url = str(
        URL.create(
            drivername="postgresql+pg8000",
            username=db_user,
            password=db_pass,
            database=db_name,
            query={
                "unix_sock": "{}/{}/.s.PGSQL.5432".format(
                    db_socket_dir, instance_connection_name  # e.g. "/cloudsql"
                )  # i.e "<PROJECT-NAME>:<INSTANCE-REGION>:<INSTANCE-NAME>"
            },
        ),
    )
else:
    conn_url = os.environ["DB_URI"]
engine = create_engine(conn_url)

if os.environ.get("PUSH_DB") == "true":
    from . import model

    SQLModel.metadata.create_all(engine)
