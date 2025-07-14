let bsOffcanvasEdit
let profileEditButton
let profileTelegramButton
let profileMessageButton


if (userSelf){
    bsOffcanvasEdit = new bootstrap
        .Offcanvas(document.querySelector("#offcanvasProfileEdit"))
    profileEditButton = document.querySelector("#ProfileEditButton")
    profileTelegramButton = document.querySelector("#ProfileTelegramButton")
    profileEditButton.addEventListener("click", function () {
        bsOffcanvasEdit.show()
    })
    profileTelegramButton.addEventListener("click", async function(){
        usersAdminTelegramSet(this.attributes.getNamedItem('data-user-id').value)
    })
} else {
    profileMessageButton = document.querySelector("#ProfileMessageButton")
    profileMessageButton.addEventListener("click", function () {
        showToast("Недоступно", "Данная функция находится в разработке")
    })
}