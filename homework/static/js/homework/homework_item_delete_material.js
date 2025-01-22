function hwItemMaterialDeleteMain(){
    hwItemMaterialDeleteModalDeleteButton.addEventListener("click", hwItemMaterialDelete)
}

function hwItemMaterialDeleteSetModal(matID, elem){
    hwItemMaterialDeleteSelectedMaterial = matID
    hwItemMaterialDeleteSelectedElement = elem
    bsHwItemMaterialDeleteModal.show()
}

function hwItemMaterialDelete(){
    homeworkAPIDeleteMaterial(hwID, hwItemMaterialDeleteSelectedMaterial).then(request => {
        switch (request.status){
            case 200:
                showSuccessToast("Материал успешно удалён")
                hwItemMaterialDeleteSelectedElement.parentElement.remove()
                break
            default:
                showErrorToast(request.response.error)
                break
        }
        bsHwItemMaterialDeleteModal.hide()
    })
}

let hwItemMaterialDeleteSelectedMaterial = null
let hwItemMaterialDeleteSelectedElement = null
const hwItemMaterialDeleteModal = document.querySelector("#hwItemMaterialDeleteModal")
const bsHwItemMaterialDeleteModal = new bootstrap.Modal(hwItemMaterialDeleteModal)
const hwItemMaterialDeleteModalDeleteButton = hwItemMaterialDeleteModal.querySelector("#hwItemMaterialDeleteModalDeleteButton")

hwItemMaterialDeleteMain()