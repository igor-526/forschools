import {DatePicker} from "antd";
import type {DateRangeType, GetFilterDateRangeElementType} from "../../types/filterDateRangeTypes.ts";
import type {FiltersBaseType} from "../../types/filterBaseTypes.ts";


const {RangePicker} = DatePicker;

const DateRangeFilter: GetFilterDateRangeElementType = ({
                                                            setFilters,
                                                            dateRange,
                                                            setDateRange,
                                                            filterKeyFrom,
                                                            filterKeyTo
                                                        }) => {
    return (
        <div className="mb-2" style={{padding: 8}}>
            <RangePicker
                value={dateRange}
                onChange={(e: DateRangeType | null) => {
                    setDateRange(e)
                    setFilters((prevState: FiltersBaseType) => ({
                        ...prevState,
                        [filterKeyFrom]: e && e[0] ? `${e[0].year()}-${e[0].month() + 1}-${e[0].day()}` : null,
                        [filterKeyTo]: e && e[1] ? `${e[1].year()}-${e[1].month() + 1}-${e[1].day()}` : null
                    }))

                }}
            />
        </div>
    )
}

export default DateRangeFilter