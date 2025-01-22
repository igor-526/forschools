from aiogram.filters.callback_data import CallbackData


class MaterialCategoryCallback(CallbackData, prefix="mat_cat"):
    cat_id: int


class MaterialLevelCallback(CallbackData, prefix="mat_lvl"):
    lvl_id: int


class MaterialTypeCallback(CallbackData, prefix="mat_type"):
    mat_type: str


class MaterialItemCallback(CallbackData, prefix="mat_item"):
    mat_id: int
    action: str
    obj_id: int | None


class MaterialListUserNavigationCallback(CallbackData, prefix="mat_list_user"):
    page: int
    user_id: int


class MaterialListHomeworkNavigationCallback(CallbackData, prefix="mat_list_homework"):
    page: int
    hw_id: int


class MaterialListActionCallback(CallbackData, prefix="mat_list_delete"):
    action: str


class MaterialItemSendTgCallback(CallbackData, prefix="mat_item_send"):
    mat_id: int
    tg_id: int
