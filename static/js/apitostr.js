async function APIGetToObject(request){
    if (request.status === 200){
        return {status: 200,
            response: await request.json()}
    } else {
        return {status: request.status}
    }
}

async function APIPatchToObject(request){
    return {status: request.status,
        response: await request.json()}
}