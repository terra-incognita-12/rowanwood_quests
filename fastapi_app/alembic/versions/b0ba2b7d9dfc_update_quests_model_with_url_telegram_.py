"""update quests model with url & telegram_url

Revision ID: b0ba2b7d9dfc
Revises: eb7aef60872c
Create Date: 2022-11-21 23:51:01.970034

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b0ba2b7d9dfc'
down_revision = 'eb7aef60872c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('quests', sa.Column('url', sa.String(), nullable=True))
    op.add_column('quests', sa.Column('telegram_url', sa.String(), nullable=True))
    op.drop_constraint('quests_name_key', 'quests', type_='unique')
    op.create_unique_constraint(None, 'quests', ['telegram_url'])
    op.create_unique_constraint(None, 'quests', ['url'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'quests', type_='unique')
    op.drop_constraint(None, 'quests', type_='unique')
    op.create_unique_constraint('quests_name_key', 'quests', ['name'])
    op.drop_column('quests', 'telegram_url')
    op.drop_column('quests', 'url')
    # ### end Alembic commands ###
