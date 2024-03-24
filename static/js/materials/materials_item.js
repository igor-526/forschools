console.log(userPermissions)

if (userPermissions.includes("material.send_telegram")){
    document.querySelector("#MaterialsItemTelegramButton")
        .addEventListener("click", materialsTelegramMain)
}
if (user_perm_can_edit){
    materialsEditMain()
}