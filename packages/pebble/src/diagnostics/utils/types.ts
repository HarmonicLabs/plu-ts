export type HasOwnToString<T> = T extends infer A | infer B ?
  | _HasOwnToString<A>
  | _HasOwnToString<B>
  : _HasOwnToString<T>;

type _HasOwnToString<T> = T extends { toString: ( ...args: any[] ) => string }
  ? "toString" extends keyof T
    ? T
    : never
  : never;