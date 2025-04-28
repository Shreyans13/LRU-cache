
export type INPUT_PARAMS = string | number | symbol

export type SET_POP<K,V> = {
    evictionPolicy: null, 
    key: K, 
    value: V
} | {
    evictionPolicy: "CACHE_SIZE_FULL", 
    oldKey: INPUT_PARAMS, 
    oldValue: INPUT_PARAMS
}