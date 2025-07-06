function usersAdminMain(){
    usersAdminGetAll()
}


function usersAdminGetAll(){
    usersAPIGetAll(
        null, usersAdminFilteringID, usersAdminFilteringTG, usersAdminFilteringUsername,
        usersAdminFilteringFullName, usersAdminFilteringRole, usersAdminFilteringUsernameSort,
        usersAdminFilteringFullNameSort, usersAdminFilteringIDSort, true
    ).then(request => {
        switch (request.status){
            case 200:
                usersAdminShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function usersAdminShow(users = [], updateTD=null){
    function getRoles(roles){
        let ruRoles = []
        let learninginfo = null
        roles.forEach(role => {
            switch (role.name){
                case "Listener":
                    ruRoles.push("Ученик")
                    learninginfo = "Listener"
                    break
                case "Teacher":
                    ruRoles.push("Преподаватель")
                    learninginfo = "Teacher"
                    break
                case "Metodist":
                    ruRoles.push("Методист")
                    break
                case "Curator":
                    ruRoles.push("Куратор")
                    break
                case "Admin":
                    ruRoles.push("Администратор")
                    break
            }
        })
        return {
            "str": ruRoles.join("<br>"),
            "learninginfo": learninginfo
        }
    }

    function getUserElement(user){
        const tr = document.createElement("tr")
        if (!user.is_active){
            tr.classList.add("table-danger")
        }
        const tdId = document.createElement("td")
        const tdIdA = document.createElement("a")
        tdId.insertAdjacentElement("beforeend", tdIdA)
        tdIdA.innerHTML = user.id
        tdIdA.innerHTML += user.tg?' <i class="bi bi-telegram" style="color: #1A01CC"></i>':' <i class="bi bi-telegram" style="color: grey"></i>'
        tdIdA.href = "#"
        tdIdA.addEventListener("click", function (){
            usersAdminTelegramSet(user.id)
        })
        const tdUsername = document.createElement("td")
        tdUsername.innerHTML = user.username
        const tdName = document.createElement("td")
        tdName.innerHTML = `<a href="/profile/${user.id}">${user.last_name} ${user.first_name}${user.patronymic?" "+user.patronymic:""}</a>`
        const tdRole = document.createElement("td")
        const roles = getRoles(user.groups)
        tdRole.innerHTML = roles.str
        const tdActions = document.createElement("td")

        const tdActivity = document.createElement("td")
        switch (user.last_activity_type){
            case 0:
                tdActivity.innerHTML = '<i class="bi bi-telegram me-1"></i>'
                break
            case 1:
                tdActivity.innerHTML = '<i class="bi bi-globe2 me-1"></i>'
                break
            case 2:
                tdActivity.innerHTML = '<i class="bi bi-person-plus me-1"></i>'
                break
        }
        tdActivity.insertAdjacentHTML("beforeend", timeUtilsDateTimeToStr(user.last_activity))

        const tdActionsInfo = document.createElement("button")
        const tdActionsChat = document.createElement("button")
        const tdActionsChatA = document.createElement("a")
        const tdActionsProfile = document.createElement("button")
        const tdActionsProfileA = document.createElement("a")
        const tdActionsLearnInfo = document.createElement("button")
        tdActionsChatA.insertAdjacentElement("beforeend", tdActionsChat)
        tdActionsProfileA.insertAdjacentElement("beforeend", tdActionsProfile)
        tdActionsChatA.href = `/messages/#user=${user.id}`
        tdActionsProfileA.href = `/profile/${user.id}`

        tdActionsChat.type = "button"
        tdActionsChat.classList.add("btn", "btn-primary", "mx-1")
        tdActionsChat.role = "button"
        tdActionsChat.innerHTML = '<i class="bi bi-chat-dots"></i>'
        tdActions.insertAdjacentElement("beforeend", tdActionsChatA)
        if (roles.learninginfo){
            tdActionsLearnInfo.type = "button"
            tdActionsLearnInfo.classList.add("btn", "btn-primary", "mx-1")
            tdActionsLearnInfo.role = "button"
            tdActionsLearnInfo.innerHTML = '<i class="bi bi-card-list"></i>'
            tdActionsLearnInfo.addEventListener("click", function () {
                usersLearnInfoSetModal(user.id, roles.learninginfo)
            })
            tdActions.insertAdjacentElement("beforeend", tdActionsLearnInfo)
        }
        if (!user.can_edit){
            tr.classList.add("table-secondary")
        } else {
            tdActionsInfo.type = "button"
            tdActionsInfo.classList.add("btn", "btn-warning", "mx-1")
            tdActionsInfo.role = "button"
            tdActionsInfo.innerHTML = '<i class="bi bi-pencil-fill"></i>'
            tdActionsInfo.addEventListener("click", function (){
                usersEditSetOffcanvas(user.id, tr)
            })
            tdActions.insertAdjacentElement("beforeend", tdActionsInfo)
        }


        tr.insertAdjacentElement("beforeend", tdId)
        tr.insertAdjacentElement("beforeend", tdUsername)
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdRole)
        tr.insertAdjacentElement("beforeend", tdActivity)
        tr.insertAdjacentElement("beforeend", tdActions)
        return tr
    }

    if (updateTD){
        updateTD.replaceWith(getUserElement(users))
    } else {
        usersAdminTableBody.innerHTML = ""
        users.forEach(user => {
            usersAdminTableBody.insertAdjacentElement("beforeend", getUserElement(user))
        })
    }
}

const usersAdminTableBody = document.querySelector('#UsersTableBody')

//Filtering
let usersAdminFilteringID = null
let usersAdminFilteringTG = null
let usersAdminFilteringUsername = null
let usersAdminFilteringFullName = null
const usersAdminFilteringRole = []
let usersAdminFilteringUsernameSort = null
let usersAdminFilteringFullNameSort = null
let usersAdminFilteringIDSort = null

usersAdminMain()