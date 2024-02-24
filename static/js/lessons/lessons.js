async function setTeachersListenersPlaces(){
    const respTeachers = await fetch("/api/v1/users?group=teachers")
    const respListeners = await fetch("/api/v1/users?group=listeners")
    const respPlaces = await fetch("/api/v1/lessons/places")
    formNewLessonTeacherOptions.innerHTML = ''
    formNewLessonListenerOptions.innerHTML = ''
    formNewLessonPlaceSelect.innerHTML = '<option value="new">Новое место</option>'
    formNewLessonPlaceSelect.addEventListener('change', function () {
        if (formNewLessonPlaceSelect.value === "new"){
            formNewLessonPlaceNewFieldset.classList.remove("d-none")
        } else {
            formNewLessonPlaceNewFieldset.classList.add("d-none")
        }
    })
    await respTeachers.json().then(content => content.map(function (teacher){
        formNewLessonTeacherOptions.innerHTML += `<option value="${teacher.first_name} ${teacher.last_name}">`
        teachers.push(`${teacher.first_name} ${teacher.last_name}`)
    }))
    await respListeners.json().then(content => content.map(function (listener) {
        formNewLessonListenerOptions.innerHTML += `<option value="${listener.first_name} ${listener.last_name}">`
        listeners.push(`${listener.first_name} ${listener.last_name}`)
    }))
    const places = await respPlaces.json()
    if (places.length === 0) {
        formNewLessonPlaceNewFieldset.classList.remove("d-none")
    }
    places.map(function (place) {
        console.log(place)
    })
}

async function main(){
    await getLessons()
    await setTeachersListenersPlaces()
    formNewLessonButtonSave.addEventListener('click', createLesson)
}

function formNewClientValidation() {
    formNewLessonNameField.classList.remove("is-invalid")
    formNewLessonTeacherField.classList.remove("is-invalid")
    formNewLessonListenerField.classList.remove("is-invalid")
    formNewLessonDateField.classList.remove("is-invalid")
    formNewLessonStartField.classList.remove("is-invalid")
    formNewLessonEndField.classList.remove("is-invalid")
    formNewLessonDateError.innerHTML = ""
    formNewLessonStartError.innerHTML = ""
    formNewLessonEndError.innerHTML = ""
    formNewLessonNameError.innerHTML = ""
    formNewLessonTeacherError.innerHTML = ""
    formNewLessonListenerError.innerHTML = ""
    let validationStatus = true
    if (formNewLessonNameField.value === ""){
        formNewLessonNameField.classList.add("is-invalid")
        formNewLessonNameError.innerHTML = "Поле не может быть пустым"
        validationStatus = false}
    if (formNewLessonTeacherField.value === "") {
        formNewLessonTeacherField.classList.add("is-invalid")
        formNewLessonTeacherError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    } else if (!teachers.includes(formNewLessonTeacherField.value)) {
        formNewLessonTeacherField.classList.add("is-invalid")
        formNewLessonTeacherError.innerHTML = "Преподаватель не найден. Начните вводить и выберите из списка"
        validationStatus = false}
    if (formNewLessonListenerField.value === "") {
        formNewLessonListenerField.classList.add("is-invalid")
        formNewLessonListenerError.innerHTML = "Поле не может быть пустым"
        validationStatus = false
    } else if (!listeners.includes(formNewLessonListenerField.value)){
        formNewLessonListenerField.classList.add("is-invalid")
        formNewLessonListenerError.innerHTML = "Ученик не найден. Начните вводить и выберите из списка"
        validationStatus = false}
    if (formNewLessonDateField.value === ""){
        formNewLessonDateField.classList.add("is-invalid")
        formNewLessonDateError.innerHTML = "Поле не может быть пустым"
        validationStatus = false}
    if (formNewLessonStartField.value === ""){
        formNewLessonStartField.classList.add("is-invalid")
        formNewLessonStartError.innerHTML = "Поле не может быть пустым"
        validationStatus = false}
    if (formNewLessonEndField.value === ""){
        formNewLessonEndField.classList.add("is-invalid")
        formNewLessonEndError.innerHTML = "Поле не может быть пустым"
        validationStatus = false}
    if (formNewLessonStartField.value !== "" && formNewLessonEndField.value !== "") {
        const startTimeArray = formNewLessonStartField.value.split(":")
        const endTimeArray = formNewLessonEndField.value.split(":")
        const startTime = new Date().setHours(startTimeArray[0], startTimeArray[1], 0)
        const endTime = new Date().setHours(endTimeArray[0], endTimeArray[1], 0)
        if (endTime<startTime){
            formNewLessonEndField.classList.add("is-invalid")
            formNewLessonEndError.innerHTML = "Время окончания не может быть больше или равно времени начала"
            validationStatus = false}
    }
    return validationStatus
}

function formNewServerValidation(errors) {

}

async function createLesson() {
    const validationStatus = formNewClientValidation()
    if (validationStatus){
        let formData = new FormData(formNewLesson)
        let response = await fetch('/api/v1/lessons/', {
            method: "post",
            credentials: 'same-origin',
            headers:{
                "X-CSRFToken": csrftoken,
            },
            body: formData})
        if (response.status === 201){
            bsOffcanvasNewLesson.hide()
            showToast("Урок", "Урок добавлен успешно")
        } else if (response.status === 400){
            formNewServerValidation(await response.json())
        } else {
            bsOffcanvasNewLesson.hide()
            showToast("Урок", "На сервере произошла ошибка. Попробуйте обновить страницу и попробовать ещё раз")
        }
    }
}

async function getLessons(){
    tableBody.innerHTML = ''
    const response = await fetch("/api/v1/lessons")
    await response.json().then(lessons => {
        let key
        for(key in lessons){
            tableBody.insertAdjacentHTML("beforeend", `
            <tr data-material-id="${lessons[key].id}">
                <td style="max-width: 300px;">${lessons[key].name}</td>
                <td>${lessons[key].date}</td>
                <td>${lessons[key].teacher}</td>
                <td>${lessons[key].listener}</td>
                <td>

                </td>
            </tr>
            `)
        }
    })
}



//BootStrap Elements
const bsOffcanvasNewLesson = new bootstrap.Offcanvas(
    document.querySelector("#offcanvasNewLesson"))

//Tabs
const tabUncoming = document.querySelector("#LessonsTabUncoming")
const tabPassed = document.querySelector("#LessonsTabPassed")

//Table
const tableBody = document.querySelector("#LessonTableBody")

//Forms
const formNewLesson = document.querySelector("#formNewLesson")

//FormNewLesson
const formNewLessonNameField = formNewLesson.querySelector("#LessonNewNameField")
const formNewLessonNameError = formNewLesson.querySelector("#LessonNewNameError")
const formNewLessonTeacherField = formNewLesson.querySelector("#LessonNewTeacherField")
const formNewLessonTeacherError = formNewLesson.querySelector("#LessonNewTeacherError")
const formNewLessonTeacherOptions = formNewLesson.querySelector("#LessonNewTeacherOptions")
const formNewLessonListenerField = formNewLesson.querySelector("#LessonNewListenerField")
const formNewLessonListenerError = formNewLesson.querySelector("#LessonNewListenerError")
const formNewLessonListenerOptions = formNewLesson.querySelector("#LessonNewListenerOptions")
const formNewLessonDateField = formNewLesson.querySelector("#LessonNewDateField")
const formNewLessonDateError = formNewLesson.querySelector("#LessonNewDateError")
const formNewLessonStartField = formNewLesson.querySelector("#LessonNewStartField")
const formNewLessonStartError = formNewLesson.querySelector("#LessonNewStartError")
const formNewLessonEndField = formNewLesson.querySelector("#LessonNewEndField")
const formNewLessonEndError = formNewLesson.querySelector("#LessonNewEndError")
const formNewLessonPlaceSelect = formNewLesson.querySelector("#LessonNewPlaceSelect")
const formNewLessonPlaceNewFieldset = formNewLesson.querySelector("#LessonNewPlaceNewFieldset")
const formNewLessonPlaceNewNameField = formNewLesson.querySelector("#LessonNewPlaceNewNameField")
const formNewLessonPlaceNewNameError = formNewLesson.querySelector("#LessonNewPlaceNewNameError")
const formNewLessonPlaceNewUrlField = formNewLesson.querySelector("#LessonNewPlaceNewUrlField")
const formNewLessonPlaceNewUrlError = formNewLesson.querySelector("#LessonNewPlaceNewUrlError")
const formNewLessonButtonSave = formNewLesson.querySelector("#LessonNewButtonSave")

let teachers = []
let listeners = []
main()
