function usersReplaceTeacherSetTeachers(){
    function getListElementListener(userID, element){
        if (userID === usersReplaceTeacherSelected){
            usersReplaceTeacherResetModal()
        } else {
            usersReplaceTeacherResetModal()
            element.classList.add("active")
            usersReplaceTeacherSelected = userID
            usersReplaceTeacherModalReplaceButton.disabled = false
        }
    }

    function getListElement(user){
        const a = document.createElement("a")
        a.classList.add("list-group-item", "list-group-item-action")
        a.innerHTML = `${user.first_name} ${user.first_name}`
        a.addEventListener("click", function () {
            getListElementListener(user.id, a)
        })
        return a
    }

    usersAPIGetTeachers().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(user => {
                    usersReplaceTeacherModalList.insertAdjacentElement("beforeend", getListElement(user))
                })
                break
            default:
                showErrorToast("Не удалось загрузить список преподавателей")
                break
        }
    })
}

function usersReplaceTeacherSetModal(action=null, actionID=null){
    if (!usersReplaceTeacherLoaded){
        usersReplaceTeacherSetTeachers()
        usersReplaceTeacherModalSearchField.addEventListener("input", function (){
            usersReplaceTeacherFilter()
        })

    }
    usersReplaceTeacherAction = action
    usersReplaceTeacherActionID = actionID
    usersReplaceTeacherResetModal()
    usersReplaceTeacherFilter(true)
    usersReplaceTeacherModalReplaceButton.addEventListener("click", usersReplaceTeacherReplace)
    bsUsersReplaceTeacherModal.show()

}

function usersReplaceTeacherResetModal(){
    usersReplaceTeacherModalList.querySelectorAll("a").forEach(elem => {
        elem.classList.remove("active")
    })
    usersReplaceTeacherSelected = null
    usersReplaceTeacherModalReplaceButton.disabled = true
}

function usersReplaceTeacherFilter(eraseOnly = false){
    function regexTest(query, value){
        const reg = new RegExp(query.toLowerCase().trim())
        return reg.test(value.toLowerCase().trim())
    }

    if (eraseOnly || usersReplaceTeacherModalSearchField.value.trim() === ""){
        if (eraseOnly){
            usersReplaceTeacherModalSearchField.value = ""
        }
        usersReplaceTeacherModalList.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("d-none")
        })
    } else {
        usersReplaceTeacherModalList.querySelectorAll("a").forEach(elem => {
            regexTest(usersReplaceTeacherModalSearchField.value, elem.innerHTML) ?
                elem.classList.remove("d-none") : elem.classList.add("d-none")
        })
    }
}

function usersReplaceTeacherReplace(){
    switch (usersReplaceTeacherAction){
        case "hw":
            homeworkAPIReplaceTeacher(usersReplaceTeacherSelected, hwID).then(request => {
                switch (request.status){
                    case 200:
                        showSuccessToast("Проверяющий успешно изменён")
                        setTimeout(function () {
                            window.location.reload()
                        }, 1000)
                        break
                    default:
                        showErrorToast("Не удалось сменить проверяющего")
                        break
                }
            })
            break
        case "lesson":
            lessonsAPIReplaceTeacher(usersReplaceTeacherSelected, lessonID).then(request => {
                switch (request.status){
                    case 200:
                        showSuccessToast("Преподаватель успешно изменён")
                        setTimeout(function () {
                            window.location.reload()
                        }, 1000)
                        break
                    default:
                        showErrorToast("Не удалось сменить преподавателя")
                        break
                }
            })
            break
    }
    bsUsersReplaceTeacherModal.hide()
}

let usersReplaceTeacherAction = null
let usersReplaceTeacherActionID = null
let usersReplaceTeacherSelected = null
let usersReplaceTeacherLoaded = false

const usersReplaceTeacherModal = document.querySelector("#usersReplaceTeacherModal")
const bsUsersReplaceTeacherModal = new bootstrap.Modal(usersReplaceTeacherModal)
const usersReplaceTeacherModalSearchField = usersReplaceTeacherModal.querySelector("#usersReplaceTeacherModalSearchField")
const usersReplaceTeacherModalList = usersReplaceTeacherModal.querySelector("#usersReplaceTeacherModalList")
const usersReplaceTeacherModalReplaceButton = usersReplaceTeacherModal.querySelector("#usersReplaceTeacherModalReplaceButton")