import {Button} from "antd";
import type {LessonPlaceResponseType, RenderLessonPlacePopoverContentType} from "../../types/lessonsTypes.ts";

const renderLessonPlacePopoverContent: RenderLessonPlacePopoverContentType = (placeData: LessonPlaceResponseType) => {
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

export default renderLessonPlacePopoverContent