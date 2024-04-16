async function lessonsAPIAddMaterials(formData, lesson){
    const response = await fetch(`/api/v1/lessons/${lesson}/materials/`, {
        method: "post",
        credentials: 'same-origin',
        headers:{
            "X-CSRFToken": csrftoken,
        },
        body: formData
    })
    if (response.status === 200){
        return {status: 200}
    } else if (response.status === 400) {
        return {status: 400,
            response: await response.json()}
    } else {
        return {status: response.status}
    }
}