import type {FiltersBaseType} from "../../types/filterBaseTypes.ts";
import {Radio} from "antd";
import type {GetFilterLessonHomeworksElementType} from "../../types/filterLessonHomeworksTypes.ts";

const LessonHomeworksFilter: GetFilterLessonHomeworksElementType = ({ filters, setFilters, filterHasHWKey }) => {
    return (
        <div style={{ padding: 8 }}>
            <Radio.Group
                options={[
                    { label: 'Все', value: undefined },
                    { label: 'С ДЗ', value: 'true' },
                    { label: 'Без ДЗ', value: 'false' },
                ]}
                onChange={(e) => {
                    setFilters((prevState: FiltersBaseType) => ({
                        ...prevState,
                        [filterHasHWKey]: e.target.value
                    }))
                }}
                value={filters.has_hw}
                optionType="button" />
        </div>
    )
}

export default LessonHomeworksFilter