async function lessonItemReplaceMain(){
    await lessonItemReplaceGetTeachers()
    lessonItemReplaceShowTeachers()
    if (lessonItemReplaceTeacherButton){
        lessonItemReplaceTeacherButton.addEventListener("click", lessonItemReplaceReset)
    }
    lessonItemReplaceTeacherModalSearchField.addEventListener("input", lessonItemReplaceSearchTeachers)
    lessonItemReplaceTeacherModalSaveButton.addEventListener("click", lessonItemReplaceSave)
}

async function lessonItemReplaceGetTeachers(){
    const request = await usersAPIGetTeachers()
    if (request.status === 200){
        teachersArray = request.response
    }
}

function lessonItemReplaceShowTeachers(list = teachersArray){
    lessonItemReplaceTeacherModalList.innerHTML = ""
    list.map(teacher => {
        if (teacher.id === Number(selectedTeacher)){
            lessonItemReplaceTeacherModalList.insertAdjacentHTML("beforeend", `
            <a href="#" class="list-group-item list-group-item-action active" data-teacher-id="${teacher.id}">${teacher.first_name} ${teacher.last_name}</a>
            `)
        } else {
            lessonItemReplaceTeacherModalList.insertAdjacentHTML("beforeend", `
            <a href="#" class="list-group-item list-group-item-action" data-teacher-id="${teacher.id}">${teacher.first_name} ${teacher.last_name}</a>
            `)
        }
    })
    lessonItemReplaceTeacherModalList.querySelectorAll(".list-group-item")
        .forEach(teacherListItem => {
            teacherListItem.addEventListener("click", function () {
                const teacherID = teacherListItem.attributes.getNamedItem("data-teacher-id").value
                lessonItemReplaceSelectTeacher(teacherID)
            })
        })
}

function lessonItemReplaceSelectTeacher(teacherID) {
    switch (selectedTeacher) {
        case 0:
            lessonItemReplaceTeacherModalList.querySelector(`[data-teacher-id="${teacherID}"]`)
                .classList.add("active")
            selectedTeacher = teacherID
            lessonItemReplaceTeacherModalSaveButton.disabled = false
            break
        case teacherID:
            lessonItemReplaceTeacherModalList.querySelector(`[data-teacher-id="${teacherID}"]`)
                .classList.remove("active")
            selectedTeacher = 0
            lessonItemReplaceTeacherModalSaveButton.disabled = true
            break
        default:
            lessonItemReplaceTeacherModalList.querySelector(`[data-teacher-id="${teacherID}"]`)
                .classList.add("active")
            const selected = lessonItemReplaceTeacherModalList.querySelector(`[data-teacher-id="${selectedTeacher}"]`)
            if (selected){
                selected.classList.remove("active")
            }
            selectedTeacher = teacherID
            lessonItemReplaceTeacherModalSaveButton.disabled = false
            break
    }
}

function lessonItemReplaceReset() {
    lessonItemReplaceTeacherModalList.querySelectorAll(".list-group-item")
        .forEach(teacherListItem => {
            teacherListItem.classList.remove("active")
        })
    lessonItemReplaceTeacherModalSaveButton.disabled = false
    lessonItemReplaceTeacherModalSearchField.value = ""
    selectedTeacher = 0
}

function lessonItemReplaceFilterTeachers(teacher, q){
    const query = RegExp(q.toLowerCase())
    return query.test(teacher.first_name) || query.test(teacher.last_name)
}

function lessonItemReplaceSearchTeachers() {
    const query = lessonItemReplaceTeacherModalSearchField.value
    if (query !== ""){
        teachersFilteredArray = teachersArray.filter(teacher => lessonItemReplaceFilterTeachers(teacher, query))
        lessonItemReplaceShowTeachers(teachersFilteredArray)
    } else {
        lessonItemReplaceShowTeachers(teachersArray)
    }
}

async function lessonItemReplaceSave(){
    let request
    switch (replaceAction) {
        case "lesson":
            request = await lessonsAPIReplaceTeacher(selectedTeacher, lessonID)
            if (request.status === 200){
                bsLessonItemReplaceTeacherModal.hide()
                showToast("Успешно", "Преподаватель заменён успешно")
                lessonItemReplaceReset()
            } else {
                bsLessonItemReplaceTeacherModal.hide()
                showToast("Ошибка", request.response.error)
                lessonItemReplaceReset()
            }
            break
        case "homework":
            request = await homeworkAPIReplaceTeacher(selectedTeacher, hwID)
            if (request.status === 200){
                bsLessonItemReplaceTeacherModal.hide()
                showToast("Успешно", "Преподаватель заменён успешно")
                lessonItemReplaceReset()
            } else {
                bsLessonItemReplaceTeacherModal.hide()
                showToast("Ошибка", request.response.error)
                lessonItemReplaceReset()
            }
            break
    }
}


//Arrays
let teachersArray = []
let teachersFilteredArray = []
let selectedTeacher = 0

//Lesson Item Page Buttons
const lessonItemReplaceTeacherButton = document.querySelector("#LessonItemReplaceTeacherButton")

//Bootstrap Elements
const lessonItemReplaceTeacherModal = document.querySelector("#LessonItemReplaceTeacherModal")
const bsLessonItemReplaceTeacherModal = new bootstrap.Modal(lessonItemReplaceTeacherModal)

//Modal
const lessonItemReplaceTeacherModalSearchField = lessonItemReplaceTeacherModal.querySelector("#LessonItemReplaceTeacherModalSearchField")
const lessonItemReplaceTeacherModalList = lessonItemReplaceTeacherModal.querySelector("#LessonItemReplaceTeacherModalList")
const lessonItemReplaceTeacherModalSaveButton = lessonItemReplaceTeacherModal.querySelector("#LessonItemReplaceTeacherModalSaveButton")

lessonItemReplaceMain()