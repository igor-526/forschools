function chatsGroupMain() {
    chatsGroupAddButton.addEventListener("click", function () {
        chatsGroupSetModal()
    })
    chatsGroupSearchListeners()
    chatsGroupAdminModalSaveButton.addEventListener("click", chatsGroupSave)
}

function chatsGroupSetUsers(users = []){
    function setUsersCount(){
        const count = chatsGroupSelectedUsers.length + chatsGroupSelectedTGUsers.length
        switch (count){
            case 0:
                chatsGroupAdminModalUsersListLabel.innerHTML = "Пользователи (Только Вы)"
                chatsGroupAdminModalSaveButton.disabled = true
                break
            case 1:
                chatsGroupAdminModalUsersListLabel.innerHTML = 'Пользователи (Вы + 1 выбранный)'
                chatsGroupAdminModalSaveButton.disabled = true
                break
            default:
                chatsGroupAdminModalUsersListLabel.innerHTML = `Пользователи (Вы + ${count} выбранных)`
                chatsGroupAdminModalSaveButton.disabled = false
                break
        }
    }

    function getListener(user=null, element=null){
        let index
        switch (user.usertype){
            case "NewUser":
                index = chatsGroupSelectedUsers.indexOf(user.id)
                switch (index){
                    case -1:
                        chatsGroupSelectedUsers.push(user.id)
                        element.classList.add("active")
                        break
                    default:
                        chatsGroupSelectedUsers.splice(index, 1)
                        element.classList.remove("active")
                        break
                }
                break
            case "Telegram":
                index = chatsGroupSelectedTGUsers.indexOf(user.id)
                switch (index){
                    case -1:
                        chatsGroupSelectedTGUsers.push(user.id)
                        element.classList.add("active")
                        break
                    default:
                        chatsGroupSelectedTGUsers.splice(index, 1)
                        element.classList.remove("active")
                        break
                }
                break
        }
        setUsersCount()
    }

    function getElement(user){
        const a = document.createElement("a")
        a.href = "#"
        a.innerHTML = user.note?`${user.name} [${user.note}]`:user.name
        a.classList.add("list-group-item", "list-group-item-action")
        a.addEventListener("click", function () {
            getListener(
                {
                    id: user.id?user.id:user.tg_id,
                    usertype: user.id?"NewUser":"Telegram"
                }, a
            )
        })
        return a
    }

    users.forEach(user => {
        chatsGroupAdminModalUsersList.insertAdjacentElement("beforeend", getElement(user))
    })
}

function chatsGroupReset(validationOnly = false){
    function resetValidation(){
        chatsGroupAdminModalNameField.classList.remove("is-invalid")
        chatsGroupAdminModalNameError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        chatsGroupAdminModalUsersSearchErase.addEventListener("click", function () {
            chatsGroupAdminModalUsersList.querySelectorAll("a").forEach(element => {
                element.classList.remove("d-none")
            })
        })
        chatsGroupSelectedUsers = []
        chatsGroupSelectedTGUsers = []
    }
}

function chatsGroupSetModal(chat_id=null){
    switch (chat_id){
        case null:
            chatsGroupReset()
            chatsGroupAdminModalTitle.innerHTML = "Новый групповой чат"
            chatsGroupAdminModalSaveButton.innerHTML = "Создать"
            chatsGroupAdminModalSaveButton.disabled = true
            chatsGroupAdminModalUsersListLabel.innerHTML = "Пользователи (Только Вы)"
            bsChatsGroupAdminModal.show()
            break
        default:
            break
    }
}

function chatsGroupSearchListeners(){
    chatsGroupAdminModalUsersSearchField.addEventListener("input", function (){
        const query = new RegExp(chatsGroupAdminModalUsersSearchField.value.trim().toLowerCase())
        chatsGroupAdminModalUsersList.querySelectorAll("a").forEach(element => {
            query.test(element.innerHTML.toLowerCase())?element.classList.remove("d-none"):element.classList.add("d-none")
        })
    })
    chatsGroupAdminModalUsersSearchErase.addEventListener("click", function () {
        chatsGroupAdminModalUsersList.querySelectorAll("a").forEach(element => {
            element.classList.remove("d-none")
        })
    })
}

function chatsGroupValidation(errors=null){
    function validateName(error=null){
        if (error){
            chatsGroupAdminModalNameField.classList.add("is-invalid")
            chatsGroupAdminModalNameError.innerHTML = error
            return
        }
        if (chatsGroupAdminModalNameField.value.trim().length > 52){
            chatsGroupAdminModalNameField.classList.add("is-invalid")
            chatsGroupAdminModalNameError.innerHTML = "Ограничение 52 символа"
            validationStatus = false
        }
    }

    let validationStatus = true
    chatsGroupReset(true)
    if (errors){
        if (errors.hasOwnProperty("name")){
            validateName(errors.name)
        }
    } else {
        validateName()
    }
    return validationStatus
}

function chatsGroupSave(){
    function getFD(){
        const fd = new FormData()
        if (chatsGroupAdminModalNameField.value.trim() !== ""){
            fd.set("name", chatsGroupAdminModalNameField.value.trim())
        } else {
            fd.set("name", "setauto")
        }

        chatsGroupSelectedUsers.forEach(user => {
            fd.append("users", user)
        })
        chatsGroupSelectedTGUsers.forEach(user => {
            fd.append("users_tg", user)
        })
        return fd
    }

    if (chatsGroupValidation()){
        chatAPICreateGroup(getFD()).then(request => {
            switch (request.status){
                case 201:
                    bsChatsGroupAdminModal.hide()
                    showSuccessToast("Беседа успешно создана")
                    chatGetUsers()
                    break
                case 400:
                    chatsGroupValidation(request.response)
                    break
                default:
                    bsChatsGroupAdminModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

let chatsGroupSelectedUsers = []
let chatsGroupSelectedTGUsers = []

const chatsGroupAddButton = document.querySelector("#chatsGroupAddButton")

const chatsGroupAdminModal = document.querySelector("#chatsGroupAdminModal")
const bsChatsGroupAdminModal = new bootstrap.Modal(chatsGroupAdminModal)
const chatsGroupAdminModalTitle = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalTitle")
const chatsGroupAdminModalNameField = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalNameField")
const chatsGroupAdminModalNameError = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalNameError")

const chatsGroupAdminModalUsersList = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalUsersList")
const chatsGroupAdminModalUsersSearchField = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalUsersSearchField")
const chatsGroupAdminModalUsersSearchErase = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalUsersSearchErase")
const chatsGroupAdminModalUsersListLabel = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalUsersListLabel")

const chatsGroupAdminModalSaveButton = chatsGroupAdminModal.querySelector("#chatsGroupAdminModalSaveButton")

chatsGroupMain()