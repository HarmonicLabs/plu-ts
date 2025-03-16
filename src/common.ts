/**
 * @fileoverview Common constants used by various parts of the compiler.
 * @license Apache-2.0
 */

/** Indicates traits of a {@link AstNode} or {@link Element}. */
export enum CommonFlags {
    /** No flags set. */
    None = 0,

    /** Has a `const` modifier. */
    Const = 1 << 1,
    /** Has a `let` modifier. */
    Let = 1 << 2,
    /** (func parameter) has a `var` modifier. */
    Var = 1 << 3,

    /** Has a `static` method modifier. */
    Static = 1 << 7,
    
    /** Has `tagged` struct modifier */
    taggedModifier = 1 << 8,
    /** Has a `data` struct modifier. */
    dataModifier = 1 << 9,
    /** Has a `runtime` struct modifier. */
    runtimeModifier = 1 << 10,
}

Object.freeze(CommonFlags);

let hasGlobalThis: boolean;
try {
    hasGlobalThis = typeof globalThis !== "undefined"
} catch { hasGlobalThis = false; }
export const WIN = hasGlobalThis && globalThis.process && globalThis.process.platform === "win32";
export const EOL = WIN ? "\r\n" : "\n";
export const SEP = WIN ? "\\"   : "/";

/** Path delimiter inserted between file system levels. */
export const PATH_DELIMITER = "/";
/** Substitution used to indicate the parent directory. */
export const PARENT_SUBST = "..";
/** Function name prefix used for getters. */
export const GETTER_PREFIX = "get:";
/** Function name prefix used for setters. */
export const SETTER_PREFIX = "set:";
/** Delimiter used between class names and instance members. */
export const INSTANCE_DELIMITER = "#";
/** Delimiter used between class and namespace names and static members. */
export const STATIC_DELIMITER = ".";
/** Delimiter used between a function and its inner elements. */
export const INNER_DELIMITER = "~";
/** Substitution used to indicate a library directory. */
export const LIBRARY_SUBST = "~lib";
/** Library directory prefix. */
export const LIBRARY_PREFIX = LIBRARY_SUBST + PATH_DELIMITER;
/** Path index suffix. */
export const INDEX_SUFFIX = PATH_DELIMITER + "index";
/** Stub function delimiter. */
export const STUB_DELIMITER = "@";
/** */
export const extension = ".pebble";

/** Common names. */
export namespace CommonNames {
    // special
    export const Empty = "";
    // types
    export const i8 = "i8";
    export const i16 = "i16";
    // export const number = "number";
    export const i64 = "i64";
    export const isize = "isize";
    export const u8 = "u8";
    export const u16 = "u16";
    // export const number = "number";
    export const u64 = "u64";
    export const usize = "usize";
    // export const boolean = "boolean";
    export const f32 = "f32";
    // export const number = "number";
    export const v128 = "v128";
    export const ref_func = "ref_func";
    export const ref_extern = "ref_extern";
    export const ref_any = "ref_any";
    export const ref_eq = "ref_eq";
    export const ref_struct = "ref_struct";
    export const ref_array = "ref_array";
    export const ref_i31 = "ref_i31";
    export const ref_string = "ref_string";
    export const ref_stringview_wtf8 = "ref_stringview_wtf8";
    export const ref_stringview_wtf16 = "ref_stringview_wtf16";
    export const ref_stringview_iter = "ref_stringview_iter";
    export const i8x16 = "i8x16";
    export const u8x16 = "u8x16";
    export const i16x8 = "i16x8";
    export const u16x8 = "u16x8";
    export const numberx4 = "numberx4";
    export const u32x4 = "u32x4";
    export const i64x2 = "i64x2";
    export const u64x2 = "u64x2";
    export const f32x4 = "f32x4";
    export const numberx2 = "numberx2";
    export const void_ = "void";
    // export const number = "number";
    export const boolean = "boolean";
    export const string = "string";
    export const native = "native";
    export const indexof = "indexof";
    export const valueof = "valueof";
    export const returnof = "returnof";
    export const nonnull = "nonnull";
    // aliases
    export const null_ = "undefined";
    export const true_ = "true";
    export const false_ = "false";
    // objects
    export const this_ = "this";
    export const super_ = "super";
    export const constructor = "constructor";
    // constants
    export const ASC_TARGET = "ASC_TARGET";
    export const ASC_RUNTIME = "ASC_RUNTIME";
    export const ASC_NO_ASSERT = "ASC_NO_ASSERT";
    export const ASC_MEMORY_BASE = "ASC_MEMORY_BASE";
    export const ASC_TABLE_BASE = "ASC_TABLE_BASE";
    export const ASC_OPTIMIZE_LEVEL = "ASC_OPTIMIZE_LEVEL";
    export const ASC_SHRINK_LEVEL = "ASC_SHRINK_LEVEL";
    export const ASC_LOW_MEMORY_LIMIT = "ASC_LOW_MEMORY_LIMIT";
    export const ASC_EXPORT_RUNTIME = "ASC_EXPORT_RUNTIME";
    export const ASC_FEATURE_SIGN_EXTENSION = "ASC_FEATURE_SIGN_EXTENSION";
    export const ASC_FEATURE_MUTABLE_GLOBALS = "ASC_FEATURE_MUTABLE_GLOBALS";
    export const ASC_FEATURE_NONTRAPPING_F2I = "ASC_FEATURE_NONTRAPPING_F2I";
    export const ASC_FEATURE_BULK_MEMORY = "ASC_FEATURE_BULK_MEMORY";
    export const ASC_FEATURE_SIMD = "ASC_FEATURE_SIMD";
    export const ASC_FEATURE_THREADS = "ASC_FEATURE_THREADS";
    export const ASC_FEATURE_EXCEPTION_HANDLING = "ASC_FEATURE_EXCEPTION_HANDLING";
    export const ASC_FEATURE_TAIL_CALLS = "ASC_FEATURE_TAIL_CALLS";
    export const ASC_FEATURE_REFERENCE_TYPES = "ASC_FEATURE_REFERENCE_TYPES";
    export const ASC_FEATURE_MULTI_VALUE = "ASC_FEATURE_MULTI_VALUE";
    export const ASC_FEATURE_GC = "ASC_FEATURE_GC";
    export const ASC_FEATURE_MEMORY64 = "ASC_FEATURE_MEMORY64";
    export const ASC_FEATURE_RELAXED_SIMD = "ASC_FEATURE_RELAXED_SIMD";
    export const ASC_FEATURE_EXTENDED_CONST = "ASC_FEATURE_EXTENDED_CONST";
    export const ASC_FEATURE_STRINGREF = "ASC_FEATURE_STRINGREF";
    export const ASC_VERSION_MAJOR = "ASC_VERSION_MAJOR";
    export const ASC_VERSION_MINOR = "ASC_VERSION_MINOR";
    export const ASC_VERSION_PATCH = "ASC_VERSION_PATCH";
    // classes
    export const I8 = "I8";
    export const I16 = "I16";
    // export const number = "number";
    export const I64 = "I64";
    export const Isize = "Isize";
    export const U8 = "U8";
    export const U16 = "U16";
    export const U32 = "U32";
    export const U64 = "U64";
    export const Usize = "Usize";
    export const Bool = "Bool";
    export const F32 = "F32";
    export const number = "number";
    export const V128 = "V128";
    export const RefFunc = "RefFunc";
    export const RefExtern = "RefExtern";
    export const RefAny = "RefAny";
    export const RefEq = "RefEq";
    export const RefStruct = "RefStruct";
    export const RefArray = "RefArray";
    export const RefI31 = "RefI31";
    export const RefString = "RefString";
    export const String = "String";
    export const RegExp = "RegExp";
    export const Object = "Object";
    export const Array = "Array";
    export const StaticArray = "StaticArray";
    export const Set = "Set";
    export const Map = "Map";
    export const Function = "Function";
    export const ArrayBufferView = "ArrayBufferView";
    export const ArrayBuffer = "ArrayBuffer";
    export const Math = "Math";
    export const Mathf = "Mathf";
    export const NativeMath = "NativeMath";
    export const NativeMathf = "NativeMathf";
    export const Int8Array = "Int8Array";
    export const Int16Array = "Int16Array";
    export const Int32Array = "Int32Array";
    export const Int64Array = "Int64Array";
    export const Uint8Array = "Uint8Array";
    export const Uint8ClampedArray = "Uint8ClampedArray";
    export const Uint16Array = "Uint16Array";
    export const Uint32Array = "Uint32Array";
    export const Uint64Array = "Uint64Array";
    export const Float32Array = "Float32Array";
    export const Float64Array = "Float64Array";
    export const TemplateStringsArray = "TemplateStringsArray";
    export const Error = "Error";
    // runtime
    export const abort = "abort";
    export const trace = "trace";
    export const seed = "seed";
    export const pow = "pow";
    export const ipow32 = "ipow32";
    export const ipow64 = "ipow64";
    export const mod = "mod";
    export const alloc = "__alloc";
    export const realloc = "__realloc";
    export const free = "__free";
    export const new_ = "__new";
    export const renew = "__renew";
    export const link = "__link";
    export const collect = "__collect";
    export const visit = "__visit";
    export const newBuffer = "__newBuffer";
    export const newArray = "__newArray";
    export const BLOCK = "~lib/rt/common/BLOCK";
    export const OBJECT = "~lib/rt/common/OBJECT";
    // memory & table
    export const DefaultMemory = "0";
    export const DefaultTable = "0";
}

// shared
// export { Feature, featureToString } from "../std/assembly/shared/feature";
// export { Target } from "../std/assembly/shared/target";
// export { Runtime } from "../std/assembly/shared/runtime";
// export { Typeinfo, TypeinfoFlags } from "../std/assembly/shared/typeinfo";
