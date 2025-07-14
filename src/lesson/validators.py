def validate_lesson_review_form(data: dict, name_only) -> dict:
    def validate_field(name: str, max_l: int):
        if not data.get(name):
            result['errors'][name] = "Поле не может быть пустым"
            result['status'] = False
        else:
            stripped_field = data.get(name).strip()
            field_len = len(stripped_field)
            if field_len > max_l:
                result['errors'][name] = (f"Поле не может быть "
                                          f"более {max_l} символов. У вас "
                                          f"{field_len}")
                result['status'] = False
            else:
                result['review'][name] = stripped_field

    result = {"status": True,
              "errors": {},
              "review": {}}

    validate_field("name", 200)
    if not name_only:
        validate_field("materials", 2000)
        validate_field("lexis", 300)
        validate_field("grammar", 300)
        validate_field("note", 2000)
        validate_field("org", 2000)
    if result['review'].get('name'):
        result["review"].pop("name")
    return result
