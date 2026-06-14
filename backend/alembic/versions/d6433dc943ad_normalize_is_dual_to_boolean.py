"""normalize_is_dual_to_boolean

Revision ID: d6433dc943ad
Revises: 9ecd0268c8c7
Create Date: 2026-06-15 00:02:53.998980

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6433dc943ad'
down_revision: Union[str, Sequence[str], None] = '9ecd0268c8c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # SQLite doesn't support ALTER COLUMN for type changes
    # Use batch_alter_table with recreate_table
    with op.batch_alter_table('learning_outcome_items') as batch_op:
        batch_op.alter_column('is_dual',
                             existing_type=sa.VARCHAR(),
                             type_=sa.Boolean(),
                             existing_nullable=True,
                             postgresql_using='CASE WHEN is_dual = \'True\' THEN TRUE ELSE FALSE END')


def downgrade() -> None:
    """Downgrade schema."""
    # SQLite doesn't support ALTER COLUMN for type changes
    with op.batch_alter_table('learning_outcome_items') as batch_op:
        batch_op.alter_column('is_dual',
                             existing_type=sa.Boolean(),
                             type_=sa.VARCHAR(),
                             existing_nullable=True)
