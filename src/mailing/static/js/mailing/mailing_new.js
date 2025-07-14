function mailingNewMain(){
    const mailingID = getHashValue("mailing_id")
    if (mailingID){
        mailingAPIGetItem(mailingID).then(request => {
            switch (request.status){
                case 200:
                    mailingNewNameField.value = `${request.response.name} (повтор)`
                    mailingNewMessageField.value = request.response.messages[0].text
                    mailingNewMessageThemeField.value = request.response.messages[0].theme
                    Object.keys(request.response.users).forEach(userID => {
                        const mainTGIndex = request.response.users[userID].tg.indexOf("main")
                        if (mainTGIndex !== -1){
                            request.response.users[userID].tg.splice(mainTGIndex, 1)
                            request.response.users[userID].tg.push("Основной")
                        }
                    })
                    mailingNewContactsSelected = request.response.users
                    mailingNewMainSelectInfoUpdate()
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
    mailingNewMainGetUsers()
    mailingNewMainFilteringSetRoles()
    mailingNewMainFilteringSetFullNameFieldListener()
    mailingNewMainFilteringSetActiveFilterListener()
    mailingNewMainFilteringSetEmailFilterListener()
    mailingNewMainFilteringSetTGFilterListener()
    mailingNewMainFilteringSetResetFiltersListener()
    mailingNewMainSetSelectListeners()
    mailingNewSendSelfEmailButton.addEventListener("click", function () {
        mailingNewMainSend("selfEmail")
    })
    mailingNewSendSelfTGButton.addEventListener("click", function () {
        mailingNewMainSend("selfTG")
    })
    mailingNewSendButton.addEventListener("click", function () {
        mailingNewMainSend("all")
    })
}

function mailingNewMainSelectInfoUpdate(){
    Object.keys(mailingNewContactsSelected).forEach(user => {
        if (!mailingNewContactsSelected[user].email &&
            mailingNewContactsSelected[user].tg.length === 0){
            delete mailingNewContactsSelected[user]
        }
    })
    let countEmail = 0
    let countTGMain = 0
    let countTGParents = 0
    Object.keys(mailingNewContactsSelected).forEach(user => {
        if (mailingNewContactsSelected[user].email){
            countEmail += 1
        }
        mailingNewContactsSelected[user].tg.forEach(usertype => {
            if (usertype === "Основной"){
                countTGMain += 1
            } else {
                countTGParents += 1
            }
        })
    })
    mailingNewAccordionUsersTitle.innerHTML = `Выбор контактов (Email: ${countEmail}, TG Основные: ${countTGMain}, Родительские: ${countTGParents})`
    return countEmail + countTGMain + countTGParents
}

function mailingNewMainGetUsers(){
    mailingAPIGetUsers(mailingNewContactsSelectedRoles, mailingNewContactsSelectedFullName,
        mailingNewContactsSelectedActive, mailingNewContactsSelectedEmail,
        mailingNewContactsSelectedTG).then(request => {
        switch (request.status){
            case 200:
                mailingNewMainShowUsers(request.response)
                break
            default:
                showErrorToast("Не удалось загрузить список пользователей для рассылки")
                break
        }
    })
}

function mailingNewMainShowUsers(users = []){
    function userContactSelectListener(checkbox, userID){
        if (checkbox.checked){
            if (!mailingNewContactsSelected.hasOwnProperty(userID)){
                mailingNewContactsSelected[userID] = {email: false, tg: []}
            }
        }
    }

    function userTelegramSelectListener(checkbox, userID, telegram){
        if (checkbox.checked){
            mailingNewContactsSelected[userID]["tg"].push(telegram)
        } else {
            const index = mailingNewContactsSelected[userID]["tg"].indexOf(telegram)
            if (index !== -1){
                mailingNewContactsSelected[userID]["tg"].splice(index, 1)
            }
        }
    }

    function userEmailSelectListener(checkbox, userID){
        mailingNewContactsSelected[userID]["email"] = checkbox.checked
    }

    function getElement(user){
        const tr = document.createElement("tr")
        if (!user.active){
            tr.classList.add("table-danger")
        }
        const tdUser = document.createElement("td")
        tr.insertAdjacentElement("beforeend", tdUser)
        tdUser.innerHTML = `${user.name} (${user.role.join(",")})`

        const tdEmail = document.createElement("td")
        tr.insertAdjacentElement("beforeend", tdEmail)
        if (user.email){
            const container = document.createElement("div")
            const checkBox = document.createElement("input")
            checkBox.type = "checkbox"
            checkBox.classList.add("form-check-input", "me-2", "mailing-user-email-checkbox")
            checkBox.addEventListener("click", function () {
                userContactSelectListener(checkBox, user.id)
                userEmailSelectListener(checkBox, user.id)
                mailingNewMainSelectInfoUpdate()
            })
            container.insertAdjacentElement("beforeend", checkBox)
            container.insertAdjacentHTML("beforeend", user.email)
            tdEmail.insertAdjacentElement("beforeend", container)
            if (mailingNewContactsSelected.hasOwnProperty(user.id) && mailingNewContactsSelected[user.id].email){
                checkBox.checked = true
            }
        }

        const tdTelegram = document.createElement("td")
        tr.insertAdjacentElement("beforeend", tdTelegram)
        user.telegram.forEach(tg => {
            const container = document.createElement("div")
            const checkBox = document.createElement("input")
            checkBox.type = "checkbox"
            checkBox.classList.add("form-check-input", "me-2",
                tg === "Основной" ? "mailing-user-tg-main-checkbox" : "mailing-user-tg-parents-checkbox")
            checkBox.addEventListener("click", function () {
                userContactSelectListener(checkBox, user.id)
                userTelegramSelectListener(checkBox, user.id, tg)
                mailingNewMainSelectInfoUpdate()
            })
            container.insertAdjacentElement("beforeend", checkBox)
            container.insertAdjacentHTML("beforeend", tg)
            tdTelegram.insertAdjacentElement("beforeend", container)
            if (mailingNewContactsSelected.hasOwnProperty(user.id) && mailingNewContactsSelected[user.id].tg.indexOf(tg) !== -1){
                checkBox.checked = true
            }
        })
        return tr
    }

    mailingNewUsersTableBody.innerHTML = ""
    mailingNewAccordionUsersSelectEmail.setAttribute("data-selected", "false")
    mailingNewAccordionUsersSelectEmail.classList.add("btn-primary")
    mailingNewAccordionUsersSelectEmail.classList.remove("btn-warning")
    mailingNewAccordionUsersSelectTGMain.setAttribute("data-selected", "false")
    mailingNewAccordionUsersSelectTGMain.classList.add("btn-primary")
    mailingNewAccordionUsersSelectTGMain.classList.remove("btn-warning")
    mailingNewAccordionUsersSelectTGParent.setAttribute("data-selected", "false")
    mailingNewAccordionUsersSelectTGParent.classList.add("btn-primary")
    mailingNewAccordionUsersSelectTGParent.classList.remove("btn-warning")
    users.forEach(user => {
        mailingNewUsersTableBody.insertAdjacentElement("beforeend", getElement(user))
    })
}

function mailingNewMainFilteringSetRoles(){
    function getListener(element, filter){
        const index = mailingNewContactsSelectedRoles.indexOf(filter)
        switch (index){
            case -1:
                mailingNewContactsSelectedRoles.push(filter)
                element.classList.add("active")
                break
            default:
                mailingNewContactsSelectedRoles.splice(index, 1)
                element.classList.remove("active")
                break
        }
        mailingNewMainGetUsers()
    }

    function getElement(inner, filter){
        const a = document.createElement("a")
        a.classList.add("dropdown-item")
        a.innerHTML = inner
        a.addEventListener("click", function (){
            getListener(a, filter)
        })
        return a
    }
    mailingNewUsersTableFilterUsers.insertAdjacentElement("beforeend",
        getElement("Ученики", "Listener"))
    mailingNewUsersTableFilterUsers.insertAdjacentElement("beforeend",
        getElement("Преподаватели", "Teacher"))
    mailingNewUsersTableFilterUsers.insertAdjacentElement("beforeend",
        getElement("Кураторы", "Curator"))
    mailingNewUsersTableFilterUsers.insertAdjacentElement("beforeend",
        getElement("Методисты", "Metodist"))
    mailingNewUsersTableFilterUsers.insertAdjacentElement("beforeend",
        getElement("Администраторы", "Admin"))
}

function mailingNewMainFilteringSetFullNameFieldListener(){
    mailingNewUsersTableFilterNameField.addEventListener("input", function () {
        const query = mailingNewUsersTableFilterNameField.value.trim()
        if (query === ""){
            mailingNewContactsSelectedFullName = null
        } else {
            mailingNewContactsSelectedFullName = query
        }
        mailingNewMainGetUsers()
    })
}

function mailingNewMainFilteringSetActiveFilterListener(){
    mailingNewUsersTableFilterActiveAll.addEventListener("click", function () {
        mailingNewContactsSelectedActive = null
        mailingNewMainGetUsers()
    })
    mailingNewUsersTableFilterActiveTrue.addEventListener("click", function () {
        mailingNewContactsSelectedActive = "true"
        mailingNewMainGetUsers()
    })
    mailingNewUsersTableFilterActiveFalse.addEventListener("click", function () {
        mailingNewContactsSelectedActive = "false"
        mailingNewMainGetUsers()
    })
}

function mailingNewMainFilteringSetEmailFilterListener(){
    mailingNewUsersTableFilterEmailAll.addEventListener("click", function () {
        mailingNewContactsSelectedEmail = null
        mailingNewMainGetUsers()
    })
    mailingNewUsersTableFilterEmailTrue.addEventListener("click", function () {
        mailingNewContactsSelectedEmail = "true"
        mailingNewMainGetUsers()
    })
    mailingNewUsersTableFilterEmailFalse.addEventListener("click", function () {
        mailingNewContactsSelectedEmail = "false"
        mailingNewMainGetUsers()
    })
}

function mailingNewMainFilteringSetTGFilterListener(){
    mailingNewUsersTableFilterTGAll.addEventListener("click", function () {
        mailingNewContactsSelectedTG = null
        mailingNewMainGetUsers()
    })
    mailingNewUsersTableFilterTGParents.addEventListener("click", function () {
        mailingNewContactsSelectedTG = "parents"
        mailingNewMainGetUsers()
    })
    mailingNewUsersTableFilterTGFalse.addEventListener("click", function () {
        mailingNewContactsSelectedTG = "false"
        mailingNewMainGetUsers()
    })
}

function mailingNewMainFilteringSetResetFiltersListener(){
    mailingNewUsersTableFilterNameFieldErase.addEventListener("click", function () {
        mailingNewUsersTableFilterNameField.value = ""
        mailingNewContactsSelectedFullName = null
        mailingNewMainGetUsers()
    })
    mailingNewAccordionUsersResetFilters.addEventListener("click", function () {
        mailingNewUsersTableFilterNameField.value = ""
        mailingNewUsersTableFilterActiveAll.checked = true
        mailingNewUsersTableFilterEmailAll.checked = true
        mailingNewUsersTableFilterTGAll.checked = true
        mailingNewUsersTableFilterActiveTrue.checked = false
        mailingNewUsersTableFilterActiveFalse.checked = false
        mailingNewUsersTableFilterEmailTrue.checked = false
        mailingNewUsersTableFilterEmailFalse.checked = false
        mailingNewUsersTableFilterTGParents.checked = false
        mailingNewUsersTableFilterTGFalse.checked = false
        mailingNewContactsSelectedRoles.length = 0
        mailingNewContactsSelectedFullName = null
        mailingNewContactsSelectedActive = null
        mailingNewContactsSelectedEmail = null
        mailingNewContactsSelectedTG = null
        mailingNewUsersTableFilterUsers.querySelectorAll("a").forEach(elem => {
            elem.classList.remove("active")
        })
        mailingNewMainGetUsers()
    })
}

function mailingNewMainSetSelectListeners() {
    mailingNewAccordionUsersSelectEmail.addEventListener("click", function () {
        const selected = mailingNewAccordionUsersSelectEmail.getAttribute("data-selected")
        mailingNewUsersTableBody.querySelectorAll(".mailing-user-email-checkbox").forEach(elem => {
            if (!elem.checked && selected === "false") {
                elem.click()
            }
            if (elem.checked && selected === "true"){
                elem.click()
            }
        })
        switch (selected){
            case "true":
                mailingNewAccordionUsersSelectEmail.setAttribute("data-selected", "false")
                mailingNewAccordionUsersSelectEmail.classList.add("btn-primary")
                mailingNewAccordionUsersSelectEmail.classList.remove("btn-warning")
                break
            case "false":
                mailingNewAccordionUsersSelectEmail.setAttribute("data-selected", "true")
                mailingNewAccordionUsersSelectEmail.classList.remove("btn-primary")
                mailingNewAccordionUsersSelectEmail.classList.add("btn-warning")
                break
        }
        mailingNewMainSelectInfoUpdate()
    })
    mailingNewAccordionUsersSelectTGMain.addEventListener("click", function () {
        const selected = mailingNewAccordionUsersSelectTGMain.getAttribute("data-selected")
        mailingNewUsersTableBody.querySelectorAll(".mailing-user-tg-main-checkbox").forEach(elem => {
            if (!elem.checked && selected === "false") {
                elem.click()
            }
            if (elem.checked && selected === "true"){
                elem.click()
            }
        })
        switch (selected){
            case "true":
                mailingNewAccordionUsersSelectTGMain.setAttribute("data-selected", "false")
                mailingNewAccordionUsersSelectTGMain.classList.add("btn-primary")
                mailingNewAccordionUsersSelectTGMain.classList.remove("btn-warning")
                break
            case "false":
                mailingNewAccordionUsersSelectTGMain.setAttribute("data-selected", "true")
                mailingNewAccordionUsersSelectTGMain.classList.remove("btn-primary")
                mailingNewAccordionUsersSelectTGMain.classList.add("btn-warning")
                break
        }
        mailingNewMainSelectInfoUpdate()
    })
    mailingNewAccordionUsersSelectTGParent.addEventListener("click", function () {
        const selected = mailingNewAccordionUsersSelectTGParent.getAttribute("data-selected")
        mailingNewUsersTableBody.querySelectorAll(".mailing-user-tg-parents-checkbox").forEach(elem => {
            if (!elem.checked && selected === "false") {
                elem.click()
            }
            if (elem.checked && selected === "true"){
                elem.click()
            }
        })
        switch (selected){
            case "true":
                mailingNewAccordionUsersSelectTGParent.setAttribute("data-selected", "false")
                mailingNewAccordionUsersSelectTGParent.classList.add("btn-primary")
                mailingNewAccordionUsersSelectTGParent.classList.remove("btn-warning")
                break
            case "false":
                mailingNewAccordionUsersSelectTGParent.setAttribute("data-selected", "true")
                mailingNewAccordionUsersSelectTGParent.classList.remove("btn-primary")
                mailingNewAccordionUsersSelectTGParent.classList.add("btn-warning")
                break
        }
        mailingNewMainSelectInfoUpdate()
    })
    mailingNewAccordionUsersResetSelect.addEventListener("click", function () {
        mailingNewAccordionUsersSelectEmail.setAttribute("data-selected", "false")
        mailingNewAccordionUsersSelectEmail.classList.add("btn-primary")
        mailingNewAccordionUsersSelectEmail.classList.remove("btn-warning")
        mailingNewAccordionUsersSelectTGMain.setAttribute("data-selected", "false")
        mailingNewAccordionUsersSelectTGMain.classList.add("btn-primary")
        mailingNewAccordionUsersSelectTGMain.classList.remove("btn-warning")
        mailingNewAccordionUsersSelectTGParent.setAttribute("data-selected", "false")
        mailingNewAccordionUsersSelectTGParent.classList.add("btn-primary")
        mailingNewAccordionUsersSelectTGParent.classList.remove("btn-warning")
        mailingNewUsersTableBody.querySelectorAll("input").forEach(elem => {
            elem.checked = false
        })
        mailingNewContactsSelected = {}
        mailingNewMainSelectInfoUpdate()
    })
}

function mailingNewMainValidate(mode){
    mailingNewMessageField.classList.remove("is-invalid")
    mailingNewMessageThemeField.classList.remove("is-invalid")
    mailingNewNameField.classList.remove("is-invalid")
    mailingNewMessageFieldError.innerHTML = ""
    let validationStatus = true
    const errors = []
    const messageLength = mailingNewMessageField.value.trim().length
    const messageThemeLength = mailingNewMessageThemeField.value.trim().length
    const mailingServiceNameLength = mailingNewNameField.value.trim().length
    if (messageLength === 0){
        errors.push("Сообщение не может быть пустым")
        mailingNewMessageField.classList.add("is-invalid")
    }
    if (messageLength > 3800){
        errors.push(`Длина сообщения не может превышать 3800 символов. У вас ${messageLength}`)
        mailingNewMessageField.classList.add("is-invalid")
    }
    if (mode === "all" && mailingNewMainSelectInfoUpdate() === 0){
        errors.push("Необходимо выбрать хотя бы 1 контакт")
        mailingNewMessageField.classList.add("is-invalid")
    }
    if (messageThemeLength > 200){
        errors.push(`Длина темы не может превышать 200 символов. У вас ${messageThemeLength}`)
        mailingNewMessageThemeField.add("is-invalid")
    }
    if (mailingServiceNameLength > 200){
        errors.push(`Длина наименования не может превышать 200 символов. У вас ${mailingServiceNameLength}`)
        mailingNewNameField.add("is-invalid")
    }
    if (errors.length > 0){
        mailingNewMessageFieldError.innerHTML = errors.join("<br>")
        validationStatus = false
    }
    return validationStatus
}

function mailingNewMainSend(mode){
    function getData(){
        const data = {
            messages: [{
                text: mailingNewMessageField.value.trim(),
                theme: mailingNewMessageThemeField.value.trim(),
                attachments: []
            }],
            name: mailingNewNameField.value.trim()
        }
        switch (mode){
            case "selfEmail":
                data['users'] = {self: {email: true, tg: []}}
                break
            case "selfTG":
                data['users'] = {self: {email: true, tg: []}}
                break
            case "all":
                data['users'] = mailingNewContactsSelected
                break
        }
        return data
    }

    if (mailingNewMainValidate(mode)){
        mailingAPIStartMailing(getData()).then(request => {
            switch (request.status){
                case 200:
                    showSuccessToast("Задание на рассылку создано")
                    switch (mode){
                        case "all":
                            setTimeout(function () {
                                location.assign("/mailing/")
                            }, 750)
                            break
                        default:
                            showSuccessToast("Задание на рассылку создано")
                            break
                    }
                    break
                default:
                    showErrorToast()
                    break
            }
        })
    }
}

let mailingNewContactsSelected = {}
let mailingNewContactsSelectedRoles = []
let mailingNewContactsSelectedFullName = null
let mailingNewContactsSelectedActive = null
let mailingNewContactsSelectedEmail = null
let mailingNewContactsSelectedTG = null

const mailingNewNameField = document.querySelector("#mailingNewNameField")
const mailingNewAccordionUsers = document.querySelector("#mailingNewAccordionUsers")
const mailingNewAccordionUsersTitle = mailingNewAccordionUsers.querySelector("#mailingNewAccordionUsersTitle")
const mailingNewAccordionUsersCollapse = mailingNewAccordionUsers.querySelector("#mailingNewAccordionUsersCollapse")
const mailingNewUsersTableBody = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableBody")

const mailingNewAccordionUsersResetFilters = mailingNewAccordionUsersCollapse.querySelector("#mailingNewAccordionUsersResetFilters")
const mailingNewAccordionUsersSelectEmail = mailingNewAccordionUsersCollapse.querySelector("#mailingNewAccordionUsersSelectEmail")
const mailingNewAccordionUsersSelectTGMain = mailingNewAccordionUsersCollapse.querySelector("#mailingNewAccordionUsersSelectTGMain")
const mailingNewAccordionUsersSelectTGParent = mailingNewAccordionUsersCollapse.querySelector("#mailingNewAccordionUsersSelectTGParent")
const mailingNewAccordionUsersResetSelect = mailingNewAccordionUsersCollapse.querySelector("#mailingNewAccordionUsersResetSelect")
const mailingNewUsersTableFilterUsers = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterUsers")
const mailingNewUsersTableFilterNameFieldErase = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterNameFieldErase")
const mailingNewUsersTableFilterNameField = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterNameField")
const mailingNewUsersTableFilterActiveAll = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterActiveAll")
const mailingNewUsersTableFilterActiveTrue = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterActiveTrue")
const mailingNewUsersTableFilterActiveFalse = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterActiveFalse")
const mailingNewUsersTableFilterEmailAll = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterEmailAll")
const mailingNewUsersTableFilterEmailTrue = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterEmailTrue")
const mailingNewUsersTableFilterEmailFalse = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterEmailFalse")
const mailingNewUsersTableFilterTGAll = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterTGAll")
const mailingNewUsersTableFilterTGParents = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterTGParents")
const mailingNewUsersTableFilterTGFalse = mailingNewAccordionUsersCollapse.querySelector("#mailingNewUsersTableFilterTGFalse")

const mailingNewAccordionMessages = document.querySelector("#mailingNewAccordionMessages")
const mailingNewMessageField = mailingNewAccordionMessages.querySelector("#mailingNewMessageField")
const mailingNewMessageFieldError = mailingNewAccordionMessages.querySelector("#mailingNewMessageFieldError")
const mailingNewMessageThemeField = mailingNewAccordionMessages.querySelector("#mailingNewMessageThemeField")
const mailingNewSendSelfEmailButton = mailingNewAccordionMessages.querySelector("#mailingNewSendSelfEmailButton")
const mailingNewSendSelfTGButton = mailingNewAccordionMessages.querySelector("#mailingNewSendSelfTGButton")
const mailingNewSendButton = mailingNewAccordionMessages.querySelector("#mailingNewSendButton")

mailingNewMain()