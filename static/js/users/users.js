async function usersAdminMain(){
    await usersAdminGetAll()
    await usersAdminSetEngagementChannels()
    await usersAdminSetLevels()
    await usersAdminSetPrograms()
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

function usersAdminGetGroupsHTML(groups){
    let groupsHTML = ''
    groups.map(group => {
        groupsHTML += `${group.name}<br>`
    })
    return groupsHTML
}

function usersAdminGetRowClasses(user){
    let classList = []
    if (user.is_active === false){
        classList.push("table-danger")
    }
    if (user.editable){
        classList.push("users-admin-table-row")
    } else {
        classList.push("table-secondary")
    }
    return classList.join(" ")
}

function usersAdminGetUsersHTML(users){
    let usersHTML = ''
    users.map(function (user){
        const groupsHTML = usersAdminGetGroupsHTML(user.groups)
        const rowclasses = usersAdminGetRowClasses(user)
        usersHTML += `
        <tr data-user-id=${user.id} class="${rowclasses}">
          <th scope="row">${user.id}</th>
          <td><a href="/profile/${user.id}">${user.username}</a></td>
          <td>${user.last_name} ${user.first_name}</td>
          <td>${groupsHTML}</td>
        </tr>`

    })
    return usersHTML
}

function usersAdminShow(arr = usersAdminArray){
    usersAdminTableBody.innerHTML =  usersAdminGetUsersHTML(arr)
    usersAdminTableBody.querySelectorAll(".users-admin-table-row")
        .forEach(row => {
            row.addEventListener('click', usersAdminShowUser)
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

async function usersAdminSetPrograms(){
    formUserEditProgramSelect.innerHTML = ''
    await collectionsAPIGetPrograms().then(response => {
        if (response.status === 200){
            response.response.map(program => {
                formUserEditProgramSelect.innerHTML += `
            <option value="${program.name}">${program.name}</option>`
            })
            if (canSetNewEngChLvlPrg){
                formUserEditProgramSelect.innerHTML += '<option value="new">Новая</option>'
            }
        }
    })
}


let usersAdminArray
const usersAdminTableBody = document.querySelector('#UsersTableBody')

usersAdminMain()