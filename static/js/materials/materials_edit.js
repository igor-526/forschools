function materialsEditMain(){
    materialsModalEditSaveButton.addEventListener('click', materialsEditUpdate)
    materialsModalDeleteButton.addEventListener('click', materialsEditDelete)

    materialsModalEditCatSearch.addEventListener("input", function (){
        const query = new RegExp(materialsModalEditCatSearch.value.trim().toLowerCase())
        materialsModalEditCatSelect.querySelectorAll("option").forEach(e => {
            query.test(e.innerHTML.toLowerCase()) ? e.classList.remove("d-none") : e.classList.add("d-none")
        })
    })

    materialsModalEditLvlSearch.addEventListener("input", function (){
        const query = new RegExp(materialsModalEditLvlSearch.value.trim().toLowerCase())
        materialsModalEditLvlSelect.querySelectorAll("option").forEach(e => {
            query.test(e.innerHTML.toLowerCase()) ? e.classList.remove("d-none") : e.classList.add("d-none")
        })
    })

    if (new_lvl_cat){
        materialsModalEditCatSelect.addEventListener("change", function () {
            if (materialsModalEditCatSelect.querySelector('[value="new"]').selected){
                materialsModalEditCatNewInput.classList.remove("d-none")
            } else {
                materialsModalEditCatNewInput.classList.add("d-none")
            }
        })
        materialsModalEditLvlSelect.addEventListener("change", function () {
            if (materialsModalEditLvlSelect.querySelector('[value="new"]').selected){
                materialsModalEditLvlNewInput.classList.remove("d-none")
            } else {
                materialsModalEditLvlNewInput.classList.add("d-none")
            }
        })

    }
}

function materialsEditSet(matID = []){
    materialsForUpdate = matID
    materialsModalEditCatSearch.value = ""
    materialsModalEditLvlSearch.value = ""
    materialsModalEditCatNewInput.value = ""
    materialsModalEditLvlNewInput.value = ""
    materialsModalEditCatNewInput.classList.add("d-none")
    materialsModalEditLvlNewInput.classList.add("d-none")
    materialsModalEditCatSelect.querySelectorAll("option").forEach(e => {
        e.classList.remove("d-none")
    })
    materialsModalEditLvlSelect.querySelectorAll("option").forEach(e => {
        e.classList.remove("d-none")
    })
    materialsEditResetValidation()
    switch (matID.length){
        case 1:
            materialsAPIGet(matID[0]).then(request => {
                switch (request.status){
                    case 200:
                        materialsModalEditNameField.value = request.response.name
                        materialsModalEditDescriptionField.value = request.response.description
                        bsMaterialsModalEdit.show()
                        request.response.category.forEach(e => {
                            materialsModalEditCatSelect.querySelector(`[value="${e.name}"]`).selected = true
                        })
                        request.response.level.forEach(e => {
                            materialsModalEditLvlSelect.querySelector(`[value="${e.name}"]`).selected = true
                        })
                        break
                    default:
                        showErrorToast()
                }
            })
            materialsModalEditNameField.disabled = false
            materialsModalEditDescriptionField.disabled = false
            break
        default:
            materialsModalEditNameField.value = ""
            materialsModalEditDescriptionField.value = ""
            materialsModalEditNameField.disabled = true
            materialsModalEditDescriptionField.disabled = true
            materialsModalEditCatSelect.querySelectorAll("option").forEach(e => {
                e.selected = false
            })
            materialsModalEditLvlSelect.querySelectorAll("option").forEach(e => {
                e.selected = false
            })
            bsMaterialsModalEdit.show()
            break
    }
}

function materialsEditResetValidation(){
    materialsModalEditNameField.classList.remove("is-invalid")
    materialsModalEditNameError.innerHTML = ""
}

function materialsEditValidation(errors = []){
    function setInvalid(element, errorElement, error=""){
        element.classList.add("is-invalid")
        errorElement.innerHTML = error
        validationStatus = false
    }

    function validateName(){
        if (materialsModalEditNameField.value.trim() === "" && !materialsModalEditNameField.disabled){
            setInvalid(
                materialsModalEditNameField,
                materialsModalEditNameError,
                "Поле не может быть пустым"
            )
        }
    }

    let validationStatus = true
    switch (errors.length){
        case 0:
            materialsEditResetValidation()
            validateName()
            return validationStatus
        default:
            if (errors.hasOwnProperty("name")){
                setInvalid(
                    materialsModalEditNameField,
                    materialsModalEditNameError,
                    errors.name
                )
            }
            return false
    }
}

function materialsEditDeleteSet(matID = []){
    materialsForUpdate = matID
    bsMaterialsModalDelete.show()
}

function materialsEditUpdate(){
    if (materialsEditValidation()){
        const fd = new FormData(materialsModalEditForm)
        let status = "success"
        materialsForUpdate.forEach(mID => {
            materialsAPIUpdate(fd, mID).then(request => {
                switch (request.status){
                    case 200:
                        materialsMainShowTable([request.response], "replace")
                        break
                    case 400:
                        materialsEditValidation(request.response)
                        break
                    default:
                        status = "failed"
                        break
                }
            })
        })
        switch (status) {
            case "success":
                bsMaterialsModalEdit.hide()
                showSuccessToast("Материалы успешно изменены")
                break
            case "failed":
                bsMaterialsModalEdit.hide()
                showErrorToast()
        }
    }
}

function materialsEditDelete(){
    materialsForUpdate.forEach(mID => {
        let status = "success"
        materialsAPIDelete(mID).then(request => {
            switch (request.status){
                case 200:
                    materialsMainShowTable([mID], "delete")
                    break
                default:
                    status = "failed"
                    break
            }
            bsMaterialsModalDelete.hide()
            switch (status){
                case "success":
                    showSuccessToast("Материалы успешно удалены")
                    break
                case "failed":
                    showErrorToast()
                    break
            }
        })
    })
}

//BootstrapElements
const materialsModalEdit = document.querySelector("#materialsModalEdit")
const bsMaterialsModalEdit = new bootstrap.Modal(materialsModalEdit)
const materialsModalDelete = document.querySelector("#materialsModalDelete")
const bsMaterialsModalDelete = new bootstrap.Modal(materialsModalDelete)

//Form
const materialsModalEditForm = materialsModalEdit.querySelector("#materialsModalEditForm")
const materialsModalEditNameField = materialsModalEditForm.querySelector("#materialsModalEditNameField")
const materialsModalEditNameError = materialsModalEditForm.querySelector("#materialsModalEditNameError")
const materialsModalEditDescriptionField = materialsModalEditForm.querySelector("#materialsModalEditDescriptionField")
const materialsModalEditCatSearch = materialsModalEditForm.querySelector("#materialsModalEditCatSearch")
const materialsModalEditCatSelect = materialsModalEditForm.querySelector("#materialsModalEditCatSelect")
const materialsModalEditCatNewInput = materialsModalEditForm.querySelector("#materialsModalEditCatNewInput")
const materialsModalEditLvlSearch = materialsModalEditForm.querySelector("#materialsModalEditLvlSearch")
const materialsModalEditLvlSelect = materialsModalEditForm.querySelector("#materialsModalEditLvlSelect")
const materialsModalEditLvlNewInput = materialsModalEditForm.querySelector("#materialsModalEditLvlNewInput")

//Button
const materialsModalEditSaveButton = materialsModalEdit.querySelector("#materialsModalEditSaveButton")
const materialsModalDeleteButton = materialsModalDelete.querySelector("#materialsModalDeleteButton")

let materialsForUpdate = []

materialsEditMain()