"""TransitOps baseline schema

Revision ID: 0001
Revises:
Create Date: 2026-07-12 16:00:00.000000

Complete schema baseline for TransitOps. Creates all current model tables
from scratch. Replaces the broken development migration history.

Tables created:
  - users
  - refresh_tokens
  - vehicles
  - drivers
  - trips
  - fuel_logs  (with uq_fuel_logs_trip_id)
  - expenses
  - maintenance
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all TransitOps tables."""

    # ── users ──────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('profile_picture', sa.String(length=512), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # ── refresh_tokens ─────────────────────────────────────────────────
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=512), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_refresh_tokens_id'), 'refresh_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_refresh_tokens_user_id'), 'refresh_tokens', ['user_id'], unique=False)
    op.create_index(op.f('ix_refresh_tokens_token'), 'refresh_tokens', ['token'], unique=True)

    # ── vehicles ───────────────────────────────────────────────────────
    op.create_table(
        'vehicles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('registration_number', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('vehicle_type', sa.String(length=100), nullable=False),
        sa.Column('max_load_capacity', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('odometer', sa.Integer(), nullable=False),
        sa.Column('acquisition_cost', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_vehicles_id'), 'vehicles', ['id'], unique=False)
    op.create_index(op.f('ix_vehicles_registration_number'), 'vehicles', ['registration_number'], unique=True)

    # ── drivers ────────────────────────────────────────────────────────
    op.create_table(
        'drivers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('license_number', sa.String(length=100), nullable=False),
        sa.Column('license_category', sa.String(length=50), nullable=False),
        sa.Column('license_expiry_date', sa.Date(), nullable=False),
        sa.Column('contact_number', sa.String(length=50), nullable=True),
        sa.Column('safety_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('license_number'),
    )
    op.create_index(op.f('ix_drivers_id'), 'drivers', ['id'], unique=False)

    # ── trips ──────────────────────────────────────────────────────────
    op.create_table(
        'trips',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('trip_number', sa.String(length=50), nullable=False),
        sa.Column('source', sa.String(length=255), nullable=False),
        sa.Column('destination', sa.String(length=255), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('driver_id', sa.Integer(), nullable=False),
        sa.Column('cargo_weight', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('planned_distance', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('revenue', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('initial_odometer', sa.Integer(), nullable=True),
        sa.Column('final_odometer', sa.Integer(), nullable=True),
        sa.Column('fuel_consumed', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('dispatched_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_trips_id'), 'trips', ['id'], unique=False)
    op.create_index(op.f('ix_trips_trip_number'), 'trips', ['trip_number'], unique=True)

    # ── fuel_logs ──────────────────────────────────────────────────────
    op.create_table(
        'fuel_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('trip_id', sa.Integer(), nullable=False),
        sa.Column('liters', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('cost', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('fuel_date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('trip_id', name='uq_fuel_logs_trip_id'),
    )
    op.create_index(op.f('ix_fuel_logs_id'), 'fuel_logs', ['id'], unique=False)

    # ── expenses ───────────────────────────────────────────────────────
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('trip_id', sa.Integer(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('expense_date', sa.Date(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['trip_id'], ['trips.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_expenses_id'), 'expenses', ['id'], unique=False)

    # ── maintenance ────────────────────────────────────────────────────
    op.create_table(
        'maintenance',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.Column('service_type', sa.String(length=255), nullable=False),
        sa.Column('service_date', sa.String(length=50), nullable=False),
        sa.Column('cost', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('description', sa.String(length=512), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_maintenance_id'), 'maintenance', ['id'], unique=False)


def downgrade() -> None:
    """Drop all TransitOps tables in reverse FK dependency order."""
    # Child tables first (those that reference parent tables)
    op.drop_index(op.f('ix_maintenance_id'), table_name='maintenance')
    op.drop_table('maintenance')

    op.drop_index(op.f('ix_expenses_id'), table_name='expenses')
    op.drop_table('expenses')

    op.drop_index(op.f('ix_fuel_logs_id'), table_name='fuel_logs')
    op.drop_table('fuel_logs')

    op.drop_index(op.f('ix_trips_trip_number'), table_name='trips')
    op.drop_index(op.f('ix_trips_id'), table_name='trips')
    op.drop_table('trips')

    op.drop_index(op.f('ix_drivers_id'), table_name='drivers')
    op.drop_table('drivers')

    op.drop_index(op.f('ix_vehicles_registration_number'), table_name='vehicles')
    op.drop_index(op.f('ix_vehicles_id'), table_name='vehicles')
    op.drop_table('vehicles')

    op.drop_index(op.f('ix_refresh_tokens_token'), table_name='refresh_tokens')
    op.drop_index(op.f('ix_refresh_tokens_user_id'), table_name='refresh_tokens')
    op.drop_index(op.f('ix_refresh_tokens_id'), table_name='refresh_tokens')
    op.drop_table('refresh_tokens')

    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
