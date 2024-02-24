async function main(){
    await getMaterials()
    materialsTabGeneral.addEventListener('click', function () {
        getMaterials(2)
        this.classList.add('active')
        materialsTabMy.classList.remove('active')
    })
    materialsTabMy.addEventListener('click', function () {
        getMaterials(1)
        this.classList.add('active')
        materialsTabGeneral.classList.remove('active')
    })
    formMaterialNewSubmitButton.addEventListener('click', createMaterial)
}

async function createMaterial() {
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
        let x = await response.json()
        console.log(x)
    }
}

async function getMaterials(type=2){
    let response = await fetch(`/api/v1/materials?type=${type}`)
    material_set = await response.json()
    showMaterials(material_set)
    await set_category()
}

function showMaterials(list){
    tableBody.innerHTML = ''
    list.map(function (material) {
        const splittedFile = material.file.split('.')
        tableBody.insertAdjacentHTML("beforeend", `
        <tr data-material-id="${material.id}">
            <td style="max-width: 300px;">${material.name}</td>
            <td>Категория 1</td>
            <td>${splittedFile[splittedFile.length - 1]}</td>
            <td>${material.owner.first_name} ${material.owner.last_name}</td>
            <td>
                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                    <i class="fa-solid fa-download"></i></button>
                <button type="button" class="btn btn-primary" id="TableButtonTelegram" data-material-id="${material.id}">
                    <i class="fa-brands fa-telegram"></i></button>
            </td>
        </tr>`)
    })
    const tableButtonTelegram = tableBody.querySelectorAll("#TableButtonTelegram")
    tableButtonTelegram.forEach(button => {
        button.addEventListener('click', function () {
            bsModalTelegram.show()
        })
    })
}

async function set_category(){
    formMaterialNewCategorySelect.innerHTML = '<option value="new">Новая категория</option>'
    formMaterialNewCategorySelect.addEventListener('change', function () {
        if (formMaterialNewCategorySelect.value === 'new'){
            formMaterialNewCategoryField.classList.remove('d-none')
        } else {
            formMaterialNewCategoryField.classList.add('d-none')
        }
    })
    const response = await fetch('/api/v1/materials/category')
    await response.json().then(json => {json.map(function (category) {
        formMaterialNewCategorySelect.innerHTML += `<option value="${category.name}">${category.name}</option>`
    })})
}

//Bootstrap Elements
const bsOffcanvasNewMaterial = new bootstrap
    .Offcanvas(document.querySelector("#offcanvasNewMaterial"))
const bsModalTelegram = new bootstrap
    .Modal(document.querySelector("#modalTelegram"))

//Tabs
const materialsTabGeneral = document.querySelector("#MaterialsTabGeneral")
const materialsTabMy = document.querySelector("#MaterialsTabMy")

//Table
const tableBody = document.querySelector("#MaterialTableBody")
const tableButtonDownload = tableBody.querySelector("#TableButtonDownload")

//Forms
const formNewMaterial = document.querySelector("#formNewMaterial")

//Form New Material
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

let material_set = []
main()