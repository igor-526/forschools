async function getLevels(){
    await fetch('/api/v1/users/levels')
        .then(async response => await response.json())
        .then(set => levelsSet = set)
}

async function getMaterialCategories(){
    await fetch('/api/v1/materials/category')
        .then(async response => await response.json())
        .then(set => materialCategoriesSet = set)
}

async function getLearningPrograms(){
    await fetch('/api/v1/users/programs')
        .then(async response => await response.json())
        .then(set => learningProgramsSet = set)
}

async function getEngagementChannels(){
    await fetch('/api/v1/users/engagement_channels')
        .then(async response => await response.json())
        .then(set => engagementChannelsSet = set)
}

async function getLessonPlaces(){
    await fetch('/api/v1/lessons/places')
        .then(async response => await response.json())
        .then(set => lessonPlacesSet = set)
}

function setLevels(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Уровень</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = ''
    levelsSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-trash-can"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-pen-to-square"></i></button>
                                </td>
        `)
    })
}

function setMaterialCategories(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Категория</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = ''
    materialCategoriesSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-trash-can"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-pen-to-square"></i></button>
                                </td>
        `)
    })
}

function setLearningPrograms(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Программа обучения</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = ''
    learningProgramsSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-trash-can"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-pen-to-square"></i></button>
                                </td>
        `)
    })
}

function setEngagementChannels(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Канал привлечения</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = ''
    engagementChannelsSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-trash-can"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-pen-to-square"></i></button>
                                </td>
        `)
    })
}

function setLessonPlaces(){
    tableHead.innerHTML = `<tr>
                        <th scope="col">Название</th>
                        <th scope="col">Ссылка</th>
                        <th scope="col">Действие</th></tr>`
    tableBody.innerHTML = ''
    lessonPlacesSet.map(function (item) {
        tableBody.insertAdjacentHTML("beforeend", `
                                <td>${item.name}</td>
                                <td>${item.url}</td>
                                <td>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-trash-can"></i></button>
                                <button type="button" class="btn btn-primary" id="TableButtonDownload">
                                <i class="fa-regular fa-pen-to-square"></i></button>
                                </td>
        `)
    })
}

async function main(){
    await getLevels()
    await getMaterialCategories()
    await getLearningPrograms()
    await getEngagementChannels()
    await getLessonPlaces()
    tabLevels.addEventListener('click', setLevels)
    tabMaterialCategories.addEventListener('click', setMaterialCategories)
    tabLearningPrograms.addEventListener('click', setLearningPrograms)
    tabEngagementChannels.addEventListener('click', setEngagementChannels)
    tabPlaces.addEventListener('click', setLessonPlaces)
    setLevels()
}

//Collections Sets
let levelsSet
let materialCategoriesSet
let learningProgramsSet
let engagementChannelsSet
let lessonPlacesSet

//Tabs
const tabLevels = document.querySelector("#CollectionsTabLevels")
const tabMaterialCategories = document.querySelector("#CollectionsTabMaterialCategories")
const tabLearningPrograms = document.querySelector("#CollectionsTabLearningPrograms")
const tabEngagementChannels = document.querySelector("#CollectionsTabEngagementChannels")
const tabPlaces = document.querySelector("#CollectionsTabPlaces")

//Table
const tableHead = document.querySelector("#CollectionsTableHead")
const tableBody = document.querySelector("#CollectionsTableBody")

main()