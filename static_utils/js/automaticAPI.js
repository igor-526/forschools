async function getAutoFieldLearningPlanName(teacherID){
    const request = await fetch(`/api/v1/automatic/learning_plan?teacher=${teacherID}`)
    return APIGetToObject(request)
}

async function getAutoFieldLearningPhaseName(learningPlanID){
    const request = await fetch(`/api/v1/automatic/learning_phase?learning_plan=${learningPlanID}`)
    return APIGetToObject(request)
}

async function getAutoFieldLessonName(phaseID){
    const request = await fetch(`/api/v1/automatic/lesson?learning_phase=${phaseID}`)
    return APIGetToObject(request)
}

async function getAutoFieldHomeworkName(lessonID){
    let request
    if (lessonID === 0){
        request = await fetch(`/api/v1/automatic/homework`)
    } else {
        request = await fetch(`/api/v1/automatic/homework?lesson=${lessonID}`)
    }
    return APIGetToObject(request)
}