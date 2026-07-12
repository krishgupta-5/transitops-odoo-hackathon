"""
TransitOps User Role Enum

Single source of truth for all valid user roles in the system.
Used by models, schemas, oauth2 dependencies, routes, and seed scripts.
"""

from enum import Enum


class UserRole(str, Enum):
    FLEET_MANAGER = "FLEET_MANAGER"
    DISPATCHER = "DISPATCHER"
    SAFETY_OFFICER = "SAFETY_OFFICER"
    FINANCIAL_ANALYST = "FINANCIAL_ANALYST"
