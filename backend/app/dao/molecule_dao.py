from app.dao.database import db


class MoleculeDB(db.Model):
    __tablename__ = 'molecules'
    uid = db.Column(db.Integer, primary_key=True)
    str_rep = db.Column(db.String(128))
    label = db.Column(db.String(32))
    x = db.Column(db.Float)
    y = db.Column(db.Float)

    def __repr__(self):
        return '<Molecule {}>'.format(self.str_rep)
