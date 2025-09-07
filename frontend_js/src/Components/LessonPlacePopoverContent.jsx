import usersToString from "./Utils/UsersUtils/usersToString.js";
import React from "react";
import {Button} from "antd";

const LessonPlacePopoverContent = ({placeData}) => {
    console.log(placeData);
    return <div style={{ maxWidth: 300 }}>
        <div className="mb-3">
        <Button color="primary" variant="outlined" size="small">
            Перейти
        </Button>
        </div>
        {placeData.conf_id !== null && (
            <p><strong>ID: </strong> {placeData.conf_id}</p>
        )}
        {placeData.access_code !== null && (
            <p><strong>Код: </strong> {placeData.access_code}</p>
        )}
    </div>
}

export default LessonPlacePopoverContent