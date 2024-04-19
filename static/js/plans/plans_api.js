async function plansGet(){
    const request = await fetch("/api/v1/learning_plans/")
    if (request.status === 200){
        return {status: 200,
            response: await request.json()}
    } else {
        return {status: request.status}
    }
}

async function planItemGetPhases() {
    const request = await fetch(`/api/v1/learning_plans/${planID}/phases/`)
    if (request.status === 200){
        return {status: 200,
            response: await request.json()}
    } else {
        return {status: request.status}
    }
}