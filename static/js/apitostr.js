async function APIGetToObject(request){

    console.log(request.status)
    const data = await request.json()
    console.log(data)

    if (request.status === 200){
        return {status: 200,
            response: await request.json()}
    } else {
        return {status: request.status}
    }
}

async function APIPostPatchToObject(request){

    console.log(request.status)
    const data = await request.json()
    console.log(data)

    return {status: request.status,
        response: await request.json()}
}

async function APIDeleteToObject(request){

    console.log(request.status)
    const data = await request.json()
    console.log(data)

    return {status: request.status}
}