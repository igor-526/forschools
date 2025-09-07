import { Button, Input, Radio } from "antd";
import type {FiltersBaseType} from "../../types/filterBaseTypes.ts";
import type {DateRangeType} from "../../types/filterDateRangeTypes.ts";
import {DatePicker} from "antd";
import type {GetFilterAdminCommentElementType} from "../../types/filterAdminCommentTypes.ts";

const {RangePicker} = DatePicker;


const AdminCommentFilter: GetFilterAdminCommentElementType = ({
                                filters,
                                setFilters,
                                searchKey,
                                filterKey,
                                dateRange,
                                setDateRange,
                                filterKeyFrom,
                                filterKeyTo
                            }) => {
    return (
        <div style={{ padding: 8 }}>
            <Input
                placeholder="Поиск"
                value={filters[searchKey]}
                onChange={(e) => setFilters((prevState: FiltersBaseType) => ({
                    ...prevState,
                    [searchKey]: e.target.value.trim() ? e.target.value.trim() : null
                }))}
                style={{ marginBottom: 8, display: 'block' }}
                disabled={filters[filterKey] === "false"}
            />

            <Radio.Group
                options={[
                    { label: 'Все', value: undefined },
                    { label: 'С комментарием', value: 'true' },
                    { label: 'Без комментария', value: 'false' },
                ]}
                onChange={(e) => {
                    setFilters((prevState: FiltersBaseType) => ({
                        ...prevState,
                        [filterKey]: e.target.value
                    }))
                }}
                value={filters[filterKey]}
                optionType="button" />
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
            <div className="mt-2">
                <Button
                    size="small"
                    color="danger"
                    variant="outlined"
                    onClick={() => {
                        setFilters((prevState: FiltersBaseType) => ({
                            ...prevState,
                            [filterKey]: undefined,
                            [searchKey]: null
                        }))
                    }}
                >
                    <span className="material-icons">clear</span>Сбросить
                </Button>
            </div>

        </div>
    )
}

export default AdminCommentFilter