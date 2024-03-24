[modalEditNameSaveButton, modalEditPlaceSaveButton].forEach(function (button) {
    button.addEventListener("click", function (){
        const colName = this.attributes.getNamedItem("data-col-name").value
        const colID = button.attributes.getNamedItem("data-col-id").value
        switch (colName){
            case "level":
                if (colID === "0"){
                    addLevel()
                } else {
                    editLevel(colID)
                }
                break
            case "matCat":
                if (colID === "0"){
                    addMatCat()
                } else {
                    editMatCat(colID)
                }
                break
            case "matLevel":
                if (colID === "0"){
                    addMatLevel()
                } else {
                    editMatLevel(colID)
                }
                break
            case "learnProg":
                if (colID === "0"){
                    addLearnProg()
                } else {
                    editLearnProg(colID)
                }
                break
            case "engChannel":
                if (colID === "0"){
                    addEngChannel()
                } else {
                    editEngChannel(colID)
                }
                break
            case "lessonPlace":
                if (colID === "0"){
                    addLessonPlace()
                } else {
                    editLessonPlace(colID)
                }
                break
            default:
                break
        }
    })
})

modalDeleteButton.addEventListener("click", function () {
    const colName = this.attributes.getNamedItem("data-col-name").value
    const colID = this.attributes.getNamedItem("data-col-id").value
    switch (colName){
        case "level":
            deleteLevel(colID)
            break
        case "matCat":
            deleteMatCat(colID)
            break
        case "matLevel":
            deleteMatLevel(colID)
            break
        case "learnProg":
            deleteLearnProg(colID)
            break
        case "engChannel":
            deleteEngChannel(colID)
            break
        case "lessonPlace":
            deleteLessonPlace(colID)
            break
        default:
            break
    }
})