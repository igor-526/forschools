def validate_lesson_review_form(data: dict) -> dict:
    def validate_field(name: str, name_ru: str, max_l: int):
        if not data.get(name):
            result['errors'].append(f"{name_ru} не может быть пустым")
            result['status'] = False
        else:
            stripped_field = data.get(name).strip()
            field_len = len(stripped_field)
            if field_len > max_l:
                result['errors'].append(f"{name_ru} не может быть "
                                        f"более {max_l} символов. У вас "
                                        f"{field_len}")
                result['status'] = False
            else:
                result['review'][name] = stripped_field

    result = {"status": True,
              "errors": [],
              "review": {}}

    validate_field("name", "Наименование занятия", 200)
    validate_field("materials", "Поле 'Используемые материалы'", 2000)
    validate_field("lexis", "Поле 'Лексика'", 300)
    validate_field("grammar", "Поле 'Грамматика'", 300)
    validate_field("note", "Поле 'Примечание'", 2000)
    validate_field("org", "Поле 'Орг. моменты и поведение "
                          "ученика'", 2000)
    if result['review'].get('name'):
        result["review"].pop("name")
    return result
