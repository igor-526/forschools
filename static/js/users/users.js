async function getUsers(){
    let response= await  fetch("/api/v1/users")
    let content = await response.json()
    let usertable = document.querySelector('.usertable')
    usertable.innerHTML =  ``
    let key
    for (key in content){
        usertable.insertAdjacentHTML("beforeend", `
        <tr data-user-id = ${content[key].id} >
          <th scope="row">${content[key].id}</th>
          <td>${content[key].username}</td>
          <td>${content[key].last_name} ${content[key].first_name}</td>
          <td>${content[key].groups[0].name}</td>
        </tr>
        `)
        let userObject = usertable.querySelector(`[data-user-id="${content[key].id}"]`)
        userObject.addEventListener('click', function () {
            showUser(userObject)
        })
    }
}

async function registerUser(){
    const data = new FormData(formRegistration);
    data.append("password2", data.get('password1'))
    let response = await fetch("/register", {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: data
    })
    if (response.status === 200){
        bsOffcanvasRegister.hide()
        showToast("Регистрация пользователя", "Пользователь успешно зарегистрирован")
        await getUsers()
    } else if (response.status === 400) {
        const errors = await response.json()
        if (errors.username) {
            document.getElementById("RegisterUserUsernameField").classList.add("is-invalid")
            document.getElementById("RegisterUserUsernameErrors").innerHTML = errors.username
        }
        if (errors.password1) {
            document.getElementById("RegisterUserPasswordField").classList.add("is-invalid")
            document.getElementById("RegisterUserPasswordErrors").innerHTML = errors.password1
        }
    }
}

async function saveUser() {
    const userID = formUser.attributes.getNamedItem('data-user-id').value
    const formData = new FormData(formUser);
    const response = await fetch(`/api/v1/users/${userID}/`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    bsOffcanvasUser.hide()
    if (response.status === 200){
        showToast("Изменение пользователя", "Пользователь успешно изменён")
    }
    await getUsers()
}

async function deleteUser(){
    const userID = formUser.attributes.getNamedItem('data-user-id').value
    let response = await fetch(`/api/v1/users/${userID}/`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    bsOffcanvasUser.hide()
    await getUsers()
}

async function showUser(userObject){
    await setEngagementChannels()
    await setLevels()
    await setPrograms()
    const userID = userObject.attributes.getNamedItem('data-user-id').value
    const response = await fetch(`/api/v1/users/${userID}/`)
    const userdata = await response.json()
    bsOffcanvasUser.show()
    if (userdata.engagement_channel){
        engagementChannelSelect.value = userdata.engagement_channel.name
    }
    if (userdata.level){
        levelSelect.value = userdata.level.name
    }

    username.value = userdata.username
    last_name.value = userdata.last_name
    first_name.value = userdata.first_name
    role.value = userdata.groups[0].name
    email.value = userdata.email
    bdate.value = userdata.bdate
    progress.value = userdata.progress
    work_experience.value = userdata.work_experience
    private_lessons.checked = userdata.private_lessons
    group_lessons.checked = userdata.group_lessons
    note.value = userdata.note
    photoImage.src = userdata.photo
    let key
    for (key in userdata.programs){
        const option = programSelect.querySelector(`[value="${userdata.programs[key].name}"]`)
        option.selected = true
    }
    formUser.setAttribute('data-user-id', userdata.id)
}

async function setEngagementChannels(){
    let response= await  fetch("/api/v1/users/engagement_channels")
    let content = await response.json()
    let key
    engagementChannelSelect.innerHTML = ''
    for (key in content){
        engagementChannelSelect.innerHTML += `
        <option value="${content[key].name}">${content[key].name}</option>
        `
    }
    engagementChannelSelect.innerHTML += `
    <option value="new"> Новый </option>
    `
}

async function setLevels(){
    const response = await fetch("/api/v1/users/levels")
    const content = await response.json()
    let key
    levelSelect.innerHTML = '<option disabled selected> Выберите </option>'
    for (key in content){
        levelSelect.innerHTML += `
        <option value="${content[key].name}">${content[key].name}</option>
        `
    }
    levelSelect.innerHTML += `
    <option value="new"> Новый </option>
    `
}

async function setPrograms(){
    const response = await fetch('/api/v1/users/programs')
    const content = await response.json()
    let key
    programSelect.innerHTML = ''
    for (key in content){
        programSelect.innerHTML += `
        <option value="${content[key].name}">${content[key].name}</option>
        `
    }
    programSelect.innerHTML += '<option value="new">Новая</option>'
}

async function setPhoto(){
    const userID = formUser.attributes.getNamedItem('data-user-id').value
    const formData = new FormData(formPhoto)
    let response = await fetch(`/api/v1/users/${userID}/photo/`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    await updatePhoto()
}

async function updatePhoto(){
    const userID = formUser.attributes.getNamedItem('data-user-id').value
    const response = await fetch(`/api/v1/users/${userID}/photo/`)
    const content = await response.json()
    console.log(content)
    photoImage.src = content.photo
}

async function deletePhoto(){
    const userID = formUser.attributes.getNamedItem('data-user-id').value
    await fetch(`/api/v1/users/${userID}/photo/`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    await updatePhoto()
}

async function main(){
    await getUsers()

    saveButton.addEventListener('click', saveUser)
    registrationButtonRegister.addEventListener('click', registerUser)
    deleteButton.addEventListener('click', deleteUser)
    photoChange.addEventListener('change', setPhoto)
    photoDelete.addEventListener('click', deletePhoto)
    programSelect.addEventListener('change', function () {
        if (this.value === 'new'){
            programInput.classList.remove('d-none')
        } else {
            programInput.classList.add('d-none')
        }
    })
    engagementChannelSelect.addEventListener('change', function () {
        if (this.value === 'new'){
            engagementChannelInput.classList.remove('d-none')
        } else {
            engagementChannelInput.classList.add('d-none')
        }
    })
    levelSelect.addEventListener('change', function () {
        if (this.value === 'new'){
            levelInput.classList.remove('d-none')
        } else {
            levelInput.classList.add('d-none')
        }
    })
    photo.addEventListener('click', function () {
        bsPhotoDropdown.toggle()
    })
}

// BootStrap Elements
const offcanvasRegister = document.querySelector("#offcanvasRegister")
const offcanvasUser = document.querySelector("#offcanvasUser")
const photoDropdown = document.querySelector("#UserShowPhotoDropdown")
const bsOffcanvasRegister = new bootstrap.Offcanvas(offcanvasRegister)
const bsOffcanvasUser = new bootstrap.Offcanvas(offcanvasUser)
const bsPhotoDropdown = new bootstrap.Dropdown(photoDropdown)

// Forms
const formRegistration = document.querySelector('.form-registration')
const formUser = document.querySelector(".form-user-details")
const formPhoto = document.querySelector(".form-user-photo")

// Forms (UserPhoto)
const photo = formPhoto.querySelector("#UserShowPhotoField")
const photoImage = formPhoto.querySelector("#UserShowPhotoImage")
const photoChange = formPhoto.querySelector("#UserShowPhotoChangeField")
const photoDelete = formPhoto.querySelector("#UserShowPhotoDelButton")

//Forms (Registration)
const registrationButtonRegister = formRegistration.querySelector("#UserRegistrationButton")

//  Forms (EditUser)
const username = formUser.querySelector("#UserShowUsernameField")
const last_name = formUser.querySelector("#UserShowLastNameField")
const first_name = formUser.querySelector("#UserShowFirstNameField")
const email = formUser.querySelector("#UserShowEmailField")
const role = formUser.querySelector("#UserShowRoleField")
const bdate = formUser.querySelector("#UserShowBDateField")
const private_lessons = formUser.querySelector("#UserShowPrivateLessonsField")
const group_lessons = formUser.querySelector("#UserShowGroupLessonsField")
const programSelect = formUser.querySelector("#UserShowProgramsField")
const programInput = formUser.querySelector("#UserNewProgramField")
const progress = formUser.querySelector("#UserShowProgressField")
const levelSelect = formUser.querySelector("#UserShowLevelField")
const levelInput = formUser.querySelector("#UserNewLevelField")
const work_experience = formUser.querySelector("#UserShowWorkExperienceField")
const note = formUser.querySelector("#UserShowNoteField")
const engagementChannelSelect = formUser.querySelector("#UserShowEngagementChannelField")
const engagementChannelInput = formUser.querySelector("#UserNewEngagementChannelField")
const saveButton = formUser.querySelector("#UserShowSaveButton")
const deleteButton = formUser.querySelector("#UserShowDeleteButton")
const deactivateButton = formUser.querySelector("#UserShowDeactivateButton")
const telegramButton = formUser.querySelector("#UserShowTelegramButton")

main()