FROM python:3.7-slim-buster
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1

RUN groupadd -r flaskg
RUN useradd --no-log-init -r -g flaskg flask

COPY flask_setup.sh ./
CMD ["./flask_setup.sh"]
RUN rm flask_setup.sh

RUN apt-get update
RUN apt-get -yq upgrade
RUN apt-get -yq install gcc musl-dev linux-headers-amd64
RUN apt-get clean

RUN pip install --upgrade pip

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN rm requirements.txt

USER flask

WORKDIR /usr/app

COPY app ./

WORKDIR /usr/