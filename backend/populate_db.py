import pathlib
import psycopg2
from typing import List

import numpy as np
import pandas as pd

from app.core.molecule import Molecule

CURRENT_PATH: pathlib.Path = pathlib.Path(__file__).parent.absolute()
RAW_DATA_PATH: pathlib.Path = CURRENT_PATH.joinpath('raw_data')
PROJECTIONS_PATH: pathlib.Path = RAW_DATA_PATH.joinpath('projected_molecules.npz')
SMILES_PATH: pathlib.Path = RAW_DATA_PATH.joinpath('new_training_data.csv')
DB_PATH: pathlib.Path = CURRENT_PATH.joinpath('instance', 'temp.db')

SMILES_TO_DROP = [188, 190, 250, 262, 350, 366, 435, 461, 520, 529, 542, 579, 580, 586, 593, 625, 626, 635, 641]


# def read_data(df_path: pathlib.Path) -> List[Molecule]:
#     df: pd.DataFrame = pd.read_csv(df_path)
#
#     molecules = []
#     for idx, row in df.iterrows():  # type: int, pd.Series
#         molecules.append(Molecule(0, row.smile, row.label, row.x, row.y))
#
#     return molecules

def read_data(npz_path: pathlib.Path, smile_path: pathlib.Path) -> List[Molecule]:
    data = np.load(npz_path)
    projection = data['umap']
    x = projection[:, 0]
    y = projection[:, 1]
    smiles_df = pd.read_csv(smile_path)
    randoms = np.random.random(14259)
    smiles_df.drop(SMILES_TO_DROP, inplace=True)
    smiles_df.reset_index(drop=True, inplace=True)
    molecules = []
    for idx, row in smiles_df.iterrows():  # type: int, pd.Series
        label = row.label
        if randoms[idx] < .8:
            label = 'Unknown'

        molecules.append(Molecule(0, row.smile, label, x[idx], y[idx]))

    return molecules


def main():
    mols = read_data(PROJECTIONS_PATH, SMILES_PATH)
    connection = psycopg2.connect(user="dev_user",
                                  password="dev_pass",
                                  host="db",
                                  port="5432",
                                  database="dev_db")
    c = connection.cursor()
    for mol in mols:
        c.execute(
            'INSERT INTO molecules (str_rep, label, x, y)'
            ' VALUES (%s, %s, %s, %s)',
            (str(mol.str_rep), str(mol.label), float(mol.x), float(mol.y))
        )
    connection.commit()
    connection.close()


if __name__ == '__main__':
    main()
