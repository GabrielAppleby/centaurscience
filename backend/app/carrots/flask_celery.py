import os

from celery import Celery


class FlaskCelery:

    def __init__(self) -> None:
        self.impl: Celery = Celery('carrots',
                                   broker=os.environ.get('CELERY_BROKER_URL'),
                                   backend=os.environ.get('CELERY_RESULT_BACKEND'))
        super().__init__()

    def init_app(self, app):

        class ContextTask(self.impl.Task):
            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return self.run(*args, **kwargs)

        self.impl.Task = ContextTask

    def get_celery(self):
        return self.impl


flask_celery = FlaskCelery()
