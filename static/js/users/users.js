async function getUsers(){
    await fetch("/api/v1/users")
        .then(async response => await response.json())
        .then(content => userSet = content)
}

function showUsers(list = userSet){
    usersTableBody.innerHTML =  ``
    list.map(function (user){
        usersTableBody.insertAdjacentHTML("beforeend", `
        <tr data-user-id = ${user.id} id="UsersTableRow">
          <th scope="row">${user.id}</th>
          <td>${user.username}</td>
          <td>${user.last_name} ${user.first_name}</td>
          <td>${user.groups[0].name}</td>
        </tr>`)
    })
    usersTableBody.querySelectorAll("#UsersTableRow")
        .forEach(row => {
            row.addEventListener('click', showUser)
        })
}

async function setEngagementChannels(){
    formUserEditEngagementChannelSelect.innerHTML = ''
    await fetch("/api/v1/users/engagement_channels")
        .then(async response => await response.json())
        .then(content => content.map(function (channel) {
            formUserEditEngagementChannelSelect.innerHTML += `
            <option value="${channel.name}">${channel.name}</option>`
        }))
    formUserEditEngagementChannelSelect.innerHTML += `<option value="new">Новый</option>`
}

async function setLevels(){
    formUserEditLevelSelect.innerHTML = '<option disabled selected> Выберите </option>'
    await fetch("/api/v1/users/levels")
        .then(async response => await response.json())
        .then(content => content.map(function (level) {
            formUserEditLevelSelect.innerHTML += `
            <option value="${level.name}">${level.name}</option>`
        }))
    formUserEditLevelSelect.innerHTML += `
    <option value="new">Новый</option>`
}

async function setPrograms(){
    formUserEditProgramSelect.innerHTML = ''
    await fetch('/api/v1/users/programs')
        .then(async response => await response.json())
        .then(content => content.map(function (program){
            formUserEditProgramSelect.innerHTML += `
            <option value="${program.name}">${program.name}</option>`
        }))
    formUserEditProgramSelect.innerHTML += '<option value="new">Новая</option>'
}

async function main(){
    await getUsers()
    await setEngagementChannels()
    await setLevels()
    await setPrograms()
    showUsers()
}

let userSet

// BootStrap Elements
const bsOffcanvasRegister = new bootstrap
    .Offcanvas(document.querySelector("#offcanvasRegister"))
const bsOffcanvasUser = new bootstrap
    .Offcanvas(document.querySelector("#offcanvasUser"))
const bsPhotoDropdown = new bootstrap
    .Dropdown(document.querySelector("#UserShowPhotoDropdown"))

//Table
const usersTableBody = document.querySelector('#UsersTableBody')

main()