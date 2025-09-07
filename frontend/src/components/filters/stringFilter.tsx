import {Button, Input, Space} from "antd";
import type {GetFilterStringElementType} from "../../types/filterStringTypes.ts";
import type {FiltersBaseType} from "../../types/filterBaseTypes.ts";

const StringFilter: GetFilterStringElementType = ({ filters, setFilters, filterKey, placeHolder="Поиск" }) => {
    return (
        <div style={{ padding: 8 }}>
            <Input
                placeholder={placeHolder}
                value={filters[filterKey]}
                onChange={(e) => setFilters((prevState: FiltersBaseType) => ({
                    ...prevState,
                    [filterKey]: e.target.value.trim() ? e.target.value.trim() : null
                }))}
                style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
                <Button
                    size="small"
                    color="danger"
                    variant="outlined"
                    onClick={() => {
                        setFilters((prevState: FiltersBaseType) => ({
                            ...prevState,
                            [filterKey]: null
                        }))
                    }}
                >
                    <span className="material-icons">clear</span>Сбросить
                </Button>
            </Space>
        </div>
    )
}

export default StringFilter