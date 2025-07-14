function materialsToHWMain(){
    materialsToHWOffcanvasSaveButton.addEventListener("click", materialsToHWCreate)
}

function materialsToHWSet(){
    materialsToHWOffcanvasMaterialsList.innerHTML = ""
    materialsToHWOffcanvasNameField.value = ""
    materialsToHWOffcanvasNameError.innerHTML = ""
    materialsToHWOffcanvasDescriptionField.value = "Выполните следующее задание:"
    materialsToHWOffcanvasDescriptionError.innerHTML = ""
    materialsToHWOffcanvasNameField.classList.remove("is-invalid")
    materialsToHWOffcanvasDescriptionField.classList.remove("is-invalid")
    bsMaterialsToHWOffcanvas.show()
    materialsMainSelectedArray.forEach(matID => {
        materialsAPIGet(matID).then(request => {
            switch (request.status){
                case 200:
                    if (materialsToHWOffcanvasNameField.value === ""){
                        materialsToHWOffcanvasNameField.value = request.response.name
                    } else {
                        materialsToHWOffcanvasNameField.value += `, ${request.response.name}`
                    }

                    if (request.response.description !== ""){
                        if (materialsToHWOffcanvasDescriptionField.value === "Выполните следующее задание:"){
                            materialsToHWOffcanvasDescriptionField.value = request.response.description
                        } else {
                            materialsToHWOffcanvasDescriptionField.value += `\n${request.response.description}`
                        }
                    }
                    materialsToHWOffcanvasMaterialsList.insertAdjacentHTML("beforeend", `
                    <li class="list-group-item">${request.response.name}</li>
                    `)
                    break
                default:
                    bsMaterialsToHWOffcanvas.hide()
                    showErrorToast()
                    break
            }
        })
    })
}

function materialsToHWValidation(errors){
    function resetValidation(){
        materialsToHWOffcanvasNameError.innerHTML = ""
        materialsToHWOffcanvasDescriptionError.innerHTML = ""
        materialsToHWOffcanvasNameField.classList.remove("is-invalid")
        materialsToHWOffcanvasDescriptionField.classList.remove("is-invalid")
    }

    function setInvalid(element, errorElement, errorText=""){
        element.classList.add("is-invalid")
        if (errorElement){
            errorElement.innerHTML = errorText
        }
        validationStatus = false
    }

    function validateName(){
        if (materialsToHWOffcanvasNameField.value.trim() === ""){
            setInvalid(
                materialsToHWOffcanvasNameField,
                materialsToHWOffcanvasNameError,
                "Имя ДЗ не может быть пустым"
            )
        }
        if (materialsToHWOffcanvasNameField.value.trim().length > 200){
            setInvalid(
                materialsToHWOffcanvasNameField,
                materialsToHWOffcanvasNameError,
                "Имя ДЗ не может превышать 200 символов"
            )
        }
    }

    function validateDescription(){
        if (materialsToHWOffcanvasDescriptionField.value.trim() === ""){
            setInvalid(
                materialsToHWOffcanvasDescriptionField,
                materialsToHWOffcanvasDescriptionError,
                "Описание не может быть пустым"
            )
        }
        if (materialsToHWOffcanvasDescriptionField.value.trim().length > 2000){
            setInvalid(
                materialsToHWOffcanvasDescriptionField,
                materialsToHWOffcanvasDescriptionError,
                "Описание не может превышать 2000 символов"
            )
        }
    }

    let validationStatus = true
    resetValidation()
    if (errors){
        if (errors.hasOwnProperty("name")){
            setInvalid(
                materialsToHWOffcanvasNameField,
                materialsToHWOffcanvasNameError,
                errors.name
            )
        }
        if (errors.hasOwnProperty("description")){
            setInvalid(
                materialsToHWOffcanvasDescriptionField,
                materialsToHWOffcanvasDescriptionError,
                errors.description
            )
        }
    } else {
        validateName()
        validateDescription()
    }
    return validationStatus
}

function materialsToHWCreate(){
    function getFD(){
        const fd = new FormData(materialsToHWOffcanvasForm)
        const fdName = fd.get("name").trim()
        const fdDesc = fd.get("description").trim()
        fd.set("name", fdName)
        fd.set("description", fdDesc)
        materialsMainSelectedArray.forEach(matID => {
            fd.append("materials", matID)
        })
        return fd
    }

    if (materialsToHWValidation()){
        programsAPIHWCreate(getFD()).then(request => {
            switch (request.status){
                case 201:
                    bsMaterialsToHWOffcanvas.hide()
                    showSuccessToast("ДЗ успешно создано")
                    break
                case 400:
                    materialsToHWValidation(request.response)
                    break
                default:
                    bsMaterialsToHWOffcanvas.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

//Bootstrap Elements
const materialsToHWOffcanvas = document.querySelector("#materialsToHWOffcanvas")
const bsMaterialsToHWOffcanvas = new bootstrap.Offcanvas(materialsToHWOffcanvas)

//Form
const materialsToHWOffcanvasForm = materialsToHWOffcanvas.querySelector("#materialsToHWOffcanvasForm")
const materialsToHWOffcanvasNameField = materialsToHWOffcanvasForm.querySelector("#materialsToHWOffcanvasNameField")
const materialsToHWOffcanvasNameError = materialsToHWOffcanvasForm.querySelector("#materialsToHWOffcanvasNameError")
const materialsToHWOffcanvasDescriptionField = materialsToHWOffcanvasForm.querySelector("#materialsToHWOffcanvasDescriptionField")
const materialsToHWOffcanvasDescriptionError = materialsToHWOffcanvasForm.querySelector("#materialsToHWOffcanvasDescriptionError")
const materialsToHWOffcanvasMaterialsList = materialsToHWOffcanvasForm.querySelector("#materialsToHWOffcanvasMaterialsList")
const materialsToHWOffcanvasSaveButton = materialsToHWOffcanvasForm.querySelector("#materialsToHWOffcanvasSaveButton")

//Buttons

materialsToHWMain()