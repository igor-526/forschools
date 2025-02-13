function homeworkListFilterMAMain(){
    homeworkListFilterMAFieldsListener()
    homeworkListFilterMAMainEraseListener()
}

function homeworkListFilterMAFieldsListener(){
    homeworkListMAFilterName.addEventListener("input", function (){
        if (homeworkListMAFilterName.value.trim() !== ""){
            homeworkListMAFiltersName = homeworkListMAFilterName.value.trim()
        } else {
            homeworkListMAFiltersName = null
        }
        homeworkListMAGet()
    })
}

function homeworkListFilterMAMainEraseListener(){
    function eraseName(){
        homeworkListMAFilterName.value = ""
        homeworkListMAFiltersName = null
    }

    homeworkListMAFilterNameErase.addEventListener("click", function () {
        eraseName()
        homeworkListMAGet()
    })
}

const homeworkListMAFiltersButton = homeworkListMATabs.querySelector("#homeworkListMAFiltersButton")
const homeworkListMAFilterName = document.querySelector("#homeworkListMAFilterName")
const homeworkListMAFilterNameErase = document.querySelector("#homeworkListMAFilterNameErase")

homeworkListFilterMAMain()