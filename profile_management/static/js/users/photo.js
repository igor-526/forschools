function usersAdminPhotoMain() {
    photoChange.addEventListener('change', async function(){
        const userID = formPhoto.attributes.getNamedItem("data-user-id").value
        await usersAdminPhotoUpdate(userID)
    })
    photoDelete.addEventListener('click', async function(){
        const userID = formPhoto.attributes.getNamedItem("data-user-id").value
        await usersAdminPhotoDelete(userID)
    })
}

async function usersAdminPhotoUpdate(userID){
    const formData = new FormData(formPhoto)
    await usersAPIPhotoUpdate(userID, formData).then(async response => {
        if (response.status === 200){
            await usersAdminPhotoGet(userID)
        }
    })
}

async function usersAdminPhotoGet(userID){
    await usersAPIPhotoGet(userID).then(request => {
        if (request.status === 200){
            photoImage.src = request.response.photo
        }
    })
}

async function usersAdminPhotoDelete(userID){
    await usersAPIPhotoDestroy(userID).then(async request => {
        if (request.status === 204){
            await usersAdminPhotoGet(userID)
        }
    })
}

const photoImage = formPhoto.querySelector("#UserShowPhotoImage")

usersAdminPhotoMain()