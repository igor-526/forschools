async function materialsEditMain(){
    materialItemEditButton.addEventListener("click", materialItemEditOpen)
    materialItemDeleteButton.addEventListener("click", materialItemDelete)
    formMaterialNewType.classList.add("d-none")
    await materialItemSetCats()
    await materialItemSetLevels()
    formMaterialNewSubmitButton.addEventListener("click", materialItemSave)
}


function materialItemEditClientValidation(){
    return true
}


async function materialItemEditOpen(){
    const resp = await fetch(`/api/v1/materials/${material_id}`)
    if (resp.status === 200){
        const data = await resp.json()
        formMaterialNewNameField.value = data.name
        bsOffcanvasNewMaterial.show()
        formMaterialNewDescriptionField.value = data.description
        data.category.map(cat => {
            const option = formMaterialNewCategorySelect.querySelector(`[value="${cat.name}"]`)
            option.selected = true
        })
        data.level.map(lvl =>{
            const option = formMaterialNewLvlSelect.querySelector(`[value="${lvl.name}"]`)
            option.selected = true
        })
    } else {
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}


async function materialItemSetCats(){
    formMaterialNewCategorySelect.innerHTML = '<option value="new">Новая категория</option>'
    formMaterialNewCategorySelect.addEventListener('change', function () {
        if (formMaterialNewCategorySelect.value === 'new'){
            formMaterialNewCategoryField.classList.remove('d-none')
        } else {
            formMaterialNewCategoryField.classList.add('d-none')
        }
    })
    const response = await fetch('/api/v1/collections/mat_cats/')
    await response.json().then(json => {json.map(function (category) {
        formMaterialNewCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`
    })})
}


async function materialItemSetLevels(){
    formMaterialNewLvlSelect.innerHTML = '<option value="new">Новый уровень</option>'
    formMaterialNewLvlSelect.addEventListener('change', function () {
        if (formMaterialNewLvlSelect.value === 'new'){
            formMaterialNewLvlNewInput.classList.remove('d-none')
        } else {
            formMaterialNewLvlNewInput.classList.add('d-none')
        }
    })
    const response = await fetch('/api/v1/collections/mat_levels/')
    await response.json().then(json => {json.map(function (level) {
        formMaterialNewLvlSelect.innerHTML += `<option value="${level.name}">${level.name}</option>`
    })})
}


async function materialItemSave(){
    if (materialItemEditClientValidation()){
        const formData = new FormData(formNewMaterial)
        if (formData.get("file").size === 0){
            formData.delete("file")
        }
        const response = await fetch(`/api/v1/materials/${material_id}`, {
            method: "patch",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        if (response.status === 200){
            bsOffcanvasNewMaterial.hide()
            showToast("Успешно", "Материал успешно отредактирован. Обновите страницу")
        } else {
            bsOffcanvasNewMaterial.hide()
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    }
}


async function materialItemDelete(){
    await fetch(`/api/v1/materials/${material_id}`, {
        method: "delete",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    bsOffcanvasNewMaterial.hide()
    showToast("Успешно", "Материал успешно удалён")
    window.location.href = "/materials"
}




const materialItemEditButton = document.querySelector("#MaterialItemEditButton")
const materialItemDeleteButton = document.querySelector("#MaterialItemDeleteButton")

const bsOffcanvasNewMaterial = new bootstrap
    .Offcanvas(document.querySelector("#offcanvasNewMaterial"))
const formNewMaterial = document.querySelector("#formNewMaterial")
const formMaterialNewType = formNewMaterial.querySelector("#MaterialNewType")
const formMaterialNewFileField = formNewMaterial.querySelector("#MaterialNewFileField")
const formMaterialNewFileError = formNewMaterial.querySelector("#MaterialNewFileError")
const formMaterialNewNameField = formNewMaterial.querySelector("#MaterialNewNameField")
const formMaterialNewNameError = formNewMaterial.querySelector("#MaterialNewNameError")
const formMaterialNewDescriptionField = formNewMaterial.querySelector("#MaterialNewDescriptionField")
const formMaterialNewCategorySelect = formNewMaterial.querySelector("#MaterialNewCatInput")
const formMaterialNewCategoryField = formNewMaterial.querySelector("#MaterialNewCatNewInput")
const formMaterialNewSubmitButton = formNewMaterial.querySelector("#MaterialNewSubmitButton")
const formMaterialNewLvlSelect = formNewMaterial.querySelector("#MaterialNewLvlInput")
const formMaterialNewLvlNewInput = formNewMaterial.querySelector("#MaterialNewLvlNewInput")