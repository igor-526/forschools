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

const formPhoto = document.querySelector("#formUserPhoto")
const photo = formPhoto.querySelector("#UserShowPhotoField")
const photoImage = formPhoto.querySelector("#UserShowPhotoImage")
const photoChange = formPhoto.querySelector("#UserShowPhotoChangeField")
const photoDelete = formPhoto.querySelector("#UserShowPhotoDelButton")

photoChange.addEventListener('change', setPhoto)
photoDelete.addEventListener('click', deletePhoto)

photo.addEventListener('click', function () {
    bsPhotoDropdown.toggle()
})