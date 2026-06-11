"""glossary terms + test documentation practice tables

Revision ID: a1f2c3d4e5b6
Revises: 5b29e73e567b
Create Date: 2026-06-09
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1f2c3d4e5b6"
down_revision: Union[str, None] = "5b29e73e567b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "glossary_terms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("term", sa.String(length=160), nullable=False),
        sa.Column("definition", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=60), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_glossary_terms_slug"), "glossary_terms", ["slug"], unique=True)

    op.create_table(
        "doc_scenarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("doc_type", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("brief", sa.Text(), nullable=False),
        sa.Column("context", sa.Text(), nullable=False),
        sa.Column("source", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.create_table(
        "doc_attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("scenario_id", sa.Integer(), sa.ForeignKey("doc_scenarios.id"), nullable=False),
        sa.Column("doc_type", sa.String(length=20), nullable=False),
        sa.Column("submission_json", sa.Text(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("feedback_json", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("doc_attempts")
    op.drop_table("doc_scenarios")
    op.drop_index(op.f("ix_glossary_terms_slug"), table_name="glossary_terms")
    op.drop_table("glossary_terms")
