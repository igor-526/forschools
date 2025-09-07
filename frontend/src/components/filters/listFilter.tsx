import { Select } from "antd";
import type {GetFilterListElementType} from "../../types/filterListTypes.ts";
import type {FiltersBaseType} from "../../types/filterBaseTypes.ts";

const ListFilter: GetFilterListElementType = ({ filters,
                                                  setFilters,
                                                  filterKey,
                                                  filterData,
                                                  placeHolder="Выберите",
                                                  style={ padding: 8, minWidth: 250 } }) => {
    return (
        <div style={style}>
            <Select
                mode="multiple"
                allowClear
                style={{ marginBottom: 8, display: 'block' }}
                placeholder={placeHolder}
                value={filters[filterKey]}
                onChange={(e) => {
                    setFilters((prevState: FiltersBaseType) => ({
                        ...prevState,
                        [filterKey]: e
                    }))}}
                options={filterData}
            />
        </div>
    )
}

export default ListFilter