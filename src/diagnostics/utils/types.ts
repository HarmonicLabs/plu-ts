export type HasOwnToString<T> = T extends { toString: ( ...args: any[] ) => string }
  ? "toString" extends keyof T
    ? T
    : never
  : never;