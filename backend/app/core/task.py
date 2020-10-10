class Task:

    def __init__(self,
                 uid: str,
                 status: str) -> None:
        self.uid = uid
        self.status = status
        super().__init__()
