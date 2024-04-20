async function materialAddMain(){
    newMaterialAllowedTypesArray = newMaterialAllowedTypesArray
        .concat(
            mediaFormats.imageFormats,
            mediaFormats.videoFormats,
            mediaFormats.animationFormats,
            mediaFormats.archiveFormats,
            mediaFormats.pdfFormats,
            mediaFormats.voiceFormats,
            mediaFormats.audioFormats,
            mediaFormats.textFormats,
            mediaFormats.presentationFormats
        )

    formMaterialsNewModalTextReadyButton.addEventListener("click", materialAddTextSave)
    formMaterialNewText.addEventListener("click", function () {
        MaterialsNewModalTextField.value = textMaterial
    })
    formMaterialNewTextClean.addEventListener("click", function () {
        materialAddTextReset()
        materialAddSetDisabledField()
    })
    formMaterialNewFileField.addEventListener('change', function () {
        const filename = formMaterialNewFileField.value.split(/([\\./])/g)
        formMaterialNewNameField.value = filename[filename.length-3]
        materialAddSetDisabledField()
    })
    formMaterialNewSubmitButton.addEventListener('click', createMaterial)
    if (materialAction === 'edit'){
        await materialsSetCategories()
        await materialsSetLevels()
        await materialEditSetupOffcanvas()
    }
    if (materialAction === 'add'){
        document.querySelector("#offcanvasNewMaterialButton")
            .addEventListener("click", materialAddReset)
    }
}

function materialAddReset(){
    formNewMaterial.reset()
    textMaterial = ''
    materialAddSetDisabledField()
}

function materialEditReset(){
    materialAddReset()
    formMaterialNewNameField.value = materialObject.name
    formMaterialNewDescriptionField.value = materialObject.description
    materialObject.category.map(cat => {
        formMaterialNewCategorySelect.querySelector(`[value="${cat.name}"]`).selected = true
    })
    materialObject.level.map(lvl => {
        formMaterialNewLvlSelect.querySelector(`[value="${lvl.name}"]`).selected = true
    })
}

async function materialEditSetupOffcanvas(){
    offcanvasNewMaterialTitle.innerHTML = "Редактирование материала"
    formMaterialNewType.classList.add("d-none")
    formMaterialNewTypeMy.disabled = true
    formMaterialNewTypeGeneral.disabled = true
    const request = await materialsAPIGet(material_id)
    if (request.status === 200){
        materialObject = request.response
    }
    document.querySelector("#MaterialItemEditButton")
        .addEventListener("click", materialEditReset)
}

function validateMaterialClient(){
    let validationStatus = true

    formMaterialNewFileField.classList.remove("is-invalid")
    formMaterialNewNameField.classList.remove("is-invalid")
    formMaterialNewFileError.innerHTML = ""
    formMaterialNewNameError.innerHTML = ""

    if (formMaterialNewFileField.value === ""){
        if (textMaterial === "" && materialAction === 'add'){
            formMaterialNewFileField.classList.add("is-invalid")
            formMaterialNewFileError.innerHTML = "Выберите файл или текст"
            validationStatus = false
        }
    } else {
        const filename = formMaterialNewFileField.value.split(/([\\./])/g)
        const type = filename[filename.length-1]
        if (!newMaterialAllowedTypesArray.includes(type.toLowerCase())){
            formMaterialNewFileField.classList.add("is-invalid")
            formMaterialNewFileError.innerHTML = "Формат файла не поддерживается"
            validationStatus = false
        }
    }

    if (formMaterialNewNameField.value === ""){
        formMaterialNewNameField.classList.add("is-invalid")
        formMaterialNewNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    }

    return validationStatus
}

function materialAddTextValidationClient(){
    let validationStatus = true
    MaterialsNewModalTextField.classList.remove("is-invalid")
    MaterialsNewModalTextError.innerHTML = ""
    if (MaterialsNewModalTextField.value === ""){
        MaterialsNewModalTextField.classList.add("is-invalid")
        MaterialsNewModalTextError.innerHTML = "Поле не может быть пустым.<br>Для удаления используйне кнопку"
        validationStatus = false
    }
    return validationStatus
}

function materialAddValidationServer(errors){

}

async function materialsSetCategories(){
    if (new_lvl_cat){
        formMaterialNewCategorySelect.innerHTML = '<option value="new">Новая категория</option>'
        formMaterialNewCategorySelect.addEventListener('change', function () {
            if (formMaterialNewCategorySelect.value === 'new'){
                formMaterialNewCategoryField.classList.remove('d-none')
            } else {
                formMaterialNewCategoryField.classList.add('d-none')
            }
        })
    } else {
        formMaterialNewCategorySelect.innerHTML = ''
    }
    const request = await collectionsGetMatCats()
    if (request.status === 200){
        request.response.map(category => {
            formMaterialNewCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`
        })
    }
}

async function materialsSetLevels(){
    if (new_lvl_cat){
        formMaterialNewLvlSelect.innerHTML = '<option value="new">Новый уровень</option>'
        formMaterialNewLvlSelect.addEventListener('change', function () {
            if (formMaterialNewLvlSelect.value === 'new'){
                formMaterialNewLvlNewInput.classList.remove('d-none')
            } else {
                formMaterialNewLvlNewInput.classList.add('d-none')
            }
        })
    } else {
        formMaterialNewLvlSelect.innerHTML = ''
    }
    const request = await collectionsGetMatLevels()
    if (request.status === 200){
        request.response.map(level => {
            formMaterialNewLvlSelect.innerHTML += `<option value="${level.name}">${level.name}</option>`
        })
    }
}

function materialAddSetDisabledField(){
    formMaterialNewFileField.disabled = (textMaterial !== "")
    formMaterialNewText.disabled = (formMaterialNewFileField.value !== "")
    formMaterialNewTextClean.disabled = (formMaterialNewFileField.value !== "")
}

function materialAddTextReset(){
    textMaterial = ''
    MaterialsNewModalTextField.value = ''
    MaterialsNewModalTextField.classList.remove("is-invalid")
    MaterialsNewModalTextError.innerHTML = ""
}

function materialAddTextSave(){
    if (materialAddTextValidationClient()){
        textMaterial = MaterialsNewModalTextField.value
        bsMaterialsModalText.hide()
        materialAddSetDisabledField()
    }
}

async function createMaterial() {
    if (validateMaterialClient()){
        const formData = new FormData(formNewMaterial)
        if (formData.get("file") == null){
            formData.set("file_text", textMaterial)
        }
        switch (materialAction){
            case 'add':
                const request = await materialsAPICreate(formData)
                if (request.status === 201){
                    bsOffcanvasNewMaterial.hide()
                    showToast("Добавление материала", "Материал успешно добавлен")
                    await getMaterials()
                } else if (request.status === 400){
                    materialAddValidationServer(request.response)
                } else {
                    bsOffcanvasNewMaterial.hide()
                    showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                }
                break
            case 'edit':
                if (formData.has("type")){
                    formData.delete("type")
                }
                const requestEdit = await materialsAPIEdit(formData, material_id)
                console.log(requestEdit)
                if (requestEdit.status === 200){
                    bsOffcanvasNewMaterial.hide()
                    showToast("Редактирование материала", "Материал успешно отредактирован")
                    await getMaterials()
                } else if (requestEdit.status === 400){
                    materialAddValidationServer(requestEdit.response)
                } else {
                    bsOffcanvasNewMaterial.hide()
                    showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
                }
        }
    }
}

let newMaterialAllowedTypesArray = []
let textMaterial = ''
let materialObject

//Bootstrap Elements
const offcanvasNewMaterial = document.querySelector("#offcanvasNewMaterial")
const bsOffcanvasNewMaterial = new bootstrap.Offcanvas(offcanvasNewMaterial)
const materialsModalText = document.querySelector("#MaterialsNewModalText")
const bsMaterialsModalText = new bootstrap.Modal(materialsModalText)
const offcanvasNewMaterialTitle = offcanvasNewMaterial.querySelector("#offcanvasNewMaterialTitle")

//FormNewMaterialText
MaterialsNewModalTextField = materialsModalText.querySelector("#MaterialsNewModalTextField")
MaterialsNewModalTextError = materialsModalText.querySelector("#MaterialsNewModalTextError")

//FormNewMaterial
const formNewMaterial = offcanvasNewMaterial.querySelector("#formNewMaterial")
const formMaterialNewType = offcanvasNewMaterial.querySelector("#MaterialNewType")
const formMaterialNewTypeMy = offcanvasNewMaterial.querySelector("#MaterialNewTypeMy")
const formMaterialNewTypeGeneral = offcanvasNewMaterial.querySelector("#MaterialNewTypeGeneral")
const formMaterialNewFileField = formNewMaterial.querySelector("#MaterialNewFileField")
const formMaterialNewFileError = formNewMaterial.querySelector("#MaterialNewFileError")
const formMaterialNewNameField = formNewMaterial.querySelector("#MaterialNewNameField")
const formMaterialNewNameError = formNewMaterial.querySelector("#MaterialNewNameError")
const formMaterialNewDescriptionField = formNewMaterial.querySelector("#MaterialNewDescriptionField")
const formMaterialNewCategorySelect = formNewMaterial.querySelector("#MaterialNewCatInput")
const formMaterialNewCategoryField = formNewMaterial.querySelector("#MaterialNewCatNewInput")
const formMaterialNewLvlSelect = formNewMaterial.querySelector("#MaterialNewLvlInput")
const formMaterialNewLvlNewInput = formNewMaterial.querySelector("#MaterialNewLvlNewInput")

//Buttons
const formMaterialNewSubmitButton = formNewMaterial.querySelector("#MaterialNewSubmitButton")
const formMaterialNewText = formNewMaterial.querySelector("#MaterialNewText")
const formMaterialNewTextClean = formNewMaterial.querySelector("#MaterialNewTextClean")
const formMaterialsNewModalTextReadyButton = materialsModalText.querySelector("#MaterialsNewModalTextReadyButton")

materialAddMain()
