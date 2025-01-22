function materialsItemDeleteMain(){
    document.querySelector("#MaterialsItemModalDeleteButton")
        .addEventListener("click", materialsItemDelete)
}

async function materialsItemDelete(){
    const request = await materialsAPIDelete(material_id)
    if (request.status === 200){
        bsMaterialsItemModalDelete.hide()
        window.location.replace("/materials")
    } else {
        bsMaterialsItemModalDelete.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

const bsMaterialsItemModalDelete = new bootstrap.Modal(document.querySelector("#MaterialsItemModalDelete"))

materialsItemDeleteMain()