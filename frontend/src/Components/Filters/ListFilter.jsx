import React from "react";
import { Select } from "antd";

const ListFilter = ({ filters, setFilters, filterKey, filterData, placeHolder="Выберите", style={ padding: 8, minWidth: 250 } }) => {
    return (
        <div style={style}>
            <Select
                mode="multiple"
                allowClear
                style={{ marginBottom: 8, display: 'block' }}
                placeholder={placeHolder}
                value={filters[filterKey]}
                onChange={(e) => {
                    setFilters((prevState) => ({
                        ...prevState,
                        [filterKey]: e
                    }))}}
                options={filterData}
            />
        </div>
    )
}

export default ListFilter