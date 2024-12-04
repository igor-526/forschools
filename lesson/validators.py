def validate_lesson_review_form(data: dict) -> dict:
    def validate_field(name: str, max_l: int):
        if not data.get(name):
            result['errors'][name] = "Поле не может быть пустым"
            result['status'] = False
        else:
            stripped_field = data.get(name).strip()
            field_len = len(stripped_field)
            if 5 < field_len < max_l:
                result['review'][name] = stripped_field
            else:
                result['errors'][name] = f"Поле должно содержать от 5 до {max_l} символов. У вас {field_len}"
                result['status'] = False

    result = {"status": True,
              "errors": {},
              "review": {}
              }
    validate_field("name", 200)
    validate_field("materials", 2000)
    validate_field("lexis", 300)
    validate_field("grammar", 300)
    validate_field("note", 2000)
    validate_field("org", 2000)
    result["review"].pop("name")
    return result
