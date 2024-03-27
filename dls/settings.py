import os
from pathlib import Path

import django.core.cache.backends.redis

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY')

DEBUG = True

ALLOWED_HOSTS = ['localhost', '80.87.192.255', '0.0.0.0', '192.168.0.65']


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',   # фреймворк для RestAPI
    'django_filters',   # фильтрация данных для RestFramework
    'celery',   # создание задач
    'django_celery_results',    # результат выполнения задач
    'learning_plan',     # менеджмент планов обучения

    'tgbot',    # пользовательский бот Telegram
    'profile_management',   # профиль, логин, регистрация, выход, логирование действий
    'material',    # материалы для обучения, прикреплённые файлы
    'lesson',   # уроки
    'homework',  # домашние задания
    'data_collections',  # управление коллекциями данных
    'pdfviewer'     # просмотр PDF файлов
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'profile_management.middleware.LastActivityMiddleware',
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
        'PORT': os.environ.get('PORT')
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


STATIC_URL = 'static/'
STATICFILES_DIRS = [
  os.path.join(BASE_DIR, "static"),
]
MEDIA_ROOT = f'{BASE_DIR}/media'
MEDIA_URL = '/media/'
# STATIC_ROOT = os.path.join(BASE_DIR, "static")


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CELERY_BROKER_URL = "redis://dls_redis:6379/0"
CELERY_RESULT_BACKEND = "django-db"
CELERY_CACHE_BACKEND = "default"
CELERY_BROKER_TRANSPORT_OPTIONS = {'visibility_timeout': 3600}
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://dls_redis:6379/1'
    }
}

MATERIAL_FORMATS = {'image_formats': ['bmp', 'jpg', 'jpeg', 'png'],
                    'video_formats': ['webm', 'mkv', 'avi', 'mov', 'wmv', 'mp4', 'm4p', 'mpg', 'mpeg', 'm4v'],
                    'animation_formats': ['gif'],
                    'archive_formats': ['rar', 'zip', '7z'],
                    'pdf_formats': ['pdf']}

X_FRAME_OPTIONS = 'SAMEORIGIN'
