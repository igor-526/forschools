import sys
from django.core.management.base import BaseCommand, CommandError
import logging
import re
from telethon.helpers import TotalList
from telethon.tl.patched import Message
from dls import settings
from telethon import TelegramClient
from profile_management.models import NewUser
from material.models import MaterialCategory, Material


class ChannelMessage:
    msg_object: Message
    file_info: str
    category: list
    description: str
    m_owner: int
    prefix = ""
    m_type = 1

    def __init__(self, message, prefix, m_owner):
        self.msg_object = message
        self.file_info = self.get_file_info()
        self.category = self.get_hashtags()
        self.description = self.get_text_without_hashtags()
        self.name = self.get_file_name()
        self.prefix = prefix
        self.m_owner = m_owner

    def __str__(self):
        return (f'ID: {self.msg_object.id}\n'
                f'ДАТА: {self.msg_object.date}\n'
                f'ФАЙЛЫ: {self.file_info if self.file_info else "отсутствуют"}\n'
                f'КАТЕГОРИИ: {self.category}\n'
                f'ТЕКСТ: {self.get_text_without_hashtags() if self.get_text_without_hashtags() else "отсутствует"}\n\n'
                f'ИМЯ МАТЕРИАЛА: {self.name}')

    def get_hashtags(self):
        if self.msg_object.text:
            hashtags = re.findall(r"#(\w+)", self.msg_object.text)
            return hashtags
        else:
            return []

    def get_text_without_hashtags(self):
        text = self.msg_object.text
        if text:
            for ht in self.category:
                text.replace(ht, "")
            text = text.strip(" ")
            if text != "":
                return text
            else:
                return None
        else:
            return None

    def get_file_name(self):
        fn = ""
        if self.msg_object.file:
            if self.msg_object.file.name:
                ext = self.msg_object.file.name
                fn = self.msg_object.file.name.replace(ext, '')
        if self.description:
            fn = " ".join(self.description.split(" ")[:7])
        if fn == "" or fn is None:
            fn = f'{self.msg_object.id}_{self.prefix}_{self.file_info}'
        fn = fn.replace("\n", " ").strip(".").strip(",").strip(":").strip(" ")
        return fn

    def get_file_info(self):
        if self.msg_object.file:
            if self.msg_object.gif:
                return f"animation"
            else:
                return self.msg_object.file.mime_type.split("/")[0]
        else:
            return "text"

    def get_fileext(self):
        fi = self.get_file_info()
        if fi == "animation":
            return ".gif"
        elif fi == "text":
            return ".txt"
        else:
            return self.msg_object.file.ext

    def get_file_path(self):
        return f'{self.get_file_name()}{self.get_fileext()}'

    async def get_categories(self) -> list:
        cats = []
        for cat in self.category:
            category = await MaterialCategory.objects.aget_or_create(name=cat)
            cats.append(category[0])
        return cats

    async def save_material(self):
        path = f'media/materials/{self.get_file_path()}'
        path_for_db = f'materials/{self.get_file_path()}'
        fi = self.get_file_info()
        print("Сохранение файла")
        if fi != "text":
            await self.msg_object.download_media(path)
        else:
            with open(path, "w") as f:
                f.write(self.get_text_without_hashtags())
        categories = await self.get_categories()
        mat = await Material.objects.acreate(
            owner=self.m_owner,
            name=self.name,
            description=self.description,
            file=path_for_db,
            type=self.m_type,
            visible=True
        )
        await mat.category.aset(categories)
        await mat.asave()
        return True




def get_dialog(dialogs: TotalList):
    out = list(filter(lambda d: d.name == settings.TGPARSER_CHANNEL_NAME, dialogs))
    return out[0]


async def get_m_owner():
    usrID = input("Введите ID пользователя, который будет владельцем материалов: ")
    usr = await NewUser.objects.filter(id=usrID).afirst()
    if usr is None:
        print("Ошибка! Пользователь не найден!")
        sys.exit()
    else:
        print(usr)
        return usr


def log_result(saved: int | None = None, passed: int | None = None, failed: int | None = None):
    filename = ""
    res = ""
    if saved:
        filename = 'saved.txt'
        res = saved
    if passed:
        filename = 'passed.txt'
        res = passed
    if failed:
        filename = 'failed.txt'
        res = failed
    with open(f"tgparser/logs/{filename}", 'a') as f:
        f.write(f'{res}\n')


def parse_manual_set_cats(obj=None):
    categories = []
    while True:
        new_cat = input("Введите категории, в которые будем добавлять, после чего нажмите Enter на пустой строке: ")
        if new_cat != "":
            categories.append(new_cat)
        else:
            print("Категории установлены")
            if obj is not None:
                obj.category = categories
            return categories


def parse_manual_set_name(obj):
    name = input("Введите наименование материала: ")
    if name == "":
        print("Некорректный ввод")
    obj.name = name


async def parse_manual(messages: list, owner: NewUser):
    prefix = input("Введите префикс для нераспознанных наименований: ")
    menunsg = ("1. Сохранить\n"
               "2. Сменить наименование\n"
               "3. Сменить категории\n"
               "4. Пропустить\n"
               "q. Выход\n"
               "?. Показать это меню ещё раз")
    categories = parse_manual_set_cats()
    print(menunsg)
    for msg in messages:
        action = ""
        msg_object = ChannelMessage(msg, prefix, owner)
        while action != "q":
            with open("tgparser/logs/saved.txt", "r") as f:
                if str(msg.id) in [e.strip("\n") for e in f.readlines()]:
                    break
            if not msg_object.file_info and not msg_object.category and not msg_object.get_text_without_hashtags():
                break
            msg_object.category = categories
            print(msg_object.get_file_path())
            action = input("Выберите действие: ")
            if action == "1":
                res = await msg_object.save_material()
                if res is True:
                    print("СОХРАНЕНО")
                    log_result(saved=msg_object.msg_object.id)
                else:
                    print("НЕ СОХРАНЕНОй")
                    log_result(failed=msg_object.msg_object.id)
                break
            if action == "2":
                parse_manual_set_name(obj=msg_object)
            if action == "3":
                categories = parse_manual_set_cats(obj=msg_object)
            if action == "4":
                log_result(passed=msg_object.msg_object.id)
                break
            if action == "?":
                print(menunsg)
            if action == "q":
                sys.exit()


async def main(client):
    print("Получение всех диалогов")
    dialogs = await client.get_dialogs()
    print(f'Поиск диалога: "{settings.TGPARSER_CHANNEL_NAME}"')
    dialog = get_dialog(dialogs)
    print("Получение всех сообщений")
    messages = client.iter_messages(dialog)
    messages = list(reversed([msg async for msg in messages]))
    print(f"Получено {len(messages)} сообщений")
    owner = await get_m_owner()
    action_mode = input("1. Автомат\n2. Ручное\nВыберите режим: ")
    while True:
        if action_mode == "1":
            break
        elif action_mode == "2":
            await parse_manual(messages, owner)
        else:
            print("Некорректный ввод")
            break


class Command(BaseCommand):
    help = 'This command starts up the Telegram bot'

    def handle(self, *args, **kwargs):
        try:
            logging.getLogger().setLevel(logging.DEBUG)
            client = TelegramClient(settings.TGPARSER_SESSION_NAME,
                                    settings.TGPARSER_API_ID,
                                    settings.TGPARSER_API_HASH)
            with client:
                print("Авторизация")
                client.loop.run_until_complete(main(client))
        except Exception as ex:
            raise CommandError(ex)
