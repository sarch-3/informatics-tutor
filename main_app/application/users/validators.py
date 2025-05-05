from django.core.exceptions import ValidationError
import re

def password_validator(value):
    if not re.search(r'[A-Z]', value):
        raise ValidationError(('Password must contain uppercase characters.'))
    if not re.search(r'[a-z]', value):
        raise ValidationError(('Password must contain lowercase characters.'))
    if not re.search(r'\d', value):
        raise ValidationError(('Password must contain digits.'))
    if not re.search(r'[@$!%*?&.]', value):
        raise ValidationError(('Password must contain special characters (@$!%*?&.).'))
