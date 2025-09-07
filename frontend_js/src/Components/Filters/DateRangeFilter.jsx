import React from "react";
import {DatePicker} from "antd";

const { RangePicker } = DatePicker;

const DateRangeFilter = ({ setFilters, dateRange, setDateRange, filterKeyFrom, filterKeyTo }) => {
    return (
        <div className="mb-2" style={{ padding: 8 }}>
            <RangePicker
                value={dateRange}
                onChange={(e) => {
                    setDateRange(e)
                    setFilters((prevState) => ({
                        ...prevState,
                        [filterKeyFrom]: e ? `${e[0].$y}-${e[0].$M+1}-${e[0].$D}` : null,
                        [filterKeyTo]: e ? `${e[1].$y}-${e[1].$M+1}-${e[1].$D}` : null
                    }))}}
            />
        </div>
    )
}

export default DateRangeFilter