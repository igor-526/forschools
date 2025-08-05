<div id="header" align="center">
  <img src="https://media.giphy.com/media/h408T6Y5GfmXBKW62l/giphy.gif" width="200"/>
</div>

<div id="badges" align="center">
  <a href="https://t.me/devil_on_the_wheel">
    <img src="https://img.shields.io/badge/telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Badge"/>
  </a>
  <a href="https://wa.me/+79117488008">
    <img src="https://img.shields.io/badge/whatsapp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Telegram Badge"/>
  </a>
  <a href="https://www.linkedin.com/in/igor526/">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Badge"/>
  </a>
  <a href="igor-526@yandex.ru">
    <img src="https://img.shields.io/badge/email-orange?style=for-the-badge&logo=mail.ru&logoColor=white" alt="LinkedIn Badge"/>
  </a>
</div>

<div id="view_counter" align="center">
  <img src="https://komarev.com/ghpvc/?username=igor-526&color=blue&style=for-the-badge&label=Просмотры"/>
</div>

---

![Forschools Header](gitstatic/githeader.png)

*Многофункциональная платформа для дистанционного обучения с интеграцией Telegram*

## О проекте

Forschools – это современная платформа для дистанционного обучения с глубокой интеграцией Telegram. Система предоставляет комплексное решение для организации учебного процесса, включая проведение занятий, выдачу и проверку домашних заданий, коммуникацию между участниками и аналитику.

Ключевая особенность – двусторонняя синхронизация между веб-интерфейсом и Telegram-ботом, что позволяет пользователям взаимодействовать с платформой любым удобным способом.

## Основные роли пользователей

| Роль | Описание |
|------|----------|
| 👑 Администратор | Регистрация пользователей, обработка обращений, создание планов обучения |
| 📚 Методист | Согласование действий преподавателей по ДЗ |
| 👨‍🏫 Преподаватель | Проведение занятий, ревью, задание ДЗ |
| 👩‍💼 Куратор | Проверка домашних заданий |
| 👨‍🎓 Ученик | Выполнение домашних заданий |

## Функциональные блоки

### Основные модули
- **Главная** – информативный дэшборд с таблицами занятий, мест проведения и ближайших событий
- **Профиль** – основная и дополнительная информация о пользователе
- **Сообщения** – обмен сообщениями между пользователями (веб + Telegram)
- **Материалы** – учебные материалы для ДЗ и занятий
- **Шаблоны уроков** – создание шаблонов планов обучения
- **Планы обучения** – управление учебными планами с автоматическим расписанием
- **Занятия** – управление занятиями с уведомлениями в Telegram
- **Домашние задания** – полный цикл работы с ДЗ (создание, проверка, доработка)

### Администрирование
- **Управление пользователями** – регистрация, редактирование, привязка Telegram
- **Коллекция данных** – управление уровнями, категориями, местами проведения
- **Рассылки** – массовые рассылки в Telegram и по email

### Журналы
- Выгрузки данных (Excel)
- Журнал Telegram (уведомления)
- Журнал событий пользователя
- Ошибки WSGI и Telegram

### Техподдержка
- Система тикетов для пользователей (веб + Telegram)

## Технологический стек

| Тип       | Технологии                                             |
|-----------|--------------------------------------------------------|
| **Языки** | ![python](https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white) ![js](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white) |
| **Backend** | [![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/) [![REST API](https://img.shields.io/badge/REST_API-FF6C37?style=for-the-badge&logo=fastapi&logoColor=white)](https://www.django-rest-framework.org/) |
| **База данных** | ![postgresql](https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Telegram бот** | [![Aiogram](https://img.shields.io/badge/Aiogram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://docs.aiogram.dev/) |
| **Асинхронные задачи** | [![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/) [![Celery](https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/) |
| **Фронтенд** | ![html5](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white) [![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/) |
| **Инфраструктура** | [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/) [![Docker Compose](https://img.shields.io/badge/Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/) |
| **Стиль кода** | [![PEP8](https://img.shields.io/badge/PEP8-794013?style=for-the-badge)](https://www.docker.com/) |

- **Backend**: Django, Django REST Framework
- **База данных**: PostgreSQL
- **Telegram бот**: Aiogram, Telethon
- **Асинхронные задачи**: Celery, Redis
- **Фронтенд**: JavaScript, Bootstrap
- **Инфраструктура**: Docker, Docker Compose
- **Стиль кода**: PEP 8

## Особенности реализации

- Локальный сервер Telegram бота
- Отдельная мобильная версия платформы
- Полная синхронизация между веб-интерфейсом и Telegram
- Автоматические уведомления о событиях
- Выгрузка данных в Excel
- Подробные журналы активности и ошибок



