from pydantic import BaseModel, field_validator, model_validator

class Data(BaseModel):
    answers: list[list[str]]
    tests: list[list[bytes]]

    @field_validator("answers", "tests", mode="before")
    @classmethod
    def escape_strings(cls, value):
        if value:
            for attempt in range(len(value)):
                for s in range(len(value[attempt])):
                    value[attempt][s] = value[attempt][s].encode("unicode_escape")
        return value

    @field_validator("answers", mode="after")
    @classmethod
    def answers_valid(cls, value) -> list[list[str]]:
        if not value:
            raise ValueError(f'{value} may not be empty.')
        if not all(v for v in value):
            raise ValueError(f'{value} may not contain empty arrays.')
        return value
    
    @field_validator("tests", mode="after")
    @classmethod
    def tests_valid(cls, value) -> list[list[str]]:
        if value:
            if not all(v for v in value):
                raise ValueError(f'{value} may not contain empty arrays.')
        return value

    @model_validator(mode="after")
    def equal_lenght(self):
        if self.tests:
            if len(self.answers) != len(self.tests):
                raise ValueError(f'answers should be the same length as the tests.')
        return self