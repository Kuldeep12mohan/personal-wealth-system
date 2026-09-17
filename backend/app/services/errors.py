class ValidationError(Exception):
    """Raised for 400-class business rule violations."""


class NotFoundError(Exception):
    """Raised when a referenced portfolio/holding does not exist."""
