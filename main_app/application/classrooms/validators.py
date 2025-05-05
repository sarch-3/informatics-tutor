from django.core.exceptions import ValidationError

def tests_validator(value):
    if not isinstance(value, list):
        raise ValidationError('Must be an array of arrays.')
    if len(value) == 0:
        raise ValidationError('This field may not be blank.')
    if not all(isinstance(obj, list) for obj in value):
        raise ValidationError('Must be an array of arrays.')
    if not all(bool(obj) for obj in value):
        raise ValidationError('Nested arrays may not be blank.')
    if not all(isinstance(obj2, str) for obj in value for obj2 in obj):
        raise ValidationError('Nested arrays should only consist of strings.')

def answer_validator(value):
    if not isinstance(value, list):
        raise ValidationError('Must be an array of strings.')
    if len(value) == 0:
        raise ValidationError('This field may not be blank.')
    if not all(isinstance(obj, str) for obj in value):
        raise ValidationError('Must be an array of strings.')