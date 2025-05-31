from django.core.exceptions import ValidationError

from django.core.files.uploadedfile import InMemoryUploadedFile

def tests_answers_validator(value):
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