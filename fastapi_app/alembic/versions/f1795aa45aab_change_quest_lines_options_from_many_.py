"""Change quest lines/options from many/many to one/many

Revision ID: f1795aa45aab
Revises: c61a0e634166
Create Date: 2023-01-08 23:29:09.054573

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f1795aa45aab'
down_revision = 'c61a0e634166'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('quest_lines_options')
    op.add_column('quest_option', sa.Column('quest_current_line_id', postgresql.UUID(as_uuid=True), nullable=False))
    op.alter_column('quest_option', 'quest_next_line_id',
               existing_type=postgresql.UUID(),
               nullable=False)
    op.drop_constraint('quest_option_quest_next_line_id_fkey', 'quest_option', type_='foreignkey')
    op.create_foreign_key(None, 'quest_option', 'quest_line', ['quest_current_line_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'quest_option', 'quest_line', ['quest_next_line_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'quest_option', type_='foreignkey')
    op.drop_constraint(None, 'quest_option', type_='foreignkey')
    op.create_foreign_key('quest_option_quest_next_line_id_fkey', 'quest_option', 'quest_line', ['quest_next_line_id'], ['id'], ondelete='SET NULL')
    op.alter_column('quest_option', 'quest_next_line_id',
               existing_type=postgresql.UUID(),
               nullable=True)
    op.drop_column('quest_option', 'quest_current_line_id')
    op.create_table('quest_lines_options',
    sa.Column('quest_line_id', postgresql.UUID(), autoincrement=False, nullable=False),
    sa.Column('quest_option_id', postgresql.UUID(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['quest_line_id'], ['quest_line.id'], name='quest_lines_options_quest_line_id_fkey'),
    sa.ForeignKeyConstraint(['quest_option_id'], ['quest_option.id'], name='quest_lines_options_quest_option_id_fkey'),
    sa.PrimaryKeyConstraint('quest_line_id', 'quest_option_id', name='quest_lines_options_pkey')
    )
    # ### end Alembic commands ###
