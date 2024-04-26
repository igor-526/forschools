async function getLessonPlaces(){
    await fetch('/api/v1/collections/lesson_places')
        .then(async response => await response.json())
        .then(set => lessonPlacesSet = set)
}

function setLessonPlaces(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Название</th>
                        <th scope="col">Ссылка</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = '<td>Добавить место проведения урока</td><td></td><td><button type="button" class="btn btn-primary" id="TableButtonLessonPlaceAdd" data-col-id="0"><i class="bi bi-plus-lg"></i></button></td>'
    lessonPlacesSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>${item.url}</td>
                                <td>
                                <button type="button" class="btn btn-danger" id="TableButtonLessonPlaceDelete" data-col-id="${item.id}">
                                <i class="bi bi-trash3"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonLessonPlaceEdit" data-col-id="${item.id}">
                                <i class="bi bi-pencil"></i></button>
                                </td>
        `)
    })
    tableBody.querySelectorAll("#TableButtonLessonPlaceDelete").forEach(function (button) {
        button.addEventListener("click", deleteLessonPlaceModal)
    })

    tableBody.querySelectorAll("#TableButtonLessonPlaceEdit").forEach(function (button) {
        button.addEventListener("click", editLessonPlaceModal)
    })
    tableBody.querySelector("#TableButtonLessonPlaceAdd").addEventListener("click", addLessonPlaceModal)
}

function editLessonPlaceModal(){
    modalEditPlaceLabel.innerHTML = "Место проведения урока"
    modalEditPlaceNameHelp.innerHTML = "Наименование места для проведения урока. Должно быть уникальным"
    modalEditPlaceURLHelp.innerHTML = "Ссылка на урок. У учеников и преподаавтелей есть доступ к ссылке на платформе и по напоминанию в Telegram. Должна быть уникальной"
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = lessonPlacesSet.find(i => i.id === Number(colID))
    modalEditPlaceNameField.value = colObj.name
    modalEditPlaceURLField.value = colObj.url
    bsModalEditPlace.show()
    modalEditPlaceSaveButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalEditPlaceSaveButton.attributes.getNamedItem("data-col-name").value = "lessonPlace"
}

function deleteLessonPlaceModal(){
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = lessonPlacesSet.find(i => i.id === Number(colID))
    modalDeleteBody.innerHTML = `
    Внимание! Вы собираетесь удалить место "${colObj.name}"<br>
    Это действие необратимо. Вы уверены?
    `
    bsModalDelete.show()
    modalDeleteButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalDeleteButton.attributes.getNamedItem("data-col-name").value = "lessonPlace"
}

function addLessonPlaceModal(){
    modalEditPlaceLabel.innerHTML = "Место проведения урока"
    modalEditPlaceNameHelp.innerHTML = "Наименование места для проведения урока. Должно быть уникальным"
    modalEditPlaceURLHelp.innerHTML = "Ссылка на урок. У учеников и преподаавтелей есть доступ к ссылке на платформе и по напоминанию в Telegram. Должна быть уникальной"
    modalEditPlaceNameField.value = ""
    modalEditPlaceURLField.value = ""
    bsModalEditPlace.show()
    modalEditPlaceSaveButton.attributes.getNamedItem("data-col-id").value = "0"
    modalEditPlaceSaveButton.attributes.getNamedItem("data-col-name").value = "lessonPlace"
}

async function addLessonPlace(){
    const response = await fetch(`/api/v1/collections/lesson_places/`, {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditPlaceForm)
    })
    if (response.status === 201){
        bsModalEditPlace.hide()
        showToast("Место проведения урока", "Место проведения урока успешно добавлено")
        await getLessonPlaces()
        setLessonPlaces()
    } else {
        bsModalEditPlace.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function editLessonPlace(colID){
    const response = await fetch(`/api/v1/collections/lesson_places/${colID}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditPlaceForm)
    })
    if (response.status === 200){
        bsModalEditPlace.hide()
        showToast("Место проведения урока", "Место проведения урока успешно изменено")
        await getLessonPlaces()
        setLessonPlaces()
    } else {
        bsModalEditPlace.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function deleteLessonPlace(colID){
    const response = await fetch(`/api/v1/collections/lesson_places/${colID}`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    if (response.status === 204){
        bsModalDelete.hide()
        showToast("Место проведения урока", "Место проведения урока успешно удалено")
        await getLessonPlaces()
        setLessonPlaces()
    } else {
        bsModalDelete.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}