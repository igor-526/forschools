async function APIGetToObject(request){
    return {status: request.status,
        response: await request.json()}
}

async function APIPostPatchToObject(request){
    return {status: request.status,
        response: await request.json()}
}

async function APIDeleteToObject(request){
    return {status: request.status}
}