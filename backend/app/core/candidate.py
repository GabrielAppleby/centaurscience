class Candidate:
    """
    An active search candidate.
    """

    def __init__(self, unique_id: int) -> None:
        """
        Creates an empty knapsack.
        """
        self.unique_id: int = unique_id
        super().__init__()
