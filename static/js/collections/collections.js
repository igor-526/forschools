async function main(){
    await getLevels()
    await getMaterialCategories()
    await getMaterialLevels()
    await getEngagementChannels()
    await getLessonPlaces()
    tabLevels.addEventListener('click', setLevels)
    tabMaterialCategories.addEventListener('click', setMaterialCategories)
    tabEngagementChannels.addEventListener('click', setEngagementChannels)
    tabPlaces.addEventListener('click', setLessonPlaces)
    tabMaterialLevels.addEventListener('click', setMaterialLevels)
    setLevels()
}

//Bootstrap Elements
const modalEditName = document.querySelector("#ModalCollectionEditName")
const bsModalEditName = new bootstrap.Modal(modalEditName)
const modalDelete = document.querySelector("#ModalCollectionDelete")
const bsModalDelete = new bootstrap.Modal(modalDelete)
const modalEditPlace = document.querySelector("#ModalCollectionEditPlace")
const bsModalEditPlace = new bootstrap.Modal(modalEditPlace)

//Collections Sets
let levelsSet
let materialCategoriesSet
let engagementChannelsSet
let lessonPlacesSet
let materialLevelsSet

//Tabs
const tabLevels = document.querySelector("#CollectionsTabLevels")
const tabMaterialCategories = document.querySelector("#CollectionsTabMaterialCategories")
const tabEngagementChannels = document.querySelector("#CollectionsTabEngagementChannels")
const tabPlaces = document.querySelector("#CollectionsTabPlaces")
const tabMaterialLevels = document.querySelector("#CollectionsTabMaterialLevels")

//Table
const tableHead = document.querySelector("#CollectionsTableHead")
const tableBody = document.querySelector("#CollectionsTableBody")

//Modal Edit Name
const modalEditNameForm = modalEditName.querySelector('#ModalCollectionEditNameForm')
const modalEditNameLabel = modalEditName.querySelector('#ModalCollectionEditNameLabel')
const modalEditNameNameField = modalEditName.querySelector('#ModalCollectionEditNameNameField')
const modalEditNameNameHelp = modalEditName.querySelector('#ModalCollectionEditNameNameHelp')
const modalEditNameNameError = modalEditName.querySelector('#ModalCollectionEditNameNameError')
const modalEditNameSaveButton = modalEditName.querySelector('#ModalCollectionEditNameSaveButton')

//Modal Edit Place
const modalEditPlaceForm = modalEditPlace.querySelector("#ModalCollectionEditPlaceForm")
const modalEditPlaceLabel = modalEditPlace.querySelector("#ModalCollectionEditPlaceLabel")
const modalEditPlaceNameField = modalEditPlace.querySelector("#ModalCollectionEditPlaceNameField")
const modalEditPlaceNameHelp = modalEditPlace.querySelector("#ModalCollectionEditPlaceNameHelp")
const modalEditPlaceNameError = modalEditPlace.querySelector("#ModalCollectionEditPlaceNameError")
const modalEditPlaceURLField = modalEditPlace.querySelector("#ModalCollectionEditPlaceURLField")
const modalEditPlaceURLHelp = modalEditPlace.querySelector("#ModalCollectionEditPlaceURLHelp")
const modalEditPlaceURLError = modalEditPlace.querySelector("#ModalCollectionEditPlaceURLError")
const ModalEditPlaceCodeField = modalEditPlace.querySelector("#ModalCollectionEditPlaceCodeField")
const modalEditPlaceSaveButton = modalEditPlace.querySelector("#ModalCollectionEditPlaceSaveButton")

//Modal Delete
const modalDeleteBody = modalDelete.querySelector("#ModalCollectionDeleteBody")
const modalDeleteButton = modalDelete.querySelector("#ModalCollectionDeleteButton")

main()