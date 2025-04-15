import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
DEBUG = os.environ.get('DJANGO_DEBUG')
ALLOWED_HOSTS = [os.environ.get('DJANGO_ALLOWED_HOST')]

if not DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        f"https://{os.environ.get('DJANGO_ALLOWED_HOST')}",
    ]
    CORS_ORIGIN_ALLOW_ALL = True
    X_FRAME_OPTIONS = 'SAMEORIGIN'
    XS_SHARING_ALLOWED_METHODS = ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE']
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_filters',
    'celery',
    'django_celery_results',
    'corsheaders',

    'learning_plan',
    'automatic_fields',
    'learning_program',
    'tgparser',
    'support',
    'user_logs',
    'tgbot',
    'profile_management',
    'material',
    'lesson',
    'homework',
    'data_collections',
    'download_data',
    'chat',
    'mailing',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'profile_management.middleware.LastActivityMiddleware',
    'profile_management.middleware.ErrorLogsMiddleware',
]

ROOT_URLCONF = 'dls.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dls.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('DB_DB'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT')
    }
}
AUTH_USER_MODEL = 'profile_management.NewUser'
LOGIN_REDIRECT_URL = 'dashboard'
LOGOUT_REDIRECT_URL = 'login'
LOGIN_URL = 'login'
ACCOUNT_SIGNUP_PASSWORD_VERIFICATION = False
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

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']
}

LANGUAGE_CODE = 'ru-ru'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static_utils"),
    os.path.join(BASE_DIR, "learning_plan/static/"),
    os.path.join(BASE_DIR, "learning_program/static/"),
    os.path.join(BASE_DIR, "support/static/"),
    os.path.join(BASE_DIR, "user_logs/static/"),
    os.path.join(BASE_DIR, "tgbot/static/"),
    os.path.join(BASE_DIR, "profile_management/static/"),
    os.path.join(BASE_DIR, "material/static/"),
    os.path.join(BASE_DIR, "lesson/static/"),
    os.path.join(BASE_DIR, "homework/static/"),
    os.path.join(BASE_DIR, "data_collections/static/"),
    os.path.join(BASE_DIR, "chat/static/")
]
if not DEBUG:
    STATIC_ROOT = os.path.join(BASE_DIR, "static")

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CELERY_BROKER_URL = f"redis://{os.environ.get('REDIS_HOST')}:6379/0"
CELERY_RESULT_BACKEND = "django-db"
CELERY_CACHE_BACKEND = "default"
CELERY_BROKER_TRANSPORT_OPTIONS = {'visibility_timeout': 3600}
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f'redis://{os.environ.get("REDIS_HOST")}:6379/1'
    }
}

MATERIAL_FORMATS = {
    'image_formats': ['bmp', 'jpg', 'jpeg', 'png', 'heic', 'HEIC'],
    'video_formats': ['webm', 'mp4'],
    'animation_formats': ['gif'],
    'archive_formats': ['rar', 'zip', '7z'],
    'pdf_formats': ['pdf'],
    'word_formats': ['doc', 'docx'],
    'voice_formats': ['ogg', 'oga'],
    'audio_formats': ['mp3', 'm4a', 'wma'],
    'text_formats': ['txt'],
    'presentation_formats': ['pptx'],
}

X_FRAME_OPTIONS = 'SAMEORIGIN'

TG_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN").replace("\\", "")
TG_REDIS_URL = f'redis://{os.environ.get("REDIS_HOST")}:6379/2'
TG_WEBHOOKS_MODE = os.environ.get("TG_WEBHOOKS_MODE")
TG_WEB_SERVER_HOST = os.environ.get("TG_WEB_SERVER_HOST")
TG_WEBHOOK_SECRET = os.environ.get("TG_WEBHOOK_SECRET")
TG_WEBHOOK_PATH = os.environ.get("TG_WEBHOOK_PATH")
TG_SERVER_URL = os.environ.get("TELEGRAM_SERVER_URL")

TGPARSER_SESSION_NAME = os.environ.get("TGPARSER_SESSION_NAME")
TGPARSER_API_ID = os.environ.get("TGPARSER_API_ID")
TGPARSER_API_HASH = os.environ.get("TGPARSER_API_HASH")
TGPARSER_CHANNEL_NAME = os.environ.get("TGPARSER_CHANNEL_NAME")

EMAIL_HOST = "smtp.yandex.ru"
EMAIL_PORT = 465
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD")
EMAIL_USE_SSL = True
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
SERVER_EMAIL = EMAIL_HOST_USER
EMAIL_ADMIN = EMAIL_HOST_USER
