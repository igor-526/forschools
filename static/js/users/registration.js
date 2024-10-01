function usersRegistrationMain(){
    usersAdminRegisterButton.addEventListener("click", usersRegistrationSetOffcanvas)
    usersOffcanvasRegisterButton.addEventListener('click', usersRegistrationRegister)
    usersRegistrationSetRolesListeners()
    usersRegistrationSetAutoUsernameListeners()
}

function usersRegistrationSetRolesListeners(){
    if (usersOffcanvasRegisterFormRoleCheckboxAdmin){
        usersOffcanvasRegisterFormRoleCheckboxAdmin.addEventListener("change", function () {
            if (usersOffcanvasRegisterFormRoleCheckboxAdmin.checked){
                if (usersOffcanvasRegisterFormRoleCheckboxListener){
                    usersOffcanvasRegisterFormRoleCheckboxListener.checked = false
                }
            }
        })
    }
    if (usersOffcanvasRegisterFormRoleCheckboxMetodist){
        usersOffcanvasRegisterFormRoleCheckboxMetodist.addEventListener("change", function () {
            if (usersOffcanvasRegisterFormRoleCheckboxMetodist.checked){
                if (usersOffcanvasRegisterFormRoleCheckboxListener){
                    usersOffcanvasRegisterFormRoleCheckboxListener.checked = false
                }
            }
        })
    }
    if (usersOffcanvasRegisterFormRoleCheckboxTeacher){
        usersOffcanvasRegisterFormRoleCheckboxTeacher.addEventListener("change", function () {
            if (usersOffcanvasRegisterFormRoleCheckboxTeacher.checked){
                if (usersOffcanvasRegisterFormRoleCheckboxListener){
                    usersOffcanvasRegisterFormRoleCheckboxListener.checked = false
                }
            }
        })
    }
    if (usersOffcanvasRegisterFormRoleCheckboxListener){
        usersOffcanvasRegisterFormRoleCheckboxListener.addEventListener("change", function () {
            if (usersOffcanvasRegisterFormRoleCheckboxListener.checked){
                if (usersOffcanvasRegisterFormRoleCheckboxAdmin){
                    usersOffcanvasRegisterFormRoleCheckboxAdmin.checked = false
                }
                if (usersOffcanvasRegisterFormRoleCheckboxTeacher){
                    usersOffcanvasRegisterFormRoleCheckboxTeacher.checked = false
                }
                if (usersOffcanvasRegisterFormRoleCheckboxMetodist){
                    usersOffcanvasRegisterFormRoleCheckboxMetodist.checked = false
                }
            }
        })
    }
}

function usersRegistrationSetAutoUsernameListeners(){
    function removeNonEnglish(str) {
        let result = '';
        for (let i = 0; i < str.length; i++) {
            if ((str.charCodeAt(i) >= 'a'.charCodeAt() && str.charCodeAt(i) <= 'z'.charCodeAt()) ||
                (str.charCodeAt(i) >= 'A'.charCodeAt() && str.charCodeAt(i) <= 'Z'.charCodeAt())) {
                result += str[i];
            } else if (str[i] === '.') {
                result += '.';
            }
        }
        return result;
    }

    function setUsername(){
        let fnTranslit = null
        let lnTranslit = null
        let un = ""
        let unReady = ""
        if (usersOffcanvasRegisterFormLastNameField.value.trim() !== ""){
            lnTranslit = transliterate(usersOffcanvasRegisterFormLastNameField.value)
        }
        if (usersOffcanvasRegisterFormFirstNameField.value.trim() !== ""){
            fnTranslit = transliterate(usersOffcanvasRegisterFormFirstNameField.value)
        }
        if (fnTranslit && lnTranslit){
            un = `${fnTranslit[0]}.${lnTranslit}`
        } else {
            if (fnTranslit){
                un = fnTranslit
            }
            if (lnTranslit){
                un = lnTranslit
            }
        }
        for (let i = 0; i < un.length; i++) {
            if ((un.charCodeAt(i) >= 'a'.charCodeAt(0) && un.charCodeAt(i) <= 'z'.charCodeAt(0)) ||
                (un.charCodeAt(i) >= 'A'.charCodeAt(0) && un.charCodeAt(i) <= 'Z'.charCodeAt(0))) {
                unReady += un[i];
            } else if (un[i] === '.') {
                unReady += '.';
            }
        }
        usersOffcanvasRegisterFormUsernameField.value = unReady
    }

    usersOffcanvasRegisterFormLastNameField.addEventListener("input", setUsername)
    usersOffcanvasRegisterFormFirstNameField.addEventListener("input", setUsername)
}

function usersRegistrationReset(validationOnly=false){
    function resetValidation() {
        usersOffcanvasRegisterFormLastNameField.classList.remove("is-invalid")
        usersOffcanvasRegisterFormFirstNameField.classList.remove("is-invalid")
        usersOffcanvasRegisterFormPatronymicField.classList.remove("is-invalid")
        usersOffcanvasRegisterFormUsernameField.classList.remove("is-invalid")
        usersOffcanvasRegisterFormPasswordField.classList.remove("is-invalid")
        usersOffcanvasRegisterFormEmailField.classList.remove("is-invalid")
        usersOffcanvasRegisterFormLastNameError.innerHTML = ""
        usersOffcanvasRegisterFormFirstNameError.innerHTML = ""
        usersOffcanvasRegisterFormPatronymicError.innerHTML = ""
        usersOffcanvasRegisterFormUsernameError.innerHTML = ""
        usersOffcanvasRegisterFormPasswordErrors.innerHTML = ""
        usersOffcanvasRegisterFormEmailError.innerHTML = ""
    }

    resetValidation()
    if (!validationOnly){
        usersOffcanvasRegisterForm.reset()
        usersOffcanvasRegisterFormPasswordField.value = generatePassword(8)
    }

}

function usersRegistrationSetOffcanvas(){
    usersRegistrationReset()
    bsUsersOffcanvasRegister.show()
}

function usersRegistrationValidation(errors=null){
    function setInvalid(error="", element=null, errorElement=null){
        if (element){
            element.classList.add("is-invalid")
        }
        if (errorElement){
            errorElement.innerHTML = error
        }
        validationStatus = false
    }

    function validateLastName(error=null){
        if (error){
            setInvalid(
                error,
                usersOffcanvasRegisterFormLastNameField,
                usersOffcanvasRegisterFormLastNameError
            )
        } else {
            if (usersOffcanvasRegisterFormLastNameField.value.trim() !== ""){
                if (offcanvasUsersEditLastNameField.value.trim().length > 50){
                    setInvalid(
                        "Длина не может превышать 50 символов",
                        usersOffcanvasRegisterFormLastNameField,
                        usersOffcanvasRegisterFormLastNameError
                    )
                } else {
                    const noSpacesRegex = /^[^ ]+$/
                    if (!noSpacesRegex.test(usersOffcanvasRegisterFormLastNameField.value.trim())){
                        setInvalid(
                            "Поле не может содержать пробелов",
                            usersOffcanvasRegisterFormLastNameField,
                            usersOffcanvasRegisterFormLastNameError
                        )
                    }
                }
            } else {
                setInvalid(
                    "Поле не может быть пустым",
                    usersOffcanvasRegisterFormLastNameField,
                    usersOffcanvasRegisterFormLastNameError
                )
            }
        }
    }

    function validateFirstName(error=null){
        if (error){
            setInvalid(
                error,
                usersOffcanvasRegisterFormFirstNameField,
                usersOffcanvasRegisterFormFirstNameError
            )
        } else {
            if (usersOffcanvasRegisterFormFirstNameField.value.trim() !== ""){
                if (usersOffcanvasRegisterFormFirstNameField.value.trim().length > 50){
                    setInvalid(
                        "Длина не может превышать 50 символов",
                        usersOffcanvasRegisterFormFirstNameField,
                        usersOffcanvasRegisterFormFirstNameError
                    )
                } else {
                    const noSpacesRegex = /^[^ ]+$/
                    if (!noSpacesRegex.test(usersOffcanvasRegisterFormFirstNameField.value.trim())){
                        setInvalid(
                            "Поле не может содержать пробелов",
                            usersOffcanvasRegisterFormFirstNameField,
                            usersOffcanvasRegisterFormFirstNameError
                        )
                    }
                }
            } else {
                setInvalid(
                    "Поле не может быть пустым",
                    usersOffcanvasRegisterFormFirstNameField,
                    usersOffcanvasRegisterFormFirstNameError
                )
            }
        }
    }

    function validatePatronymic(error=null){
        if (error){
            setInvalid(
                error,
                usersOffcanvasRegisterFormPatronymicField,
                usersOffcanvasRegisterFormPatronymicError
            )
        } else {
            if (usersOffcanvasRegisterFormPatronymicField.value.trim() !== ""){
                if (offcanvasUsersEditPatronymicField.value.trim().length > 50){
                    setInvalid(
                        "Длина не может превышать 50 символов",
                        usersOffcanvasRegisterFormPatronymicField,
                        usersOffcanvasRegisterFormPatronymicError
                    )
                } else {
                    const noSpacesRegex = /^[^ ]+$/
                    if (!noSpacesRegex.test(usersOffcanvasRegisterFormPatronymicField.value.trim())){
                        setInvalid(
                            "Поле не может содержать пробелов",
                            usersOffcanvasRegisterFormPatronymicField,
                            usersOffcanvasRegisterFormPatronymicError
                        )
                    }
                }
            }
        }
    }

    function validateUsername(error=null){
        if (error){
            setInvalid(
                error,
                usersOffcanvasRegisterFormUsernameField,
                usersOffcanvasRegisterFormUsernameError
            )
        } else {
            if (usersOffcanvasRegisterFormUsernameField.value.trim() !== ""){
                if (usersOffcanvasRegisterFormUsernameField.value.trim().length > 50){
                    setInvalid(
                        "Длина не может превышать 50 символов",
                        usersOffcanvasRegisterFormUsernameField,
                        usersOffcanvasRegisterFormUsernameError
                    )
                } else {
                    const russianLettersRegex = /^[A-Za-z0-9.]+$/
                    if (!russianLettersRegex.test(usersOffcanvasRegisterFormUsernameField.value.trim())){
                        setInvalid(
                            "Поле может содержать только маленькие английские буквы, цифры и точки",
                            usersOffcanvasRegisterFormUsernameField,
                            usersOffcanvasRegisterFormUsernameError
                        )
                    }
                }
            } else {
                setInvalid(
                    "Поле не может быть пустым",
                    usersOffcanvasRegisterFormUsernameField,
                    usersOffcanvasRegisterFormUsernameError
                )
            }
        }
    }

    function validateEmail(error=null){
        if (error){
            setInvalid(
                error,
                usersOffcanvasRegisterFormEmailField,
                usersOffcanvasRegisterFormEmailError
            )
        } else {
            if (usersOffcanvasRegisterFormEmailField.value.trim() !== ""){
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/
                if (!emailRegex.test(usersOffcanvasRegisterFormEmailField.value.trim())){
                    setInvalid(
                        "Проверьте корректность ввода",
                        usersOffcanvasRegisterFormEmailField,
                        usersOffcanvasRegisterFormEmailError
                    )
                }
            }
        }
    }

    function validatePassword(error=null){
        if (error){
            setInvalid(
                error,
                usersOffcanvasRegisterFormPasswordField,
                usersOffcanvasRegisterFormPasswordErrors
            )
        } else {
            if (usersOffcanvasRegisterFormPasswordField.value.trim() === ""){
                setInvalid(
                    "Поле не может быть пустым",
                    usersOffcanvasRegisterFormPasswordField,
                    usersOffcanvasRegisterFormPasswordErrors
                )
            }
        }
    }

    usersRegistrationReset(true)
    let validationStatus = true

    if (errors){
        if (errors.hasOwnProperty("username")) {
            validateUsername(errors.username)
        }
        if (errors.hasOwnProperty("password1")) {
            validatePassword(errors.password1)
        }
        if (errors.hasOwnProperty("password2")) {
            validatePassword(errors.password2)
        }
        if (errors.hasOwnProperty("first_name")) {
            validateFirstName(errors.first_name)
        }
        if (errors.hasOwnProperty("last_name")) {
            validateLastName(errors.last_name)
        }
        if (errors.hasOwnProperty("patronymic")) {
            validatePatronymic(errors.patronymic)
        }
        if (errors.hasOwnProperty("email")) {
            validateEmail(errors.email)
        }
    } else {
        validateLastName()
        validateFirstName()
        validatePatronymic()
        validateUsername()
        validateEmail()
        validatePassword()
    }
    return validationStatus
}

function usersRegistrationRegister(){
    function getFD(){
        const fd = new FormData(usersOffcanvasRegisterForm)
        fd.append("password2", fd.get('password1'))
        const username = fd.get("username")
        const last_name = fd.get("last_name")
        const first_name = fd.get("first_name")
        const patronymic = fd.get("patronymic")
        const email = fd.get("email")
        fd.set("username", username.trim().toLowerCase())
        fd.set("last_name", last_name.trim().replace(/(^\w)/, (match) => match.toUpperCase()))
        fd.set("first_name", first_name.trim().replace(/(^\w)/, (match) => match.toUpperCase()))
        if (patronymic){
            fd.set("patronymic", patronymic.trim().replace(/(^\w)/, (match) => match.toUpperCase()))
        }
        if (email){
            fd.set("username", username.trim().toLowerCase())
        }
        return  fd
    }

    if (usersRegistrationValidation()){
        usersAPIRegistration(getFD()).then(request => {
            switch (request.status){
                case 200:
                    bsUsersOffcanvasRegister.hide()
                    showSuccessToast("Пользователь успешно зарегистрирован")
                    usersAdminGetAll()
                    break
                case 400:
                    console.log(request.response)
                    usersRegistrationValidation(request.response)
                    break
                default:
                    bsUsersOffcanvasRegister.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

//Bootstrap Elements
const usersOffcanvasRegister = document.querySelector("#usersOffcanvasRegister")
const bsUsersOffcanvasRegister = new bootstrap.Offcanvas(usersOffcanvasRegister)

//Form
const usersOffcanvasRegisterForm = usersOffcanvasRegister.querySelector("#usersOffcanvasRegisterForm")
const usersOffcanvasRegisterFormLastNameField = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormLastNameField")
const usersOffcanvasRegisterFormFirstNameField = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormFirstNameField")
const usersOffcanvasRegisterFormPatronymicField = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormPatronymicField")
const usersOffcanvasRegisterFormUsernameField = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormUsernameField")
const usersOffcanvasRegisterFormPasswordField = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormPasswordField")
const usersOffcanvasRegisterFormEmailField = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormEmailField")
const usersOffcanvasRegisterFormRoleCheckboxAdmin = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormRoleCheckboxAdmin")
const usersOffcanvasRegisterFormRoleCheckboxMetodist = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormRoleCheckboxMetodist")
const usersOffcanvasRegisterFormRoleCheckboxTeacher = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormRoleCheckboxTeacher")
const usersOffcanvasRegisterFormRoleCheckboxListener = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormRoleCheckboxListener")
const usersOffcanvasRegisterFormLastNameError = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormLastNameError")
const usersOffcanvasRegisterFormFirstNameError = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormFirstNameError")
const usersOffcanvasRegisterFormPatronymicError = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormPatronymicError")
const usersOffcanvasRegisterFormUsernameError = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormUsernameError")
const usersOffcanvasRegisterFormPasswordErrors = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormPasswordErrors")
const usersOffcanvasRegisterFormEmailError = usersOffcanvasRegisterForm.querySelector("#usersOffcanvasRegisterFormEmailError")

//Buttons
const usersAdminRegisterButton = document.querySelector("#usersAdminRegisterButton")
const usersOffcanvasRegisterButton = usersOffcanvasRegister.querySelector("#usersOffcanvasRegisterButton")

usersRegistrationMain()