# Настройки подключения к серверу базы данных
MYSQL_HOST = 'localhost'
MYSQL_PORT = 3306
MYSQL_DB = 'store_db'
MYSQL_USER = 'admin'
MYSQL_PASSWORD = 'admin'

# Настройки Flask-приложения
DEBUG = True
DEMO = True
HOST = 'localhost'
PORT = 5000

SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{username}:{password}@{host}:{port}/{database}'.format(
    username=MYSQL_USER,
    password=MYSQL_PASSWORD,
    host=MYSQL_HOST,
    port=MYSQL_PORT,
    database=MYSQL_DB,
)
