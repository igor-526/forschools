async function profileEditSetPhoto(){
    await fetch(`/api/v1/users/${userID}/photo/`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(formProfileEditPhoto)
    })
    await profileEditUpdatePhoto()
}

async function profileEditUpdatePhoto(){
    const response = await fetch(`/api/v1/users/${userID}/photo/`)
    await response.json()
        .then(content => profileEditPhotoImage.src = content.photo)
    profileEditPhotoImage.src = content.photo
}

async function profileEditDeletePhoto(){
    await fetch(`/api/v1/users/${userID}/photo/`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        }
    })
    await profileEditUpdatePhoto()
}

// Photo Form
const formProfileEditPhoto = document.querySelector("#formProfilePhoto")
const profileEditPhotoField = formProfileEditPhoto.querySelector("#ProfileEditPhotoField")
const profileEditPhotoImage = formProfileEditPhoto.querySelector("#ProfileEditPhotoImage")
const profileEditPhotoChange = formProfileEditPhoto.querySelector("#ProfileEditPhotoChangeField")
const profileEditPhotoDelete = formProfileEditPhoto.querySelector("#ProfileEditPhotoDelButton")

// BootStrapElements
const profileEditPhotoCollapse = formProfileEditPhoto.querySelector("#ProfileEditPhotoCollapse")
const bsProfileEditPhotoCollapse = new bootstrap.Collapse(profileEditPhotoCollapse)


profileEditPhotoField.addEventListener("click", function () {
    bsProfileEditPhotoCollapse.toggle()
})

profileEditPhotoChange.addEventListener('change', profileEditSetPhoto)
profileEditPhotoDelete.addEventListener('click', profileEditDeletePhoto)