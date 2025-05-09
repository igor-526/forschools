from dls.settings import MATERIAL_FORMATS


def get_type(material_format: str):
    for mat_type in MATERIAL_FORMATS:
        if material_format and material_format.lower() in MATERIAL_FORMATS.get(mat_type):
            return mat_type
    return "unsupported"
