type SingleKeyObj<K extends string | number | symbol, V = any> = {
    [Prop in K]: (Record<Prop, V> &
        // `infer O` here is just binding
        Record<Exclude<K, Prop>, never>) extends infer O
        ? { [Q in keyof O]: O[Q] }
        : never
}[K];

export default SingleKeyObj;

export type IsSingleKey<Obj extends object> = Obj extends SingleKeyObj<keyof Obj> ? true : false;