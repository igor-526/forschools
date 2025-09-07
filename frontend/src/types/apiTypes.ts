export type BooleanFilterType = 'true' | 'false' | null | undefined;

export type ApiListPaginatableResponseType<T> = {
    count: number,
    items: T[]
}