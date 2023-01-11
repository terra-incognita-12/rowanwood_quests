"""quest_next_line from quest option are nullable for delete cascade

Revision ID: a1a8a7e421a7
Revises: f1795aa45aab
Create Date: 2023-01-10 01:09:53.822438

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1a8a7e421a7'
down_revision = 'f1795aa45aab'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('quest_option', 'quest_next_line_id',
               existing_type=postgresql.UUID(),
               nullable=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('quest_option', 'quest_next_line_id',
               existing_type=postgresql.UUID(),
               nullable=False)
    # ### end Alembic commands ###