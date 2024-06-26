<div id="header" align="center">
<img src="gitstatic/githeader.png">
</div>
<div id="badges" align="center">
    <a href="https://t.me/devil_on_the_wheel">
        <img src="https://img.shields.io/badge/разработчик-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Badge"/>
    </a>
    <a href="https://forschools.ru">
        <img src="https://img.shields.io/badge/сайт-0078D7?style=for-the-badge&logo=microsoftedge&logoColor=white" alt="Site Badge"/>
    </a>
</div>
<h1>Описание проекта</h1>
Проект представляет собой сервис дистанционного обучения для онлайн школ. Взаимодействовать с сервисом возможно посредством WEB-интерфейса и бота Telegram

---
<h1>Возможности</h1>
<ol>
    <li><b>Профили</b></li>
        <p>
Система менеджмента профилей предполагает 4 роли: Администратор, методист, 
преподаватель и ученик. На основе этих ролей выстроена система взаимодействия занятий, 
домашних заданий, материалов и тд. Помимо браузерного взаимодействия с системой, есть система 
привязки аккаунтов мессенджера Telegram к аккаунтам системы, что позволяет оперативно 
использовать некоторый функционал, а также получать информативные уведомления о предстоящих 
и новых событиях
        </p>
    <li><b>Материалы и файлы</b></li>
        <p>
Сервис поддерживает следуюзие типы материалов: изображения, PDF-документы, анимации, архивы, 
видео. Материалы делятся на личные и общие. Материалы могут быть прикреплены к занятиям и 
домашним заданиям, а также оперативно присланы ученику посредством мессенджера Telegram<br>
Файлы - всё, что передаётся между преподавателем и учеником в процессе проверки домашнего 
задания. На данный момент поддерживаются изображения и голосовые сообщения (отправка только 
через Telegram)
        </p>
    <li><b>Планы обучения, этапы и занятия</b></li>
        <p>
Всё расписание занятий строится на плане обучения, его сроках и этапах. 
При составлении преподавателем или методистом плана обучения автоматизируется создание 
занятий, к которым можно прикрепить необходимые материалы. Ученик не сможет сразу увидеть 
весь план обучения и материалы, что позволяет избежать преждевременного несанкционированного 
прохождения программы учеником
        </p>
    <li><b>Домашние задания</b></li>
        <p>
Домашние задания создаются на основе занятия. К нему можно прикрепить материалы, которыми 
ученик может воспользоваться при его решении. К домашнему заданию ученик получает доступ 
только после занятия. После создания домашнего задания (или после занятия, в случае, если оно 
было задано заранее) ученику в Telegram приходит уведомление. Дальнейшее взаимодействие с 
этим домашним заданием возможно исключительно посредством мессенджера Telegram
        </p>
</ol>

---
<h1>Задействованные технологии</h1>

![python](https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![django](https://img.shields.io/badge/django-092E20?style=for-the-badge&logo=django&logoColor=white)
![postgresql](https://img.shields.io/badge/postgresql-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![aiogram](https://img.shields.io/badge/aiogram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)
![linux](https://img.shields.io/badge/linux-FCC624?style=for-the-badge&logo=linux&logoColor=white)
![docker](https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![nginx](https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![html5](https://img.shields.io/badge/html5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![bootstrap](https://img.shields.io/badge/bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![js](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white)

---
<h1>История изменений</h1>
<h3>v. 20240428dev</h3>
<ul>
    <li>"Урок" переименован в "Занятие"</li>
    <li>Добавлена поддержка открытия в TG материалов: аудио, видео, голосовые сообщения</li>
    <li>Последний ответ ученика/преподавателя отображается в модальном окне проверки/сдачи</li>
    <li>Добавлена поддержка mp4</li>
    <li>В профиле ученика можно увидеть его занятия и домашние задания</li>
    <li>Создавать домашние задания теперь можно не на базе урока</li>
    <li>Через Telegram преподаватель может отфильтровать домашние задания для проверки по ученику</li>
</ul><br>

<h3>v. 20240427dev</h3>
<ul>
    <li>Добавлено автоматическое заполнение полей наименований плана обучения, этапа, занятия и ДЗ</li>
    <li>Добавлена поддержка видеоформатов при сдаче и проверке ДЗ</li>
    <li>Убрано дополнительное подтверждение в TG при сдаче/проверке ДЗ</li>
    <li>Исправлены некоторые баги с доступами через Telegram</li>
</ul><br>

<h3>v. 20240426dev</h3>
<ul>
    <li>Исправлен баг с отказом доступа при регистрации пользователя</li>
    <li>Исправлен баг, при котором запросы PATCH невозможны</li>
    <li>Убрана зависимость от FontAwesome</li>
</ul><br>

<h3>v. 20240425dev</h3>
<ul>
    <li>Редактирование пользователей/присвоение нескольких ролей зарегистрированному пользователю на странице администрирования пользователями на основе доступов</li>
    <li>Привязка/отвязка Telegram зарегистрированным пользователям на основе доступов</li>
    <li>Изменение/удаление фотографии чужого профиля на странице администрирования пользователями на основе доступов</li>
    <li>Активация/деактивация пользователей на странице администрирования пользователями на основе доступов</li>
    <li>Присвоение нескольких ролей при регистрации пользователя на основе доступов</li>
</ul><br>

<h3>v. 20240423dev</h3>
<ul>
    <li>Исправлен баг с невозможностью редактирования своего профиля</li>
    <li>Организация доступов к странице администрирования пользователей</li>
    <li>Авторизованный пользователь не показывается на странице администрирования пользователей</li>
</ul><br>

<h3>v. 20240423dev</h3>
<ul>
    <li>Реализация автодобавления преподавателя для домашних заданий относительно настроек стандартного поведения плана обучения</li>
    <li>Исправление бага с некорректной сортировкой этапов обучения/занятий</li>
    <li>Удаление/редактирование планов/этапов обучения/занятий</li>
</ul><br>

<h3>v. 20240421dev</h3>
<ul>
    <li>Организация доступов видимости занятия и материалов учеником относительно настроек плана обучения</li>
    <li>Организация доступов возможности изменения материалов занятия и создания ДЗ</li>
</ul><br>

<h3>v. 20240420dev</h3>
<ul>
    <li>Исправлено отображение таблицы материалов</li>
    <li>Исправлен баг с добавленем материала только в личные</li>
    <li>Организация доступов в материалах для всех ролей</li>
    <li>Редактирование, удаление (скрытие видимости) материалов на освнове ролей</li>
    <li>Исправлена ошибка при открытии PDF документа</li>
    <li>Добавлена поддержка презентаций</li>
    <li>Добавлена нативная поддержка аудио, видео и тектовых материалов</li>
</ul><br>

<h3>v. 20240419dev</h3>
<ul>
    <li>Добавлена возможность установки сроков видимости занятий и материалов к ним в планах обучения</li>
    <li>Добавлена возможность установки проверяющего по умолчанию для домашних заданий</li>
    <li>Организация доступов в планах обучения</li>
    <li>Ручная замена преподавателя на занятие</li>
    <li>Ручная замена проверяющего ДЗ</li>
    <li>Добавлен favicon</li>
</ul><br>

<h3>v. 20240417dev</h3>
<ul>
    <li>Добавлена поддержка аудиоформатов m4a и mp3 в файлах домашнего задания для TG + WEB</li>
</ul><br>

<h3>v. 20240416dev</h3>
<ul>
    <li>Релиз продукта</li>
</ul><br>

