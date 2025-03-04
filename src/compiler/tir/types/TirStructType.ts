import { getAppliedTypeInternalName } from "../../AstCompiler/scope/Scope";
import { TirInterfaceImpl } from "./TirInterfaceImpl";
import { TirType } from "./TirType";

export enum StructFlags {
    None = 0,
    /**
     * tags single constructor structs
     * 
     * by default, single constructor structs are encoded only as lists
     */
    taggedDataEncoding = 1 << 0,
    onlyData = 1 << 1,
    onlySoP = 1 << 2,
}
Object.freeze( StructFlags );

export class TirStructType
{
    constructor(
        readonly name: string,
        readonly constructors: TirStructConstr[],
        readonly impls: TirInterfaceImpl[],
        public flags: StructFlags
    ) {}

    isSingleConstr(): boolean {
        return this.constructors.length === 1;
    }

    toString(): string {
        return this.name;
    }

    toInternalName(): string {
        return getAppliedTypeInternalName(
            "Struct",
            [
                this.name,
                ...this.constructors.map( c => 
                    c.fields.map( f => f.type.toInternalName() )
                ).flat( Infinity ) as string[]
            ]
        );
    }

    private _isConcrete: boolean | undefined = undefined;
    isConcrete(): boolean {
        if( typeof this._isConcrete !== "boolean" )
            this._isConcrete = this.constructors.every(
                c => c.isConcrete()
            );
        return this._isConcrete;
    }

    clone(): TirStructType
    {
        const result = new TirStructType(
            this.name,
            this.constructors.map( c => c.clone() ),
            this.impls.map( i => i.clone() ),
            this.flags
        );
        result._isConcrete = this._isConcrete;
        return result;
    }

    /**
     * still allows SoP (unless `onlyData` is set)
     * 
     * of course if `onlySoP` is set, then this doesn't matter,
     * but still not an error, just useless
     */
    taggedDataEncoding(): boolean {
        return (this.flags & StructFlags.taggedDataEncoding) !== 0;
    }

    onlyData(): boolean {
        return (this.flags & StructFlags.onlyData) !== 0;
    }

    onlySoP(): boolean {
        return (this.flags & StructFlags.onlySoP) !== 0;
    }

    allowsDataEncoding(): boolean {
        // return !this.onlySoP();
        return (this.flags & StructFlags.onlySoP) === 0;
    }

    allowsSoPEncoding(): boolean {
        // return !this.onlyData();
        return (this.flags & StructFlags.onlyData) === 0;
    }
}

export class TirStructConstr
{
    constructor(
        readonly name: string,
        readonly fields: TirStructField[]
    ) {}

    toString(): string {
        return this.name;
    }

    isConcrete(): boolean {
        return this.fields.every(
            f => f.isConcrete()
        );
    }

    clone(): TirStructConstr
    {
        return new TirStructConstr(
            this.name,
            this.fields.map( f => f.clone() )
        );
    }
}

export class TirStructField
{
    constructor(
        readonly name: string,
        readonly type: TirType
    ) {}

    isConcrete(): boolean {
        return this.type.isConcrete();
    }

    clone(): TirStructField
    {
        return new TirStructField(
            this.name,
            this.type.clone()
        );
    }
}