function validateMaterialClient(){
    let validationStatus = true

    formMaterialNewFileField.classList.remove("is-invalid")
    formMaterialNewNameField.classList.remove("is-invalid")
    formMaterialNewFileError.innerHTML = ""
    formMaterialNewNameError.innerHTML = ""

    if (formMaterialNewFileField.value === ""){
        formMaterialNewFileField.classList.add("is-invalid")
        formMaterialNewFileError.innerHTML = "Выберите файл"
        validationStatus = false
    } else {
        const allowedTypes = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'pdf', 'rar', 'zip', '7z', 'webm', 'mkv', 'avi', 'mov', 'wmv', 'mp4', 'm4p', 'mpg', 'mpeg', 'm4v']
        const filename = formMaterialNewFileField.value.split(/([\\./])/g)
        const type = filename[filename.length-1]
        if (!allowedTypes.includes(type.toLowerCase())){
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

async function createMaterial() {
    if (validateMaterialClient()){
        let formData = new FormData(formNewMaterial)
        let response = await fetch('/api/v1/materials/', {
            method: "post",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData
        })
        if (response.status === 201){
            bsOffcanvasNewMaterial.hide()
            showToast("Добавление материала", "Материал успешно добавлен")
            await getMaterials()
        } else {
            await response.json().then(async resp => console.log(resp))
            showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
        }
    }
}

const formNewMaterial = document.querySelector("#formNewMaterial")
const formMaterialNewTypeMy = formNewMaterial.querySelector("#MaterialNewTypeMy")
const formMaterialNewTypeGeneral = formNewMaterial.querySelector("#MaterialNewTypeGeneral")
const formMaterialNewFileField = formNewMaterial.querySelector("#MaterialNewFileField")
const formMaterialNewFileError = formNewMaterial.querySelector("#MaterialNewFileError")
const formMaterialNewNameField = formNewMaterial.querySelector("#MaterialNewNameField")
const formMaterialNewNameError = formNewMaterial.querySelector("#MaterialNewNameError")
const formMaterialNewDescriptionField = formNewMaterial.querySelector("#MaterialNewDescriptionField")
const formMaterialNewCategorySelect = formNewMaterial.querySelector("#MaterialNewCatInput")
const formMaterialNewCategoryField = formNewMaterial.querySelector("#MaterialNewCatNewInput")
const formMaterialNewSubmitButton = formNewMaterial.querySelector("#MaterialNewSubmitButton")