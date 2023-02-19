"""Data models."""
from . import db


class SearchID(db.Model):
    """Data model for user accounts."""

    __tablename__ = 'searchIDs'
    id = db.Column(
        db.Integer,
        primary_key=True
    )

    def __repr__(self):
        return '<ID {}>'.format(self.id)
