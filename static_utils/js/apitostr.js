async function APIGetToObject(request){
    if (request.status !== 500){
        return {
            status: request.status,
            response: await request.json()
        }
    } else {
        return {status: 500}
    }

}

async function APIPostPatchToObject(request){
    if (request.status !== 500){
        return {
            status: request.status,
            response: await request.json()
        }
    } else {
        return {status: 500}
    }
}

async function APIDeleteToObject(request){
    return {status: request.status}
}