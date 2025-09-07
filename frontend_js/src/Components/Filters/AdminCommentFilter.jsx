import { Button, Input, Radio } from "antd";
import React from "react";

const AdminCommentFilter = ({ filters, setFilters, searchKey, filterKey }) => {
    return (
        <div style={{ padding: 8 }}>
            <Input
                placeholder="Поиск"
                value={filters[searchKey]}
                onChange={(e) => setFilters((prevState) => ({
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
                    setFilters((prevState) => ({
                        ...prevState,
                        [filterKey]: e.target.value
                    }))
                }}
                value={filters[filterKey]}
                optionType="button" />
            <div className="mt-2">
                <Button
                    size="small"
                    color="danger"
                    variant="outlined"
                    onClick={() => {
                        setFilters((prevState) => ({
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