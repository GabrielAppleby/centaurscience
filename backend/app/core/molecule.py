class Molecule:

    def __init__(self,
                 uid: int,
                 str_rep: str,
                 label: str,
                 x: float,
                 y: float) -> None:
        self.uid = uid
        self.str_rep = str_rep
        self.label = label
        self.x = x
        self.y = y
        super().__init__()
