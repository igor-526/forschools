function universalFieldValidator(validateInfo = []){
    function resetValidation(){
        validateInfo.forEach(field => {
            if (field.inputElement){
                field.inputElement.classList.remove("is-invalid")
            }
            if (field.errorElement){
                field.errorElement.innerHTML = ""
            }
        })
    }

    resetValidation()
    let validationStatus = true

    validateInfo.forEach(field => {
        if (field.error){
            if (field.inputElement){
                field.inputElement.classList.add("is-invalid")
            }
            if (field.errorElement){
                field.errorElement.innerHTML = field.error
            }
            return null
        }
        const currentLength = field.inputElement.value.trim().length
        if (field.min_length && field.min_length > currentLength){
            validationStatus = false
            field.inputElement.classList.add("is-invalid")
            if (field.errorElement){
                field.errorElement.innerHTML = currentLength === 0 ? "Поле не может быть пустым" :
                    `Длина поля не может быть менее ${field.min_length} символов<br>У вас ${currentLength}`
            }
            return null
        }
        if (field.max_length && field.max_length < currentLength){
            validationStatus = false
            field.inputElement.classList.add("is-invalid")
            if (field.errorElement){
                field.errorElement.innerHTML = `Длина поля не может превышать ${field.max_length} символов<br>У вас ${currentLength}`
            }
            return null
        }
    })

    return validationStatus
}

function universalFileValidator(file){
    const splitFileName = file.name.split(".")
    if (splitFileName.length < 2){
        return false
    }
    const fileExtension = splitFileName[splitFileName.length - 1]
    let result = false
    Object.keys(supportedExtensions).forEach(fileType => {
        if (supportedExtensions[fileType].includes(fileExtension.toLowerCase())){
            result = fileType
        }
    })
    return result
}