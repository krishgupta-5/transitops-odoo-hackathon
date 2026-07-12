"""merge heads

Revision ID: d7350ac6b4ce
Revises: 0454b6eeb73d, 0c28a8d9fbc4
Create Date: 2026-07-12 15:31:55.867999

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7350ac6b4ce'
down_revision: Union[str, Sequence[str], None] = ('0454b6eeb73d', '0c28a8d9fbc4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
