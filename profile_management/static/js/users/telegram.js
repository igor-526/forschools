function usersAdminTelegramMain(){
    userTelegramDisconnectModalButton.addEventListener("click", usersAdminTelegramDisconnect)
    userTelegramEditRoleModalButton.addEventListener("click", usersAdminTelegramEditRole)
    userTelegramSetMainModalButton.addEventListener("click", usersAdminTelegramSetMain)
}

function usersAdminTelegramShow(telegramNotes = [], adminMode=false, code=null){
    function setAdminMode(){
        adminMode?userTelegramModalTableID.classList.remove("d-none"):
            userTelegramModalTableID.classList.add("d-none")
        adminMode?userTelegramModalTableNickname.classList.remove("d-none"):
            userTelegramModalTableNickname.classList.add("d-none")
    }

    function getRoleString(role){
        switch (role){
            case 'main':
                return 'Основной Telegram'
            default:
                return role
        }
    }

    function getNickname(nickname){
        switch (nickname){
            case null:
                return 'Никнейм отсутствует'
            default:
                return `<a href="https://t.me/${nickname}" target="_blank">@${nickname}</a>`
        }
    }

    function GetElement(telegram){
        const tr = document.createElement("tr")
        const tdRole = document.createElement("td")
        tdRole.innerHTML = getRoleString(telegram.usertype)
        tr.insertAdjacentElement("beforeend", tdRole)
        if (adminMode){
            const tdID = document.createElement("td")
            tdID.innerHTML = telegram.tg_id
            tr.insertAdjacentElement("beforeend", tdID)
            const tdNickname = document.createElement("td")
            tdNickname.innerHTML = getNickname(telegram.nickname)
            tr.insertAdjacentElement("beforeend", tdNickname)
        }
        const tdName = document.createElement("td")
        tdName.innerHTML = `${telegram.last_name?telegram.last_name:""} ${telegram.first_name?telegram.first_name:""}`
        tr.insertAdjacentElement("beforeend", tdName)
        const tdJoinDT = document.createElement("td")
        tdJoinDT.innerHTML = timeUtilsDateTimeToStr(telegram.join_dt)
        tr.insertAdjacentElement("beforeend", tdJoinDT)
        const tdActions = document.createElement("td")
        if (telegram.usertype !== "main"){
            const tdActionsEditRoleButton = document.createElement("button")
            tdActionsEditRoleButton.classList.add("btn", "btn-warning", "mx-1")
            tdActionsEditRoleButton.type = "button"
            tdActionsEditRoleButton.innerHTML = '<i class="bi bi-pencil"></i>'
            tdActionsEditRoleButton.setAttribute("data-bs-toggle", "tooltip")
            tdActionsEditRoleButton.setAttribute("data-bs-placement", "bottom")
            tdActionsEditRoleButton.setAttribute("title", "Изменить наименование")
            new bootstrap.Tooltip(tdActionsEditRoleButton)
            tdActionsEditRoleButton.addEventListener("click", function () {
                usersAdminTelegramEditRoleModalSet(telegram.id, telegram.usertype)
            })
            const tdActionsSetMainButton = document.createElement("button")
            tdActionsSetMainButton.classList.add("btn", "btn-warning", "mx-1")
            tdActionsSetMainButton.type = "button"
            tdActionsSetMainButton.innerHTML = '<i class="bi bi-arrow-90deg-up"></i>'
            tdActionsSetMainButton.setAttribute("data-bs-toggle", "tooltip")
            tdActionsSetMainButton.setAttribute("data-bs-placement", "bottom")
            tdActionsSetMainButton.setAttribute("title", "Сделать основным")
            new bootstrap.Tooltip(tdActionsSetMainButton)
            tdActionsSetMainButton.addEventListener("click", function () {
                usersAdminTelegramSetMainModalSet(telegram.id)
            })
            tdActions.insertAdjacentElement("beforeend", tdActionsEditRoleButton)
            tdActions.insertAdjacentElement("beforeend", tdActionsSetMainButton)
        }
        const tdActionsDisconnectButton = document.createElement("button")
        tdActionsDisconnectButton.classList.add("btn", "btn-danger", "mx-1")
        tdActionsDisconnectButton.type = "button"
        tdActionsDisconnectButton.innerHTML = '<i class="bi bi-trash"></i>'
        tdActionsDisconnectButton.setAttribute("data-bs-toggle", "tooltip")
        tdActionsDisconnectButton.setAttribute("data-bs-placement", "bottom")
        tdActionsDisconnectButton.setAttribute("title", "Удалить привязку")
        new bootstrap.Tooltip(tdActionsDisconnectButton)
        tdActionsDisconnectButton.addEventListener("click", function () {
            usersAdminTelegramDisconnectModalSet(telegram.id, telegram.usertype==="main")
        })
        tdActions.insertAdjacentElement("beforeend", tdActionsDisconnectButton)
        tr.insertAdjacentElement("beforeend", tdActions)
        return tr
    }

    function GetConnectingElement(main=true){
        function getText(){
            if (!code){
                return "Привязка Telegram невозможна"
            }
            let text
            if (main){
                text = ""
            } else {
                text = "Возможно привязать дополнительные аккаунты Telegram. С дополнительных аккаунтов можно будет наблюдать за пользователем и писать сообщения<br><br>"
            }
            text += `
                Для автоматической привязки необходимо с устройства, на котором установлен Telegram перейти по ссылке:<br>
                <a href="https://t.me/kitai_school_study_bot?start=${code}" target="_blank">https://t.me/kitai_school_study_bot?start=${code}</a><br><br><b>ИЛИ</b><br><br>
                Для ручной привязки необходимо найти в Telegram бота @kitai_school_study_bot, после чего написать команду "/start ${code}" (без кавычек)<br><br>
                `
            return text
        }

        function getCopyText(){
            return `Для автоматической привязки необходимо с устройства, на котором установлен Telegram перейти по 
следующей ссылке: https://t.me/kitai_school_study_bot?start=${code}\nИЛИ\nДля ручной привязки необходимо 
найти в Telegram бота @kitai_school_study_bot, после чего написать команду "/start ${code}" (без кавычек)`
        }

        const tr = document.createElement("tr")
        tr.classList.add("table-warning")
        const td = document.createElement("td")
        td.colSpan = adminMode?6:4
        td.innerHTML = getText()
        const copyHrefButton = document.createElement("button")
        copyHrefButton.type = "button"
        copyHrefButton.innerHTML = '<i class="bi bi-copy"></i> ссылка'
        copyHrefButton.classList.add("btn", "btn-sm", "btn-primary", "mx-1")
        copyHrefButton.addEventListener("click", function () {
            navigator.clipboard.writeText(`https://t.me/kitai_school_study_bot?start=${code}`)
            copyHrefButton.classList.remove("btn-primary")
            copyHrefButton.classList.add("btn-success")
            setTimeout(function (){
                copyHrefButton.classList.add("btn-primary")
                copyHrefButton.classList.remove("btn-success")
            }, 500)
        })
        const copyCommandButton = document.createElement("button")
        copyCommandButton.type = "button"
        copyCommandButton.innerHTML = '<i class="bi bi-copy"></i> команда'
        copyCommandButton.classList.add("btn", "btn-sm", "btn-primary", "mx-1")
        copyCommandButton.addEventListener("click", function () {
            navigator.clipboard.writeText(`/start ${code}`)
            copyCommandButton.classList.remove("btn-primary")
            copyCommandButton.classList.add("btn-success")
            setTimeout(function (){
                copyCommandButton.classList.add("btn-primary")
                copyCommandButton.classList.remove("btn-success")
            }, 500)
        })
        const copyAllButton = document.createElement("button")
        copyAllButton.type = "button"
        copyAllButton.innerHTML = '<i class="bi bi-copy"></i> инструкция'
        copyAllButton.classList.add("btn", "btn-sm", "btn-primary", "mx-1")
        copyAllButton.addEventListener("click", function () {
            navigator.clipboard.writeText(getCopyText())
            copyAllButton.classList.remove("btn-primary")
            copyAllButton.classList.add("btn-success")
            setTimeout(function (){
                copyAllButton.classList.add("btn-primary")
                copyAllButton.classList.remove("btn-success")
            }, 500)
        })
        td.insertAdjacentElement("beforeend", copyHrefButton)
        td.insertAdjacentElement("beforeend", copyCommandButton)
        td.insertAdjacentElement("beforeend", copyAllButton)
        tr.insertAdjacentElement("beforeend", td)
        return tr
    }

    setAdminMode()
    telegramNotes.forEach(telegramNote => {
        userTelegramModalTableBody.insertAdjacentElement("beforeend", GetElement(telegramNote))
    })
    userTelegramModalTableBody.insertAdjacentElement("beforeend", GetConnectingElement(
        telegramNotes.length === 0
    ))

}


function usersAdminTelegramSet(userID = userTelegramSelectedUser) {
    userTelegramModalTableBody.innerHTML = ""
    telegramAPIGetTelegramNotes(userID).then(request => {
        switch (request.status){
            case 200:
                usersAdminTelegramShow(request.response.telegrams,
                    request.response.admin_mode,
                    request.response.code)
                userTelegramSelectedUser = userID
                bsUserTelegramModal.show()
                break
            default:
                showErrorToast()
                break
        }
    })
}


function usersAdminTelegramDisconnectModalSet(noteID, main=false) {
    userTelegramSelectedNote = noteID
    userTelegramDisconnectModalBody.innerHTML = "Действие необратимо. Telegram можно будет привязать заново"
    if (main){
        userTelegramDisconnectModalBody.innerHTML += "<br><b>ВНИМАНИЕ! ПРИ ОТВЯЗКЕ ОСНОВНОГО TELEGRAM " +
            "ВСЕ ДОПОЛНИТЕЛЬНЫЕ ОТВЯЖУТСЯ АВТОМАТИЧЕСКИ!</b>"
    }
    bsUserTelegramDisconnectModal.show()
}

function usersAdminTelegramDisconnect(){
    telegramAPIDisconnect(userTelegramSelectedNote).then(request => {
        switch (request.status){
            case 200:
                bsUserTelegramDisconnectModal.hide()
                usersAdminTelegramSet()
                break
            default:
                break
        }
    })
}

function usersAdminTelegramEditRoleModalSet(noteID, currentRole=null) {
    userTelegramSelectedNote = noteID
    userTelegramEditRoleModalField.value = currentRole?currentRole:""
    userTelegramEditRoleModalField.classList.remove("is-invalid")
    userTelegramEditRoleModalError.innerHTML = ""
    bsUserTelegramEditRoleModal.show()
}

function usersAdminTelegramEditRole(){
    function validate(error=null){
        userTelegramEditRoleModalField.classList.remove("is-invalid")
        userTelegramEditRoleModalError.innerHTML = ""

        if (error){
            userTelegramEditRoleModalField.classList.add("is-invalid")
            userTelegramEditRoleModalError.innerHTML = error
            return
        }

        let validationStatus = true
        if (userTelegramEditRoleModalField.value.trim() === ""){
            userTelegramEditRoleModalField.classList.add("is-invalid")
            userTelegramEditRoleModalError.innerHTML = "Поле не может быть пустым"
            validationStatus = false
        } else {
            if (userTelegramEditRoleModalField.value.trim().length > 20){
                userTelegramEditRoleModalField.classList.add("is-invalid")
                userTelegramEditRoleModalError.innerHTML = "Ограничение 20 символов"
                validationStatus = false
            }
        }
        return validationStatus
    }

    function getFD(){
        const fd = new FormData()
        fd.set("usertype", userTelegramEditRoleModalField.value.trim())
        return fd
    }

    if (validate()){
        telegramAPIEditRole(userTelegramSelectedNote, getFD()).then(request => {
            switch (request.status){
                case 200:
                    bsUserTelegramEditRoleModal.hide()
                    usersAdminTelegramSet()
                    break
                case 400:
                    validate(request.response.error)
                    break
                default:
                    bsUserTelegramEditRoleModal.hide()
                    break
            }
        })
    }
}


function usersAdminTelegramSetMainModalSet(noteID, currentRole=null) {
    userTelegramSelectedNote = noteID
    bsUserTelegramSetMainModal.show()
}

function usersAdminTelegramSetMain(){
    telegramAPISetMain(userTelegramSelectedNote).then(request => {
        bsUserTelegramSetMainModal.hide()
        if (request.status === 200){
            usersAdminTelegramSet()
        }
    })
}

let userTelegramSelectedUser = null
let userTelegramSelectedNote = null

//Main Modal
const userTelegramModal = document.querySelector("#userTelegramModal")
const bsUserTelegramModal = new bootstrap.Modal(userTelegramModal)
const userTelegramModalTableID = userTelegramModal.querySelector("#userTelegramModalTableID")
const userTelegramModalTableNickname = userTelegramModal.querySelector("#userTelegramModalTableNickname")
const userTelegramModalTableBody = userTelegramModal.querySelector("#userTelegramModalTableBody")

//Delete Modal
const userTelegramDisconnectModal = document.querySelector("#userTelegramDisconnectModal")
const bsUserTelegramDisconnectModal = new bootstrap.Modal(userTelegramDisconnectModal)
const userTelegramDisconnectModalBody = userTelegramDisconnectModal.querySelector("#userTelegramDisconnectModalBody")
const userTelegramDisconnectModalButton = userTelegramDisconnectModal.querySelector("#userTelegramDisconnectModalButton")

//EditModal
const userTelegramEditRoleModal = document.querySelector("#userTelegramEditRoleModal")
const bsUserTelegramEditRoleModal = new bootstrap.Modal(userTelegramEditRoleModal)
const userTelegramEditRoleModalField = userTelegramEditRoleModal.querySelector("#userTelegramEditRoleModalField")
const userTelegramEditRoleModalError = userTelegramEditRoleModal.querySelector("#userTelegramEditRoleModalError")
const userTelegramEditRoleModalButton = userTelegramEditRoleModal.querySelector("#userTelegramEditRoleModalButton")

//SetMainModal
const userTelegramSetMainModal = document.querySelector("#userTelegramSetMainModal")
const bsUserTelegramSetMainModal = new bootstrap.Modal(userTelegramSetMainModal)
const userTelegramSetMainModalButton = userTelegramSetMainModal.querySelector("#userTelegramSetMainModalButton")

usersAdminTelegramMain()