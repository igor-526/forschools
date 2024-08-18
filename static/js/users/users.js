async function usersAdminMain(){
    await usersAdminGetAll()
    await usersAdminSetEngagementChannels()
    await usersAdminSetLevels()
}


async function usersAdminGetAll(){
    await usersAPIGetAll().then(response => {
        if (response.status === 200){
            usersAdminArray = response.response
            usersAdminShow()
        } else {
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    })
}

function usersAdminShow(users = usersAdminArray){
    function getRoles(roles){
        let ruRoles = []
        roles.forEach(role => {
            switch (role.name){
                case "Listener":
                    ruRoles.push("Ученик")
                    break
                case "Teacher":
                    ruRoles.push("Преподаватель")
                    break
                case "Metodist":
                    ruRoles.push("Методист")
                    break
                case "Admin":
                    ruRoles.push("Администратор")
                    break
            }
        })
        return ruRoles.join("<br>")
    }

    function getUserElement(user){
        const tr = document.createElement("tr")
        if (!user.is_active){
            tr.classList.add("table-danger")
        }
        if (!user.editable){
            tr.classList.add("table-secondary")
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
        tdName.innerHTML = `<a href="profile/${user.id}">${user.first_name} ${user.last_name}</a>`
        const tdRole = document.createElement("td")
        tdRole.innerHTML = getRoles(user.groups)
        const tdActions = document.createElement("td")

        const tdActionsInfo = document.createElement("button")
        const tdActionsChat = document.createElement("button")
        const tdActionsChatA = document.createElement("a")
        const tdActionsProfile = document.createElement("button")
        const tdActionsProfileA = document.createElement("a")
        const tdActionsLearnInfo = document.createElement("button")
        tdActionsChatA.insertAdjacentElement("beforeend", tdActionsChat)
        tdActionsProfileA.insertAdjacentElement("beforeend", tdActionsProfile)
        tdActionsChatA.href = `/messages`
        tdActionsChatA.target = "_blank"
        tdActionsProfileA.href = `/profile/${user.id}`
        tdActionsProfileA.target = "_blank"

        tdActionsInfo.type = "button"
        tdActionsInfo.classList.add("btn", "btn-warning", "mx-1")
        tdActionsInfo.role = "button"
        tdActionsInfo.innerHTML = '<i class="bi bi-pencil-fill"></i>'
        tdActionsInfo.addEventListener("click", function (){
            usersAdminShowUser(user.id)
        })

        tdActionsChat.type = "button"
        tdActionsChat.classList.add("btn", "btn-primary", "mx-1")
        tdActionsChat.role = "button"
        tdActionsChat.innerHTML = '<i class="bi bi-chat-dots"></i>'

        tdActionsLearnInfo.type = "button"
        tdActionsLearnInfo.classList.add("btn", "btn-primary", "mx-1")
        tdActionsLearnInfo.role = "button"
        tdActionsLearnInfo.innerHTML = '<i class="bi bi-card-list"></i>'
        tdActionsLearnInfo.addEventListener("click", function () {
            usersLearnInfoSetModal(user.id)
        })

        tdActions.insertAdjacentElement("beforeend", tdActionsChatA)
        tdActions.insertAdjacentElement("beforeend", tdActionsLearnInfo)
        tdActions.insertAdjacentElement("beforeend", tdActionsInfo)

        tr.insertAdjacentElement("beforeend", tdId)
        tr.insertAdjacentElement("beforeend", tdUsername)
        tr.insertAdjacentElement("beforeend", tdName)
        tr.insertAdjacentElement("beforeend", tdRole)
        tr.insertAdjacentElement("beforeend", tdActions)
        return tr
    }

    usersAdminTableBody.innerHTML = ""
    users.forEach(user => {
        usersAdminTableBody.insertAdjacentElement("beforeend", getUserElement(user))
    })
}

async function usersAdminSetEngagementChannels(){
    formUserEditEngagementChannelSelect.innerHTML = '<option value="none" selected> Выберите </option>'
    await collectionsAPIGetEngChannels().then(response => {
        if (response.status === 200){
            response.response.map(channel => {
                formUserEditEngagementChannelSelect.innerHTML += `
            <option value="${channel.name}">${channel.name}</option>`
            })
        }
    })
    if (canSetNewEngChLvlPrg){
        formUserEditEngagementChannelSelect.innerHTML += `<option value="new">Новый</option>`
    }
}

async function usersAdminSetLevels(){
    formUserEditLevelSelect.innerHTML = '<option value="none" selected> Выберите </option>'
    await collectionsAPIGetLevels().then(response => {
        if (response.status === 200){
            response.response.map(level => {
                formUserEditLevelSelect.innerHTML += `
            <option value="${level.name}">${level.name}</option>`
            })
            if (canSetNewEngChLvlPrg){
                formUserEditLevelSelect.innerHTML += '<option value="new">Новый</option>'
            }
        }
    })
}


let usersAdminArray
const usersAdminTableBody = document.querySelector('#UsersTableBody')

usersAdminMain()