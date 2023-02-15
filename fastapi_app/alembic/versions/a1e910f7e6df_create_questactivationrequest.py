"""Create QuestActivationRequest

Revision ID: a1e910f7e6df
Revises: facc9bbf6be3
Create Date: 2023-02-14 12:45:40.023597

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1e910f7e6df'
down_revision = 'facc9bbf6be3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('quest_activation_requests',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('quest_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.ForeignKeyConstraint(['quest_id'], ['quests.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('quest_activation_requests')
    # ### end Alembic commands ###