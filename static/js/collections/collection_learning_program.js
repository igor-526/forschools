async function getLearningPrograms(){
    await fetch('/api/v1/users/programs')
        .then(async response => await response.json())
        .then(set => learningProgramsSet = set)
}

function setLearningPrograms(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Программа обучения</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = '<td>Добавить программу обучения</td><td><button type="button" class="btn btn-primary" id="TableButtonLearnProgAdd" data-col-id="0"><i class="fa-solid fa-plus"></i></button></td>'
    learningProgramsSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-danger" id="TableButtonLearnProgDelete" data-col-id="${item.id}">
                                <i class="fa-regular fa-trash-can"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonLearnProgEdit" data-col-id="${item.id}">
                                <i class="fa-regular fa-pen-to-square"></i></button>
                                </td>
        `)
    })
    tableBody.querySelectorAll("#TableButtonLearnProgDelete").forEach(function (button) {
        button.addEventListener("click", deleteLearnProgModal)
    })

    tableBody.querySelectorAll("#TableButtonLearnProgEdit").forEach(function (button) {
        button.addEventListener("click", editLearnProgModal)
    })
    tableBody.querySelector("#TableButtonLearnProgAdd").addEventListener("click", addLearnProgModal)
}

function editLearnProgModal(){
    modalEditNameLabel.innerHTML = "Программа обучения"
    modalEditNameNameHelp.innerHTML = "Наименование программы обучения. Должно быть уникальным"
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = learningProgramsSet.find(i => i.id === Number(colID))
    modalEditNameNameField.value = colObj.name
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "learnProg"
}

function deleteLearnProgModal(){
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = learningProgramsSet.find(i => i.id === Number(colID))
    modalDeleteBody.innerHTML = `
    Внимание! Вы собираетесь удалить программу обучения "${colObj.name}"<br>
    Это действие необратимо. Вы уверены?
    `
    bsModalDelete.show()
    modalDeleteButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalDeleteButton.attributes.getNamedItem("data-col-name").value = "learnProg"
}

function addLearnProgModal(){
    modalEditNameLabel.innerHTML = "Уровень"
    modalEditNameNameHelp.innerHTML = "Наименование уровня для ученика/преподавателя. Должно быть уникальным"
    modalEditNameNameField.value = ""
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = "0"
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "learnProg"
}

async function addLearnProg(){
    const response = await fetch(`/api/v1/collections/learn_progs/`, {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 201){
        bsModalEditName.hide()
        showToast("Программа обучения", "Программа обучения успешно добавлена")
        await getLearningPrograms()
        setLearningPrograms()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function editLearnProg(colID){
    const response = await fetch(`/api/v1/collections/learn_progs/${colID}`, {
        method: 'patch',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 200){
        bsModalEditName.hide()
        showToast("Программа обучения", "Программа обучения успешно изменена")
        await getLearningPrograms()
        setLearningPrograms()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function deleteLearnProg(colID){
    const response = await fetch(`/api/v1/collections/learn_progs/${colID}`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    if (response.status === 204){
        bsModalDelete.hide()
        showToast("Программа обучения", "Программа обучения успешно удалена")
        await getLearningPrograms()
        setLearningPrograms()
    } else {
        bsModalDelete.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}