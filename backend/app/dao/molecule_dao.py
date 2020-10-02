import pathlib
from typing import List, Union

import pandas as pd

from app.core.molecule import Molecule


def query_all() -> List[Molecule]:
    return data


def query_get_or_404(uid: int) -> Union[Molecule, None]:
    if uid < 0 or uid > data_len:
        return None
    else:
        return data[uid]


def read_data(df_path: pathlib.Path) -> List[Molecule]:
    df: pd.DataFrame = pd.read_csv(df_path)

    molecules: List[Molecule] = []
    for idx, row in df.iterrows():  # type: int, pd.Series
        molecules.append(Molecule(idx, row.smile, row.label, row.x, row.y))

    return molecules


DATA_PATH: pathlib.Path = pathlib.Path(__file__).parent.absolute().joinpath(
    'projected_molecules.csv')
data: List[Molecule] = read_data(DATA_PATH)
data_len = len(data)
