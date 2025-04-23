function cookiesInit(){
    !cookiesUtilsGet("hwMobFieldLastStatusDate") ? cookiesUtilsSet("hwMobFieldLastStatusDate", "1") : null
    !cookiesUtilsGet("hwMobFieldLessonName") ? cookiesUtilsSet("hwMobFieldLessonName", "1") : null
    !cookiesUtilsGet("hwMobFieldLessonDate") ? cookiesUtilsSet("hwMobFieldLessonDate", "1") : null
    !cookiesUtilsGet("hwMobFieldListener") ? cookiesUtilsSet("hwMobFieldListener", "1") : null
    !cookiesUtilsGet("hwMobFieldTeacher") ? cookiesUtilsSet("hwMobFieldTeacher", "1") : null
    !cookiesUtilsGet("hwMobFieldAssignedDate") ? cookiesUtilsSet("hwMobFieldAssignedDate", "1") : null
    !cookiesUtilsGet("hwMobFieldTGButton") ? cookiesUtilsSet("hwMobFieldTGButton", "1") : null
    !cookiesUtilsGet("lessonsMobFieldDate") ? cookiesUtilsSet("lessonsMobFieldDate", "1") : null
    !cookiesUtilsGet("lessonsMobFieldTime") ? cookiesUtilsSet("lessonsMobFieldTime", "1") : null
    !cookiesUtilsGet("lessonsMobFieldTeacher") ? cookiesUtilsSet("lessonsMobFieldTeacher", "1") : null
    !cookiesUtilsGet("lessonsMobFieldListeners") ? cookiesUtilsSet("lessonsMobFieldListeners", "1") : null
    !cookiesUtilsGet("lessonsMobFieldHWButton") ? cookiesUtilsSet("lessonsMobFieldHWButton", "1") : null
    !cookiesUtilsGet("lessonsMobFieldHWCount") ? cookiesUtilsSet("lessonsMobFieldHWCount", "1") : null
    !cookiesUtilsGet("lessonsMobFieldAdminComment") ? cookiesUtilsSet("lessonsMobFieldAdminComment", "1") : null
}

function cookiesUtilsGet(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : null
}

function cookiesUtilsSet(name, value, options = {}) {
    options = {
        path: "/",
        "max-age": 99999999,
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }

    document.cookie = updatedCookie;
}

cookiesInit()