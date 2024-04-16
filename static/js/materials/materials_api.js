async function materialsAPIGetAll(type=2){
    let response = await fetch(`/api/v1/materials?type=${type}`)
    if (response.status === 200) {
        return {status: response.status,
            response: await response.json()}
    } else {
        return {status: response.status,
            response: []}
    }
}
