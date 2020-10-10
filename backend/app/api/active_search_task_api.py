from typing import Dict

from celery.result import AsyncResult
from flask_restful import Resource, fields, marshal_with

from app.carrots.flask_celery import flask_celery
from app.core.task import Task
from app.active_search.tasks import search

celery = flask_celery.get_celery()

active_search_task_fields: Dict = {
    "uid": fields.String,
    "status": fields.String
}


class ActiveSearchTaskAPI(Resource):
    @marshal_with(active_search_task_fields)
    def get(self, uid):
        res: AsyncResult = celery.AsyncResult(uid)
        return Task(res.id, res.state)

    @marshal_with(active_search_task_fields)
    def post(self):
        task: AsyncResult = search.delay()
        return Task(task.id, task.state)
