from aiogram.utils import executor
import schedule_tasks
import config
from funcs import add_auto, add_contacts, add_city, add_base, log
from models import db_bind, db_reset
from create_bot import dp
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import time


async def on_startup(_):
    time.sleep(2)
    print("Connecting to database...")
    try:
        await db_bind()
        print("Connected to database succesfully!\n")
    except Exception as ex:
        print("Couldn't connect to database. Please, check")
        print(ex)
        return
    if config.resetdb == 1:
        await db_reset()
        print("DATABASE WAS RESETED\n")

    if config.upd_city == 1:
        print("Updating cities...")
        try:
            await add_city.add_city()
            print("Updated succesfully!\n")
        except:
            print("Error. Please, check fixtures")
            return

    if config.upd_base == 1:
        print("Updating bases...")
        try:
            await add_base.add_base()
            print("Updated succesfully!\n")
        except:
            print("Error. Please, check fixtures")
            return

    if config.upd_auto == 1:
        print("Updating auto...")
        try:
            await add_auto.add_auto()
            print("Updated succesfully!\n")
        except:
            print("Error. Please, check fixtures")
            return

    if config.upd_cont == 1:
        print("Updating contacts")
        try:
            await add_contacts.add_contacts()
            print("Updated succesfully!\n")
        except:
            print("Error. Please, check fixtures")
            return
    await log("bot", "Started", "None")
    scheduler = AsyncIOScheduler(timezone='Europe/Moscow')
    scheduler.add_job(schedule_tasks.upd_wd, trigger='cron', day=1, hour=8,
                      minute=0)
    scheduler.start()
    print("Bot started succesfully!")

if __name__ == "__main__":
    from handlers import (register_handlers_cf_s_odo,
                          register_handlers_cf_f_odo,
                          register_handlers_cf_fuel,
                          register_handlers_cf_refuel,
                          register_handlers_cf_sel_auto,
                          register_handlers_cf_confirm,
                          register_handlers_at_s_time,
                          register_handlers_at_f_time,
                          register_handlers_at_day_status,
                          register_handlers_at_confirm,
                          register_handlers_at_ch_date,
                          register_handlers_commands,
                          register_handlers_menu,
                          register_handlers_contacts_show,
                          register_handlers_contacts_search,
                          register_handlers_turnover_add,
                          register_handlers_turnover_confirm,
                          register_handlers_settings_name,
                          register_handlers_settings_menu,
                          register_handlers_settings_mode,
                          register_handlers_settings_delete,
                          register_handlers_settings_wd,
                          register_handlers_settings_place,
                          register_handlers_registration_city,
                          register_handlers_registration_schedule,
                          register_handlers_registration_base,
                          register_handlers_registration_instruct,
                          register_handlers_registration_wd,
                          register_handlers_reports_to_delete,
                          register_handlers_reports_fuel_delete,
                          register_handlers_reports_time_delete,
                          register_handlers_reports_to_select,
                          register_handlers_reports_fuel,
                          register_handlers_reports_fuel_select,
                          register_handlers_reports_menu,
                          register_handlers_reports_time_select,
                          register_handlers_reports_time,
                          register_handlers_reports_to,
                          register_handlers_reportissue)

    register_handlers_commands(dp)
    register_handlers_menu(dp)
    register_handlers_contacts_search(dp)
    register_handlers_contacts_show(dp)
    register_handlers_cf_s_odo(dp)
    register_handlers_cf_f_odo(dp)
    register_handlers_cf_fuel(dp)
    register_handlers_cf_refuel(dp)
    register_handlers_cf_sel_auto(dp)
    register_handlers_cf_confirm(dp)
    register_handlers_at_s_time(dp)
    register_handlers_at_f_time(dp)
    register_handlers_at_day_status(dp)
    register_handlers_at_confirm(dp)
    register_handlers_at_ch_date(dp)
    register_handlers_turnover_add(dp)
    register_handlers_turnover_confirm(dp)
    register_handlers_reports_menu(dp)
    register_handlers_reports_time(dp)
    register_handlers_reports_time_select(dp)
    register_handlers_reports_time_delete(dp)
    register_handlers_reports_fuel(dp)
    register_handlers_reports_fuel_select(dp)
    register_handlers_reports_fuel_delete(dp)
    register_handlers_reports_to(dp)
    register_handlers_reports_to_select(dp)
    register_handlers_reports_to_delete(dp)
    register_handlers_reportissue(dp)
    register_handlers_settings_menu(dp)
    register_handlers_settings_place(dp)
    register_handlers_settings_wd(dp)
    register_handlers_settings_name(dp)
    register_handlers_settings_mode(dp)
    register_handlers_settings_delete(dp)
    register_handlers_registration_instruct(dp)
    register_handlers_registration_wd(dp)
    register_handlers_registration_base(dp)
    register_handlers_registration_city(dp)
    register_handlers_registration_schedule(dp)

if __name__ == "__main__":
    executor.start_polling(dp, on_startup=on_startup)
