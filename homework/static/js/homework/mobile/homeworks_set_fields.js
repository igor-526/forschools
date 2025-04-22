function homeworksMobileSetFieldsMain(){
    hwMobileSetFieldsModalAcceptButton.addEventListener("click", homeworksMobileSetFieldsAccept)
}

function homeworksMobileSetFieldsSetModal(){
    hwMobileSetFieldsModalLastStatusDateSwitch.checked = cookiesUtilsGet("hwMobFieldLastStatusDate") === "1"
    hwMobileSetFieldsModalLessonNameSwitch.checked = cookiesUtilsGet("hwMobFieldLessonName") === "1"
    hwMobileSetFieldsModalLessonDateSwitch.checked = cookiesUtilsGet("hwMobFieldLessonDate") === "1"
    hwMobileSetFieldsModalListenerSwitch.checked = cookiesUtilsGet("hwMobFieldListener") === "1"
    hwMobileSetFieldsModalTeacherSwitch.checked = cookiesUtilsGet("hwMobFieldTeacher") === "1"
    hwMobileSetFieldsModalAssignedDateSwitch.checked = cookiesUtilsGet("hwMobFieldAssignedDate") === "1"
    if (hwMobileSetFieldsModalTGButtonSwitch){
        hwMobileSetFieldsModalTGButtonSwitch.checked = cookiesUtilsGet("hwMobFieldTGButton") === "1"
    }
    bsHwMobileSetFieldsModal.show()
}

function homeworksMobileSetFieldsAccept(){
    cookiesUtilsSet("hwMobFieldLastStatusDate", hwMobileSetFieldsModalLastStatusDateSwitch.checked ? "1" : "0")
    cookiesUtilsSet("hwMobFieldLessonName", hwMobileSetFieldsModalLessonNameSwitch.checked ? "1" : "0")
    cookiesUtilsSet("hwMobFieldLessonDate", hwMobileSetFieldsModalLessonDateSwitch.checked ? "1" : "0")
    cookiesUtilsSet("hwMobFieldListener", hwMobileSetFieldsModalListenerSwitch.checked ? "1" : "0")
    cookiesUtilsSet("hwMobFieldTeacher", hwMobileSetFieldsModalTeacherSwitch.checked ? "1" : "0")
    cookiesUtilsSet("hwMobFieldAssignedDate", hwMobileSetFieldsModalAssignedDateSwitch.checked ? "1" : "0")
    if (hwMobileSetFieldsModalTGButtonSwitch){
        cookiesUtilsSet("hwMobFieldTGButton", hwMobileSetFieldsModalTGButtonSwitch.checked ? "1" : "0")
    }
    homeworksMobileFieldsSettingsLastStatusDate = hwMobileSetFieldsModalLastStatusDateSwitch.checked
    homeworksMobileFieldsSettingsLessonName = hwMobileSetFieldsModalLessonNameSwitch.checked
    homeworksMobileFieldsSettingsLessonDate = hwMobileSetFieldsModalLessonDateSwitch.checked
    homeworksMobileFieldsSettingsListener = hwMobileSetFieldsModalListenerSwitch.checked
    homeworksMobileFieldsSettingsTeacher = hwMobileSetFieldsModalTeacherSwitch.checked
    homeworksMobileFieldsSettingsAssignedDate = hwMobileSetFieldsModalAssignedDateSwitch.checked
    if (hwMobileSetFieldsModalTGButtonSwitch){
        homeworksMobileFieldsSettingsTGButton = hwMobileSetFieldsModalTGButtonSwitch.checked
    }
    bsHwMobileSetFieldsModal.hide()
    homeworkMobileGet()
}

const hwMobileSetFieldsModal = document.querySelector("#hwMobileSetFieldsModal")
const bsHwMobileSetFieldsModal = new bootstrap.Modal(hwMobileSetFieldsModal)
const hwMobileSetFieldsModalLastStatusDateSwitch = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalLastStatusDateSwitch")
const hwMobileSetFieldsModalLessonNameSwitch = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalLessonNameSwitch")
const hwMobileSetFieldsModalLessonDateSwitch = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalLessonDateSwitch")
const hwMobileSetFieldsModalListenerSwitch = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalListenerSwitch")
const hwMobileSetFieldsModalTeacherSwitch = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalTeacherSwitch")
const hwMobileSetFieldsModalAssignedDateSwitch = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalAssignedDateSwitch")
const hwMobileSetFieldsModalTGButtonSwitch = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalTGButtonSwitch")
const hwMobileSetFieldsModalAcceptButton = hwMobileSetFieldsModal.querySelector("#hwMobileSetFieldsModalAcceptButton")

homeworksMobileSetFieldsMain()