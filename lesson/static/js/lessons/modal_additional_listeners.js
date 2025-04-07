function lessonAdditionalListenersModalMain(){
    lessonAdditionalListenersModalChangeButton.addEventListener("click", lessonAdditionalListenersModalAddListeners)
    lessonAdditionalListenersModalSearchListeners()
}

function lessonAdditionalListenersModalGetListeners(){
    function getListenerListener(listenerID, element){
        const index = lessonAdditionalListenersSelected.indexOf(listenerID)
        switch (index){
            case -1:
                lessonAdditionalListenersSelected.push(listenerID)
                element.classList.add("active")
                break
            default:
                lessonAdditionalListenersSelected.splice(index, 1)
                element.classList.remove("active")
                break
        }
    }

    function getListenerElement(listener){
        const li = document.createElement("li")
        li.classList.add("list-group-item")
        if (lessonAdditionalListenersSelected.indexOf(listener.id) !== -1){
            li.classList.add("active")
        }
        li.innerHTML = `${listener.first_name} ${listener.last_name}`
        li.addEventListener("click", function (){
            getListenerListener(listener.id, li)
        })
        return li
    }

    usersAPIGetListeners().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(listener => {
                    lessonAdditionalListenersModalList.insertAdjacentElement("beforeend", getListenerElement(listener))
                })
                lessonAdditionalListenersDownloaded = true
                bsLessonAdditionalListenersModal.show()
                break
            default:
                showErrorToast("Не удалось загрузить список учеников для добавления")
                break
        }
    })
}

function lessonAdditionalListenersModalSet(selectedLesson, refreshPage=false){
    lessonAdditionalListenersSelectedLesson = selectedLesson
    lessonAdditionalListenersRefreshPage = refreshPage
    if (!lessonAdditionalListenersDownloaded){
        lessonAdditionalListenersModalGetListeners()
    } else {
        bsLessonAdditionalListenersModal.show()
    }
}

function lessonAdditionalListenersModalSearchListeners(){
    lessonAdditionalListenersModalSearchField.addEventListener("input", function () {
        const query = new RegExp(lessonAdditionalListenersModalSearchField.value.trim().toLowerCase())
        lessonAdditionalListenersModalList.querySelectorAll("li").forEach(element => {
            query.test(element.innerHTML.trim().toLowerCase()) ?
                element.classList.remove("d-none") :
                element.classList.add("d-none")
        })
    })
    lessonAdditionalListenersModalSearchFieldErase.addEventListener("click", function () {
        lessonAdditionalListenersModalSearchField.value = ""
        lessonAdditionalListenersModalList.querySelectorAll("li").forEach(element => {
            element.classList.remove("d-none")
        })
    })
}

function lessonAdditionalListenersModalAddListeners(){
    function getFormData(){
        const fd = new FormData()
        lessonAdditionalListenersSelected.forEach(listener_id => {
            fd.append("additional_listener", listener_id)
        })
        return fd
    }

    lessonsAPISetAdditionalListeners(lessonID, getFormData()).then(request => {
        switch (request.status){
            case 200:
                bsLessonAdditionalListenersModal.hide()
                showSuccessToast("Дополнительные ученики успешно изменены")
                if (lessonAdditionalListenersRefreshPage){
                    setTimeout(function () {
                        location.reload()
                    }, 700)
                }
                break
            default:
                showErrorToast("Не удалось изменить дополнительных учеников")
                break
        }
    })
}

let lessonAdditionalListenersDownloaded = false
let lessonAdditionalListenersSelectedLesson = null
let lessonAdditionalListenersRefreshPage = false
const lessonAdditionalListenersSelected = []

const lessonAdditionalListenersModal = document.querySelector("#lessonAdditionalListenersModal")
const bsLessonAdditionalListenersModal = new bootstrap.Modal(lessonAdditionalListenersModal)
const lessonAdditionalListenersModalSearchField = lessonAdditionalListenersModal.querySelector("#lessonAdditionalListenersModalSearchField")
const lessonAdditionalListenersModalSearchFieldErase = lessonAdditionalListenersModal.querySelector("#lessonAdditionalListenersModalSearchFieldErase")
const lessonAdditionalListenersModalList = lessonAdditionalListenersModal.querySelector("#lessonAdditionalListenersModalList")
const lessonAdditionalListenersModalChangeButton = lessonAdditionalListenersModal.querySelector("#lessonAdditionalListenersModalChangeButton")

lessonAdditionalListenersModalMain()