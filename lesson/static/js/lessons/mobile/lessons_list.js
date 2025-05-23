function lessonsMobileMain(){
    lessonsMobileInitTabs()
    lessonsMobileGet()
    lessonsMobileSetFieldsButton.addEventListener("click", lessonsMobileSetFieldsSetModal)
}

function lessonsMobileInitTabs(){
    lessonsMobileSetAllButton.addEventListener("click", function () {
        lessonsMobileFilterStatus = null
        lessonsMobileSetAllButton.classList.add("active")
        lessonsMobileSetPassedButton.classList.remove("active")
        lessonsMobileGet()
    })
    lessonsMobileSetPassedButton.addEventListener("click", function () {
        lessonsMobileFilterStatus = 1
        lessonsMobileSetAllButton.classList.remove("active")
        lessonsMobileSetPassedButton.classList.add("active")
        lessonsMobileGet()
    })
}

function lessonsMobileGet(more=false){
    lessonsMobileListLoadingSpinner.classList.remove("d-none")
    if (!more && lessonsMobileFilterOffset !== 0){
        lessonsMobileFilterOffset = 0
    }
    if (!more){
        lessonsMobileList.innerHTML = ""
    }
    lessonsAPIGetAll(lessonsMobileFilterOffset, lessonsMobileFilterStatus,
        lessonsMobileFilterTeachersSelected, lessonsMobileFilterListenersSelected,
        lessonsMobileFilterDateStart, lessonsMobileFilterDateEnd,
        lessonsMobileFilterHW, lessonsMobileFilterName,
        lessonsMobileFilterComment, [], false,
        lessonsMobileFilterPlaces).then(request => {
        lessonsMobileListLoadingSpinner.classList.add("d-none")
        switch (request.status){
            case 200:
                lessonsMobileShow(request.response)
                break
            default:
                showErrorToast()
                break
        }
    })
}

function lessonsMobileShow(lessons=[]){
    lessons.forEach(lesson => {
        lessonsMobileList.insertAdjacentElement("beforeend", lessonListGetElement(lesson))
    })
}

const lessonsMobileSetFieldsButton = document.querySelector("#lessonsMobileSetFieldsButton")
const lessonsMobileSetAllButton = document.querySelector("#lessonsMobileSetAllButton")
const lessonsMobileSetPassedButton = document.querySelector("#lessonsMobileSetPassedButton")
const lessonsMobileList = document.querySelector("#lessonsMobileList")
const lessonsMobileListLoadingSpinner = document.querySelector("#lessonsMobileListLoadingSpinner")

//Filters
let lessonsMobileFilterName = null
let lessonsMobileFilterComment = null
const lessonsMobileFilterTeachersSelected = []
const lessonsMobileFilterListenersSelected = []
let lessonsMobileFilterDateStart = null
let lessonsMobileFilterDateEnd = null
const lessonsMobileFilterPlaces = []
let lessonsMobileFilterHW = null
let lessonsMobileFilterStatus = null
let lessonsMobileFilterOffset = 0

lessonsMobileMain()