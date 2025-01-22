async function getEngagementChannels(){
    await fetch('/api/v1/collections/eng_channels')
        .then(async response => await response.json())
        .then(set => engagementChannelsSet = set)
}

function setEngagementChannels(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Канал привлечения</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = '<td>Добавить канал привлечения</td><td><button type="button" class="btn btn-primary" id="TableButtonEngChannelAdd" data-col-id="0"><i class="bi bi-plus-lg"></i></button></td>'
    engagementChannelsSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-danger" id="TableButtonEngChannelDelete" data-col-id="${item.id}">
                                <i class="bi bi-trash3"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonEngChannelEdit" data-col-id="${item.id}">
                                <i class="bi bi-pencil"></i></button>
                                </td>
        `)
    })
    tableBody.querySelectorAll("#TableButtonEngChannelDelete").forEach(function (button) {
        button.addEventListener("click", deleteEngChannelModal)
    })

    tableBody.querySelectorAll("#TableButtonEngChannelEdit").forEach(function (button) {
        button.addEventListener("click", editEngChannelModal)
    })
        tableBody.querySelector("#TableButtonEngChannelAdd").addEventListener("click", addEngChannelModal)
}

function editEngChannelModal(){
    modalEditNameLabel.innerHTML = "Канал привлечения"
    modalEditNameNameHelp.innerHTML = "Наименование канала привлечения. Должно быть уникальным"
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = engagementChannelsSet.find(i => i.id === Number(colID))
    modalEditNameNameField.value = colObj.name
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "engChannel"
}

function deleteEngChannelModal(){
    const colID = this.attributes.getNamedItem("data-col-id").value
    const colObj = engagementChannelsSet.find(i => i.id === Number(colID))
    modalDeleteBody.innerHTML = `
    Внимание! Вы собираетесь удалить канал привлечения "${colObj.name}"<br>
    Это действие необратимо. Вы уверены?
    `
    bsModalDelete.show()
    modalDeleteButton.attributes.getNamedItem("data-col-id").value = this
        .attributes.getNamedItem("data-col-id").value
    modalDeleteButton.attributes.getNamedItem("data-col-name").value = "engChannel"
}

function addEngChannelModal(){
    modalEditNameLabel.innerHTML = "Уровень"
    modalEditNameNameHelp.innerHTML = "Наименование уровня для ученика/преподавателя. Должно быть уникальным"
    modalEditNameNameField.value = ""
    bsModalEditName.show()
    modalEditNameSaveButton.attributes.getNamedItem("data-col-id").value = "0"
    modalEditNameSaveButton.attributes.getNamedItem("data-col-name").value = "engChannel"
}

async function addEngChannel(){
    const response = await fetch(`/api/v1/collections/eng_channels/`, {
        method: 'post',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 201){
        bsModalEditName.hide()
        showToast("Канал привлечения", "Канал привлечения успешно добавлен")
        await getEngagementChannels()
        setEngagementChannels()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function editEngChannel(colID){
    const response = await fetch(`/api/v1/collections/eng_channels/${colID}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: new FormData(modalEditNameForm)
    })
    if (response.status === 200){
        bsModalEditName.hide()
        showToast("Канал привлечения", "Канал привлечения успешно изменён")
        await getEngagementChannels()
        setEngagementChannels()
    } else {
        bsModalEditName.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}

async function deleteEngChannel(colID){
    const response = await fetch(`/api/v1/collections/eng_channels/${colID}`, {
        method: 'delete',
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
    })
    if (response.status === 204){
        bsModalDelete.hide()
        showToast("Канал привлечения", "Канал привлечения успешно удалён")
        await getEngagementChannels()
        setEngagementChannels()
    } else {
        bsModalDelete.hide()
        showToast("Ошибка", "На сервере произошла ошибка. Попробуйте обновить страницу или позже")
    }
}