FROM python:3.10

RUN apt-get update && apt-get install -y python3-dev supervisor nginx \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install -r /app/requirements.txt

COPY ./config/nginx.conf /etc/nginx/nginx.conf
COPY ./config/uwsgi.ini /etc/uwsgi/uwsgi.ini
COPY ./config/supervisord.ini /etc/supervisor/conf.d/supervisord.ini

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.ini"]
