from aiogram import Router, F, types
from aiogram.filters import StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery
from homework.models import Homework
from tgbot.finite_states.homework import HomeworkNewFSM
from tgbot.funcs.homeworks import (add_homework_select_lesson, add_homework_set_homework_message,
                                   add_homework_set_homework_ready, send_hw_materials, hw_for_curator_set)
from tgbot.funcs.materials_add import FileParser
from tgbot.funcs.menu import send_menu
from tgbot.keyboards.callbacks.homework import (HomeworkMenuCallback, HomeworkNewCallback,
                                                HomeworkCallback, HomeworkNewSelectDateCallback,
                                                HomeworkCuratorCallback, HomeworkNewSelectDateFakeCallback)
from tgbot.keyboards.homework import get_homework_editing_buttons

router = Router(name=__name__)


@router.callback_query(HomeworkCallback.filter(F.action == "edit"))
async def h_homework_edit(callback: CallbackQuery,
                          callback_data: HomeworkCallback,
                          state: FSMContext) -> None:
    hw = await Homework.objects.select_related("listener").aget(pk=callback_data.hw_id)
    await state.set_data({
        "new_hw": {
            "hw_id": hw.id,
            "listener_id": hw.listener.id,
            "name": hw.name,
            "description": hw.description,
            "materials": [m.id async for m in hw.materials.all()],
            "deadline": {
                'day': hw.deadline.day,
                'month': hw.deadline.month,
                'year': hw.deadline.year
            } if hw.deadline else None,
        },
        "messages_to_delete": []
    })
    await add_homework_set_homework_message(callback.from_user.id, state)


@router.callback_query(HomeworkNewSelectDateFakeCallback.filter(F.action == "show"))
async def h_homework_select_lesson_current_date(callback: CallbackQuery) -> None:
    await callback.answer("Показаны занятия текущей даты. Пожалуйста, выберите занятие, к которому прикрепить ДЗ")


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.text == "Подтвердить ДЗ")
async def h_homework_sethw_ready(message: types.Message, state: FSMContext) -> None:
    sd = await state.get_data()
    if sd.get("new_hw") and sd.get("new_hw").get("hw_id"):
        await add_homework_set_homework_ready(state=state,
                                              message=message)
    else:
        await add_homework_select_lesson(user_tg_id=message.from_user.id,
                                         message=message)


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.text == "Отмена")
async def h_homework_sethw_cancel(message: types.Message, state: FSMContext) -> None:
    await message.delete()
    await send_menu(message.from_user.id, state)


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.text == "Показать прик. материалы")
async def h_homework_set_hw_materials(message: types.Message, state: FSMContext) -> None:
    sd = await state.get_data()
    if sd.get("new_hw") and sd.get("new_hw").get("materials"):
        await send_hw_materials(mat_ids=sd.get("new_hw").get("materials"),
                                hw_id=sd.get("new_hw").get("hw_id"),
                                user_id=message.from_user.id,
                                callback=None,
                                state=state,
                                meta=True,
                                del_hw_msg=False)
    else:
        await message.answer("Не прикреплено ни одного материала.\n"
                             "Для прикрепления просто отправьте или перешлите их мне")
    await message.delete()


@router.message(StateFilter(HomeworkNewFSM.change_menu),
                F.media_group_id != None)
async def h_homework_set_hw_add_media_group(message: types.Message, state: FSMContext, media_events=[]):
    materials_list = []
    for media_event in media_events:
        material = FileParser(
            message=media_event,
            mode="material",
            success_text="Материал успешно прикреплён к ДЗ!",
            reply_markup=get_homework_editing_buttons(),
            add_time_stamp=False,
            ignore_text=False
        )
        await material.download()
        materials_list.append(material.ready_material.id)
    state_data = await state.get_data()
    state_data["new_hw"]["materials"].extend(materials_list)
    await state.set_data(state_data)


@router.message(StateFilter(HomeworkNewFSM.change_menu))
async def h_homework_set_hw_add_material(message: types.Message, state: FSMContext) -> None:
    messages = [message]
    if message.reply_to_message:
        messages.append(message.reply_to_message)
    for m in messages:
        material = FileParser(
            message=m,
            mode="material",
            success_text="Материал успешно прикреплён к ДЗ!",
            reply_markup=get_homework_editing_buttons(),
            add_time_stamp=False,
            ignore_text=False
        )
        await material.download()
        if material.ready_material:
            state_data = await state.get_data()
            state_data["new_hw"]["materials"].append(material.ready_material.id)
            await state.set_data(state_data)


@router.callback_query(HomeworkNewCallback.filter())
async def h_homework_add(callback: CallbackQuery,
                         callback_data: HomeworkNewCallback,
                         state: FSMContext) -> None:
    state_data = await state.get_data()
    if state_data.get('new_hw') is None:
        await callback.answer("Похоже, нет сформированного ДЗ для отправки. Создайте, пожалуйста, "
                              "ДЗ через главное меню")
        await callback.message.delete()
        return
    state_data['new_hw']['lesson_id'] = callback_data.lesson_id
    await state.update_data(state_data)
    await add_homework_set_homework_ready(state=state,
                                          callback=callback)


@router.callback_query(HomeworkNewSelectDateCallback.filter())
async def h_homework_add_navigate(callback: CallbackQuery,
                                  callback_data: HomeworkNewSelectDateCallback) -> None:
    await add_homework_select_lesson(user_tg_id=callback.from_user.id,
                                     callback=callback,
                                     date_=callback_data.date)


@router.callback_query(HomeworkMenuCallback.filter(F.action == 'new'))
async def h_homework_sethw(callback: CallbackQuery,
                           state: FSMContext) -> None:
    await add_homework_set_homework_message(callback.from_user.id, state)
    await callback.message.delete()


@router.callback_query(HomeworkCuratorCallback.filter())
async def h_homework_for_curator_set(callback: CallbackQuery,
                                     callback_data: HomeworkCuratorCallback) -> None:
    await hw_for_curator_set(callback, callback_data)
