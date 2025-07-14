function lessonsMobileSetFieldsMain(){
    lessonsMobileSetFieldsModalAcceptButton.addEventListener("click", lessonsMobileSetFieldsAccept)
}

function lessonsMobileSetFieldsSetModal(){
    lessonsMobileSetFieldsModalDateSwitch.checked = cookiesUtilsGet("lessonsMobFieldDate") === "1"
    lessonsMobileSetFieldsModalTimeSwitch.checked = cookiesUtilsGet("lessonsMobFieldTime") === "1"
    lessonsMobileSetFieldsModalTeacherSwitch.checked = cookiesUtilsGet("lessonsMobFieldTeacher") === "1"
    lessonsMobileSetFieldsModalListenersSwitch.checked = cookiesUtilsGet("lessonsMobFieldListeners") === "1"
    if (isAdmin){
        lessonsMobileSetFieldsModalAdminCommentSwitch.checked = cookiesUtilsGet("lessonsMobFieldAdminComment") === "1"
    }

    bsLessonsMobileSetFieldsModal.show()
}

function lessonsMobileSetFieldsAccept(){
    cookiesUtilsSet("lessonsMobFieldDate", lessonsMobileSetFieldsModalDateSwitch.checked ? "1" : "0")
    cookiesUtilsSet("lessonsMobFieldTime", lessonsMobileSetFieldsModalTimeSwitch.checked ? "1" : "0")
    cookiesUtilsSet("lessonsMobFieldTeacher", lessonsMobileSetFieldsModalTeacherSwitch.checked ? "1" : "0")
    cookiesUtilsSet("lessonsMobFieldListeners", lessonsMobileSetFieldsModalListenersSwitch.checked ? "1" : "0")

    if (isAdmin) {
        cookiesUtilsSet("lessonsMobFieldAdminComment", lessonsMobileSetFieldsModalAdminCommentSwitch.checked ? "1" : "0")
    }
    bsLessonsMobileSetFieldsModal.hide()
    lessonsMobileGet()
}

const lessonsMobileSetFieldsModal = document.querySelector("#lessonsMobileSetFieldsModal")
const bsLessonsMobileSetFieldsModal = new bootstrap.Modal(lessonsMobileSetFieldsModal)
const lessonsMobileSetFieldsModalDateSwitch = lessonsMobileSetFieldsModal.querySelector("#lessonsMobileSetFieldsModalDateSwitch")
const lessonsMobileSetFieldsModalTimeSwitch = lessonsMobileSetFieldsModal.querySelector("#lessonsMobileSetFieldsModalTimeSwitch")
const lessonsMobileSetFieldsModalTeacherSwitch = lessonsMobileSetFieldsModal.querySelector("#lessonsMobileSetFieldsModalTeacherSwitch")
const lessonsMobileSetFieldsModalListenersSwitch = lessonsMobileSetFieldsModal.querySelector("#lessonsMobileSetFieldsModalListenersSwitch")
const lessonsMobileSetFieldsModalAdminCommentSwitch = lessonsMobileSetFieldsModal.querySelector("#lessonsMobileSetFieldsModalAdminCommentSwitch")
const lessonsMobileSetFieldsModalAcceptButton = lessonsMobileSetFieldsModal.querySelector("#lessonsMobileSetFieldsModalAcceptButton")

lessonsMobileSetFieldsMain()