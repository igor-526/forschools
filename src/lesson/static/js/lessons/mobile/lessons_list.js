function lessonsMobileMain(){
    lessonsMobileInitTabs()
    lessonsMobileGet()
    lessonsMobileSetFieldsButton.addEventListener("click", lessonsMobileSetFieldsSetModal)
    window.addEventListener("scroll", () => {
        if (lessonMobileAutoRequest && (document.body.scrollHeight-window.innerHeight-window.scrollY < 0)){
            lessonMobileAutoRequest = false
            lessonsMobileFilterOffset += 50
            lessonsMobileGet(true)
        }
    })
    const lessonToOpen = getHashValue("open")
    if (lessonToOpen){
        lessonsAPIGetItem(lessonToOpen).then(request => {
            switch (request.status){
                case 200:
                    const lsnUtils = new lessonUtils(request.response)
                    lsnUtils.showOffcanvas()
                    break
                default:
                    const toast = new toastEngine()
                    toast.setError("Занятие не найдено")
                    toast.show()
                    break
            }
        })
    }
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
        lessonsMobileFilterTeachersSelected, lessonsMobileFilterListenersSelected, [],
        lessonsMobileFilterDateStart, lessonsMobileFilterDateEnd,
        lessonsMobileFilterHW, lessonsMobileFilterName,
        lessonsMobileFilterComment, [], false,
        lessonsMobileFilterPlaces).then(request => {
        lessonsMobileListLoadingSpinner.classList.add("d-none")
        switch (request.status){
            case 200:
                console.log(request.response.length)
                lessonMobileAutoRequest = request.response.length === 50
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

let lessonMobileAutoRequest = false
const lessonsMobileSetFieldsButton = document.querySelector("#lessonsMobileSetFieldsButton")
const lessonsMobileSetAllButton = document.querySelector("#lessonsMobileSetAllButton")
const lessonsMobileSetPassedButton = document.querySelector("#lessonsMobileSetPassedButton")
const lessonsMobileList = document.querySelector("#lessonsMobileList")
const lessonsMobileListLoadingSpinner = document.querySelector("#lessonsMobileListLoadingSpinner")

//Filters
let lessonsMobileFilterName = null
let lessonsMobileFilterComment = null
let lessonsMobileFilterTeachersSelected = []
let lessonsMobileFilterListenersSelected = []
let lessonsMobileFilterDateStart = null
let lessonsMobileFilterDateEnd = null
let lessonsMobileFilterPlaces = []
let lessonsMobileFilterHW = null
let lessonsMobileFilterStatus = null
let lessonsMobileFilterOffset = 0

lessonsMobileMain()