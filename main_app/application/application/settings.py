from pathlib import Path
from os import getenv
from json import loads
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = getenv("SECRET_KEY", "secret-key")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(int(getenv("DEBUG", 0)))

ALLOWED_HOSTS = loads(getenv("ALLOWED_HOSTS", '["localhost", "127.0.0.1", "0.0.0.0"]'))

CORS_ALLOWED_ORIGINS = loads(getenv("CORS_ALLOWED_ORIGINS", '["http://localhost:5173", "http://127.0.0.1:5173", "http://0.0.0.0:5173"]'))

APPEND_SLASH = True

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_minio_backend",
    "corsheaders",
    # "django_minio_backend.apps.DjangoMinioBackendConfig",

    "ping",
    "users",
    "classrooms",
    "homeworks",
    "tasks"
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "corsheaders.middleware.CorsMiddleware",
]

ROOT_URLCONF = 'application.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=float(getenv("ACCESS_TOKEN_LIFETIME", 15))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=float(getenv("REFRESH_TOKEN_LIFETIME", 7))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    "UPDATE_LAST_LOGIN": True,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
}


WSGI_APPLICATION = 'application.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': getenv('POSTGRESQL_HOST'),
        'PORT': getenv('POSTGRESQL_PORT'),
        'USER': getenv('POSTGRESQL_USER'),
        'PASSWORD': getenv('POSTGRESQL_PASSWORD'),
        'NAME': getenv('POSTGRESQL_NAME')
    }
}

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{getenv("REDIS_HOST")}:{getenv("REDIS_PORT")}/{getenv("REDIS_DATABASE", 0)}",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

STORAGES = {
    "default": {
        "BACKEND": "django_minio_backend.models.MinioBackend",
    },
    "staticfiles": {
        "BACKEND": "django_minio_backend.backends.MinioBackend",
        "BUCKET": "auto-generated-bucket-static-files",
    },
}

MINIO_ENDPOINT = f"{getenv("MINIO_HOST")}:{getenv("MINIO_PORT")}"
MINIO_ACCESS_KEY = getenv("MINIO_ROOT_USER")
MINIO_SECRET_KEY = getenv("MINIO_ROOT_PASSWORD")
MINIO_USE_HTTPS = False
MINIO_CONSISTENCY_CHECK_ON_START = not DEBUG
MINIO_PRIVATE_BUCKETS = []
MINIO_PUBLIC_BUCKETS = [
    'solutions',
]

MINIO_MEDIA_FILES_BUCKET = 'solutions'

CELERY_BROKER_URL = f"redis://{getenv("REDIS_HOST")}:{getenv("REDIS_PORT")}/{getenv("CELERY_BROKER_DATABASE", 0)}"

TS_URL = f"http://{getenv("TS_HOST")}:{getenv("TS_PORT")}/api/run-code/"

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'users.CustomUser'


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
