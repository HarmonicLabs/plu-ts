import { Identifier } from "../ast/nodes/common/Identifier";
import { NamedDeconstructVarDecl } from "../ast/nodes/statements/declarations/VarDecl/NamedDeconstructVarDecl";
import { SingleDeconstructVarDecl } from "../ast/nodes/statements/declarations/VarDecl/SingleDeconstructVarDecl";
import { VarDecl } from "../ast/nodes/statements/declarations/VarDecl/VarDecl";
import { VarStmt } from "../ast/nodes/statements/VarStmt";
import { PebbleAst } from "../ast/PebbleAst";
import { SourceKind, Source } from "../ast/Source/Source";
import { CommonFlags, LIBRARY_PREFIX, PATH_DELIMITER } from "../common";
import { DiagnosticEmitter } from "../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../diagnostics/DiagnosticMessage";
import { DiagnosticCode } from "../diagnostics/diagnosticMessages.generated";
import { Token } from "../tokenizer/Token";
import { Tokenizer } from "../tokenizer/Tokenizer";
import { isNonEmpty } from "../utils/isNonEmpty";
import { PebbleExpr } from "../ast/nodes/expr/PebbleExpr";
import { SourceRange } from "../ast/Source/SourceRange";
import { SimpleVarDecl } from "../ast/nodes/statements/declarations/VarDecl/SimpleVarDecl";
import { ArrayLikeDeconstr } from "../ast/nodes/statements/declarations/VarDecl/ArrayLikeDeconstr";
import { IdentifierHandling } from "../tokenizer/IdentifierHandling";
import { determinePrecedence, Precedence } from "./Precedence";
import { makeUnaryPrefixExpr } from "../ast/nodes/expr/unary/UnaryPrefixExpr";
import { LitUndefExpr } from "../ast/nodes/expr/litteral/LitUndefExpr";
import { LitVoidExpr } from "../ast/nodes/expr/litteral/LitVoidExpr";
import { LitFalseExpr } from "../ast/nodes/expr/litteral/LitFalseExpr";
import { LitThisExpr } from "../ast/nodes/expr/litteral/LitThisExpr";
import { LitTrueExpr } from "../ast/nodes/expr/litteral/LitTrueExpr";
import { ParentesizedExpr } from "../ast/nodes/expr/ParentesizedExpr";
import { ArrowKind } from "../ast/nodes/expr/functions/ArrowKind";
import { FuncExpr } from "../ast/nodes/expr/functions/FuncExpr";
import { PebbleStmt } from "../ast/nodes/statements/PebbleStmt";
import { AstBooleanType, AstBytesType, AstListType, AstNumberType, AstNativeOptionalType, AstVoidType, AstLinearMapType, AstFuncType } from "../ast/nodes/types/AstNativeType";
import { AstNamedType } from "../ast/nodes/types/AstNamedType";
import { LitArrExpr } from "../ast/nodes/expr/litteral/LitArrExpr";
import { LitNamedObjExpr } from "../ast/nodes/expr/litteral/LitNamedObjExpr";
import { LitObjExpr } from "../ast/nodes/expr/litteral/LitObjExpr";
import { LitStrExpr } from "../ast/nodes/expr/litteral/LitStrExpr";
import { LitIntExpr } from "../ast/nodes/expr/litteral/LitIntExpr";
import { LitHexBytesExpr } from "../ast/nodes/expr/litteral/LitHexBytesExpr";
import { CallExpr } from "../ast/nodes/expr/functions/CallExpr";
import { BlockStmt } from "../ast/nodes/statements/BlockStmt";
import { BreakStmt } from "../ast/nodes/statements/BreakStmt";
import { ContinueStmt } from "../ast/nodes/statements/ContinueStmt";
import { DoWhileStmt } from "../ast/nodes/statements/DoWhileStmt";
import { ForStmt } from "../ast/nodes/statements/ForStmt";
import { ForOfStmt } from "../ast/nodes/statements/ForOfStmt";
import { IfStmt } from "../ast/nodes/statements/IfStmt";
import { ReturnStmt } from "../ast/nodes/statements/ReturnStmt";
import { EmptyStmt } from "../ast/nodes/statements/EmptyStmt";
import { FuncDecl } from "../ast/nodes/statements/declarations/FuncDecl";
import { CharCode } from "../utils/CharCode";
import { FailStmt } from "../ast/nodes/statements/FailStmt";
import { AssertStmt } from "../ast/nodes/statements/AssertStmt";
import { TestStmt } from "../ast/nodes/statements/TestStmt";
import { MatchStmt, MatchStmtCase } from "../ast/nodes/statements/MatchStmt";
import { WhileStmt } from "../ast/nodes/statements/WhileStmt";
import { CaseExpr, CaseExprMatcher } from "../ast/nodes/expr/CaseExpr";
import { StructConstrDecl, StructDecl } from "../ast/nodes/statements/declarations/StructDecl";
import { InterfaceDecl, InterfaceDeclMethod } from "../ast/nodes/statements/declarations/InterfaceDecl";
import { ImportStarStmt } from "../ast/nodes/statements/ImportStarStmt";
import { ImportDecl, ImportStmt } from "../ast/nodes/statements/ImportStmt";
import { ExportStmt } from "../ast/nodes/statements/ExportStmt";
import { ExportStarStmt } from "../ast/nodes/statements/ExportStarStmt";
import { InterfaceMethodImpl, TypeImplementsStmt } from "../ast/nodes/statements/TypeImplementsStmt";
import { TypeAliasDecl } from "../ast/nodes/statements/declarations/TypeAliasDecl";
import { EnumDecl, EnumValueDecl } from "../ast/nodes/statements/declarations/EnumDecl";
import { TypeConversionExpr } from "../ast/nodes/expr/TypeConversionExpr";
import { NonNullExpr } from "../ast/nodes/expr/NonNullExpr";
import { InstanceOfExpr } from "../ast/nodes/expr/InstanceOfExpr";
import { ElemAccessExpr } from "../ast/nodes/expr/ElemAccessExpr";
import { makeUnaryPostfixExpr } from "../ast/nodes/expr/unary/UnaryPostfixExpr";
import { TernaryExpr } from "../ast/nodes/expr/TernaryExpr";
import { CommaExpr } from "../ast/nodes/expr/CommaExpr";
import { makePropAccessExpr } from "../ast/nodes/expr/PropAccessExpr";
import { makeBinaryExpr } from "../ast/nodes/expr/binary/BinaryExpr";
import { AssignmentStmt, makeAssignmentStmt } from "../ast/nodes/statements/AssignmentStmt";
import { ExprStmt } from "../ast/nodes/statements/ExprStmt";
import { PebbleAstType } from "../ast/nodes/types/PebbleAstType";
import { getInternalPath } from "../compiler/path/path";

export class Parser extends DiagnosticEmitter
{
    readonly tn: Tokenizer;
    constructor(
        tokenizer: Tokenizer,
        diagnostics: DiagnosticMessage[] | undefined = undefined
    )
    {
        super( diagnostics );
        this.tn = tokenizer;
    }

    static parseFile(
        path: string,
        src: string,
        isEntry: boolean = false
    ): [ Source, DiagnosticMessage[] ]
    {
        const internalPath = getInternalPath( path );
    
        const kind = (
            isEntry
            ? SourceKind.UserEntry
            : path.startsWith(LIBRARY_PREFIX)
                ? path.indexOf(PATH_DELIMITER, LIBRARY_PREFIX.length) < 0
                    ? SourceKind.LibraryEntry
                    : SourceKind.Library
                : SourceKind.User
        );
    
        const source = new Source(
            kind,
            internalPath,
            src
        );

        return [
            source,
            Parser.parseSource( source )
        ]; 
    }

    static parseSource(
        src: Source,
        diagnostics?: DiagnosticMessage[]
    ): DiagnosticMessage[]
    {
        return new Parser(
            new Tokenizer( src ),
            diagnostics
        ).parseSource();
    }

    parseSource(): DiagnosticMessage[]
    {
        const src = this.tn.source;
        if( src.statements.length > 0 ) return this.diagnostics;

        const tn = this.tn;
        let stmt: any;
        while( !tn.eof() )
        {
            stmt = this.parseTopLevelStatement();
            if( stmt ) src.statements.push( stmt );
            else this.skipStatement();
        }

        return this.diagnostics;
    }

    parseTopLevelStatement(): PebbleStmt | undefined
    {
        const tn = this.tn;
        
        let flags = CommonFlags.None;
        let startPos = -1;

        let exportStart = 0;
        let exportEnd = 0;

        // `export` keyword
        // `export default` is NOT supported (`export default` should have never exsisted)
        if (tn.skip(Token.Export)) {
            if (startPos < 0) startPos = tn.tokenPos;
            flags |= CommonFlags.Export;
            exportStart = tn.tokenPos;
            exportEnd = tn.pos;
        }

        const initialState = tn.mark();

        let statement: PebbleAst | undefined = undefined;
        let first = tn.peek();
        if (startPos < 0) startPos = tn.nextTokenPos;

        switch( first ) {
            case Token.Var:
            case Token.Let:
            case Token.Const: {
                tn.next(); // skip `const` | `let` | `var`
                flags |= first === Token.Const ? CommonFlags.Const : CommonFlags.None;

                if( tn.skip( Token.Enum ) )
                {
                    tn.reset( initialState );
                    this.skipStatement();
                    return this.error(
                        DiagnosticCode.Not_implemented_0,
                        tn.range(), "const enum"
                    );
                }
                statement = this.parseVarStmt( flags, startPos );
                break;
            }
            case Token.Enum: {
                tn.next();
                statement = this.parseEnum(flags, startPos);
                // decorators = undefined;
                break;
            }
            case Token.Function: {
                tn.next();
                statement = this.parseFuncDecl(flags, startPos);
                // decorators = undefined;
                break;
            }
            // case Token.Class:
            case Token.Struct: {
                tn.next();
                statement = this.parseStruct(flags, startPos);
                break;
            }
            case Token.Interface: {
                tn.next();
                statement = this.parseInterface(flags, startPos);
                // decorators = undefined;
                break;
            }
            case Token.Import: {
                tn.next();
                // flags |= CommonFlags.Import;
                if (flags & CommonFlags.Export) {
                    // statement = this.parseExportImport(startPos);
                    this.error(
                        DiagnosticCode._0_modifier_cannot_be_used_here,
                        tn.range(exportStart, exportEnd), "export"
                    ); // recoverable
                    return undefined;
                }
                statement = this.parseImport();
                break;
            }
            case Token.Type: { // also identifier // no more
                // let state = tn.mark();
                tn.next();
                // if (tn.peek(IdentifierHandling.Prefer) === Token.Identifier) {
                //     tn.discard(state);
                //     statement = this.parseTypeDeclaration(flags, startPos);
                //     // decorators = undefined;
                // } else {
                //     tn.reset(state);
                //     statement = this.parseStatement(true);
                // }
                statement = this.parseTypeStmt(flags, startPos);
                break;
            }
            default: {
                if( flags & CommonFlags.Export ) {
                    statement = this.parseExport(startPos);
                    break;
                }
                statement = this.parseStatement( true );
            }
            break;
        }

        return statement;
    }

    parseTypeParameters(): PebbleAstType[] | undefined
    {
        const tn = this.tn;
        // at '<': TypeParameter (',' TypeParameter)* '>'

        const typeParams = new Array<PebbleAstType>();
        while( !tn.skip( Token.GreaterThan ) )
        {
            const typeParam = this.parseType();
            if( !typeParam ) return undefined;
            typeParams.push( typeParam );

            if( tn.skip( Token.Comma ) ) continue;

            if( tn.skip( Token.GreaterThan ) ) break;
            else return this.error(
                DiagnosticCode._0_expected,
                tn.range(), ">"
            );
        }

        return typeParams;
    }

    parseExport(
        startPos?: number
    ): ExportStmt | ExportStarStmt | undefined
    {
        const tn = this.tn;

        startPos = startPos ?? tn.tokenPos;


        // export { ... } from "module";
        if( tn.skip( Token.OpenBrace ) )
        {
            const members = new Array<ImportDecl>();
            while( !tn.skip( Token.CloseBrace ) )
            {
                const member = this.parseImportDeclaration();
                if( !member ) return undefined;
                members.push( member );

                if( tn.skip( Token.Comma ) ) continue;

                if( tn.skip( Token.CloseBrace ) ) break;
                else return this.error(
                    DiagnosticCode._0_expected,
                    tn.range(), "}"
                );
            }

            if( !tn.skip( Token.From ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "from"
            );
    
            if( !tn.skip( Token.StringLiteral ) )
            return this.error(
                DiagnosticCode.String_literal_expected,
                tn.range()
            );
    
            tn.skip( Token.Semicolon ); // if any

            return new ExportStmt(
                members,
                new LitStrExpr( tn.readString(), tn.range() ),
                tn.range( startPos, tn.pos )
            );
        }

        // export * from "module";
        if( !tn.skip( Token.Asterisk ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "{ or *"
        );

        if( !tn.skip( Token.From ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "from"
        );

        if( !tn.skip( Token.StringLiteral ) )
        return this.error(
            DiagnosticCode.String_literal_expected,
            tn.range()
        );

        tn.skip( Token.Semicolon ); // if any

        return new ExportStarStmt(
            new LitStrExpr( tn.readString(), tn.range() ),
            tn.range( startPos, tn.pos )
        );
    }

    parseTypeStmt(
        flags: CommonFlags = CommonFlags.None,
        startPos?: number
    ): TypeAliasDecl | TypeImplementsStmt | undefined
    {
        const tn = this.tn;
        startPos = startPos ?? tn.tokenPos;

        // at 'type': Type
        // (('=' Type ) ';'?) |
        // ('implements' Identifier '{' MethodImpl* '}' ';'?)

        if( !tn.skipIdentifier() )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );

        const typeId = this.parseType()//  new Identifier( tn.readIdentifier(), tn.range() );
        if( !typeId )
        return this.error(
            DiagnosticCode.Type_expected,
            tn.range()
        );

        if( tn.skip( Token.Equals ) ) // type NewType = OriginalType
        {
            const aliasedType = this.parseType();
            if( !aliasedType ) return undefined;

            tn.skip( Token.Semicolon ); // if any

            return new TypeAliasDecl(
                typeId,
                aliasedType,
                tn.range()
            );
        }

        if( !tn.skip( Token.Implements ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "implements"
        );

        let interfaceType: PebbleAstType | undefined = undefined;

        if( !tn.skip( Token.OpenBrace ) )
        {
            const state = tn.mark();
            interfaceType = this.parseType();
            if(
                !interfaceType ||
                !tn.skip( Token.OpenBrace )
            )
            {
                const otherState = tn.mark();
                tn.reset( state );
                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(), "{"
                );
                tn.reset( otherState );
                return undefined;
            }
        }

        const members = new Array<InterfaceMethodImpl>();
        while( !tn.skip( Token.CloseBrace ) )
        {
            const startPos = tn.tokenPos;

            const namedSig = this.parseNamedFuncSig( flags, tn.tokenPos );
            if( !namedSig ) return undefined;

            const [ methodName, typeParams, sig ] = namedSig;

            if( !tn.skip( Token.OpenBrace ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "{"
            );

            const body = this.parseBlockStmt();
            if( !body ) return undefined;

            members.push(
                new InterfaceMethodImpl(
                    methodName,
                    typeParams ?? [],
                    sig,
                    body,
                    tn.range( startPos, tn.pos )
                )
            );
        }

        tn.skip( Token.Semicolon ); // if any

        return new TypeImplementsStmt(
            typeId,
            interfaceType,
            members,
            tn.range()
        );
    }

    parseImport(): ImportStmt | ImportStarStmt | undefined
    {
        const tn = this.tn;

        // at 'import':
        //  ('{' (ImportMember (',' ImportMember)* '}') | ('*' 'as' Identifier)?
        //  'from' StringLiteral ';'?

        const startPos = tn.tokenPos;

        if( tn.skip( Token.Asterisk ) ) // import * as module from "module";
        {
            if( !tn.skip( Token.As ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "as"
            );

            if( !tn.skipIdentifier() )
            return this.error(
                DiagnosticCode.Identifier_expected,
                tn.range()
            );

            const identifier = new Identifier( tn.readIdentifier(), tn.range() );

            if( !tn.skip( Token.From ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "from"
            );

            if( !tn.skip( Token.StringLiteral ) )
            return this.error(
                DiagnosticCode.String_literal_expected,
                tn.range()
            );

            const path = new LitStrExpr( tn.readString(), tn.range() );

            tn.skip( Token.Semicolon ); // if any

            return new ImportStarStmt(
                identifier,
                path,
                tn.range( startPos, tn.pos )
            );
        }

        if( !tn.skip( Token.OpenBrace ) ) // import { ... } from "module";
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "{"
        );

        const members = new Array<ImportDecl>();
        while( !tn.skip( Token.CloseBrace ) )
        {
            let member = this.parseImportDeclaration();
            if (!member) return undefined;
            members.push( member );

            if( !tn.skip( Token.Comma ) )
            {
                if (tn.skip(Token.CloseBrace)) break;
                return this.error(
                    DiagnosticCode._0_expected,
                    tn.range(), "}"
                );
            }
        }

        if( !tn.skip( Token.From ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "from"
        );

        if( !tn.skip( Token.StringLiteral ) )
        return this.error(
            DiagnosticCode.String_literal_expected,
            tn.range()
        );

        const path = new LitStrExpr( tn.readString(), tn.range() );

        tn.skip( Token.Semicolon ); // if any

        return new ImportStmt(
            members,
            path,
            tn.range( startPos, tn.pos )
        );
    }

    parseImportDeclaration(): ImportDecl | undefined
    {
        const tn = this.tn;
        // before: Identifier ('as' Identifier)?

        if( !tn.skipIdentifier(IdentifierHandling.Always) )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );
        
        let identifier = new Identifier(tn.readIdentifier(), tn.range());

        let asIdentifier: Identifier | undefined = undefined;
        if( tn.skip( Token.As ) )
        {
            if( !tn.skipIdentifier() )
            return this.error(
                DiagnosticCode.Identifier_expected,
                tn.range()
            );
             
            asIdentifier = new Identifier(tn.readIdentifier(), tn.range());
        }

        return new ImportDecl(
            identifier,
            asIdentifier,
            asIdentifier ? SourceRange.join(identifier.range, asIdentifier.range) :
            identifier.range
        );
    }

    parseInterface(
        flags: CommonFlags,
        startPos?: number,
    ): InterfaceDecl | undefined
    {
        const tn = this.tn;

        // at 'interface': Identifier
        // ('<' TypeParameters '>')?
        // '{' (FuncDecl | VarDecl)* '}' ';'?

        startPos = startPos ?? tn.tokenPos;

        if( !tn.skipIdentifier() )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );

        const name = new Identifier( tn.readIdentifier(), tn.range() );

        let typeParams: PebbleAstType[] | undefined = undefined;
        if( tn.skip( Token.LessThan ) )
        {
            typeParams = this.parseTypeParameters();
            if( !typeParams || typeParams.length <= 0 ) return undefined;
        }

        if( !tn.skip( Token.OpenBrace ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "{"
        );

        const members = new Array<InterfaceDeclMethod>();
        while( !tn.skip( Token.CloseBrace ) )
        {
            const namedSig = this.parseNamedFuncSig( flags, tn.tokenPos );
            if( !namedSig ) return undefined;

            const [ methodName, typeParams, sig ] = namedSig;

            let body: BlockStmt | undefined = undefined;
            if( tn.skip( Token.OpenBrace ) )
            {
                body = this.parseBlockStmt();
                if( !body ) return undefined;
            }

            members.push(
                new InterfaceDeclMethod(
                    methodName,
                    typeParams ?? [],
                    sig,
                    body,
                    tn.range( startPos, tn.pos )
                )
            );
        }

        tn.skip( Token.Semicolon ); // if any

        return new InterfaceDecl(
            name,
            typeParams ?? [],
            members,
            tn.range( startPos, tn.pos )
        );
    }

    parseStruct(
        flags = CommonFlags.Const,
        startPos?: number
    ): StructDecl | undefined
    {
        const tn = this.tn;

        startPos = startPos ?? tn.tokenPos;

        if( !tn.skipIdentifier() )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );

        const name = new Identifier( tn.readIdentifier(), tn.range() );

        let typeParams: PebbleAstType[] | undefined = undefined;
        if( tn.skip( Token.LessThan ) )
        {
            typeParams = this.parseTypeParameters();
            if( !typeParams ) return undefined;
            flags |= CommonFlags.Generic;
        }

        if( !tn.skip( Token.OpenBrace ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "{"
        );

        if( tn.skip( Token.CloseBrace ) ) // single constr no fields shortcut
        {
            if( typeParams )
            {
                this.error(
                    DiagnosticCode.Type_parameter_is_unused,
                    typeParams[0].range
                ); // recoverable
            }
            const range = tn.range( startPos, tn.pos );
            tn.skip( Token.Semicolon ); // if any
            return new StructDecl(
                name,
                [], // typeParams
                [
                    new StructConstrDecl(
                        new Identifier( name.name, name.range ),
                        [], // fields
                        range
                    )
                ],
                range.clone()
            );
        }

        let constrIdentifier: Identifier | undefined = undefined;

        // in case of single constr shortcut
        const preIdState = tn.mark();

        if( !tn.skipIdentifier() )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );

        constrIdentifier = new Identifier( tn.readIdentifier() , tn.range() );
        
        // no `{` after identifier means single constr shortcut
        if( !tn.skip( Token.OpenBrace ) )
        {
            // reset before identifier, because this is a field name
            tn.reset( preIdState );

            constrIdentifier = undefined;
            
            const fields = this.parseStructConstrFields( flags );
            if( !fields ) return undefined;

            // `parseStructConstrFields` already skips the closing brace
            // if( !tn.skip( Token.CloseBrace ) )

            tn.skip( Token.Semicolon ); // if any
            return new StructDecl(
                name,
                typeParams ?? [],
                [
                    new StructConstrDecl(
                        new Identifier( name.name, name.range ),
                        fields,
                        tn.range( startPos, tn.pos )
                    )
                ],
                tn.range( startPos, tn.pos )
            );
        }

        const constrFields = this.parseStructConstrFields( flags );
        if( !Array.isArray( constrFields ) ) return undefined;
        
        const constrs = [
            new StructConstrDecl(
                constrIdentifier,
                constrFields,
                tn.range( startPos, tn.pos )
            )
        ];

        while( !tn.skip( Token.CloseBrace ) )
        {
            if( !tn.skipIdentifier() )
            return this.error(
                DiagnosticCode.Identifier_expected,
                tn.range()
            );
    
            constrIdentifier = new Identifier( tn.readIdentifier(), tn.range() );
            
            // no `{` only allowed in single constr shortcut
            // this is not the case
            if( !tn.skip( Token.OpenBrace ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "{"
            );
    
            const constrFields = this.parseStructConstrFields( flags );
            if( !Array.isArray( constrFields ) ) return undefined;
            
            constrs.push(
                new StructConstrDecl(
                    constrIdentifier,
                    constrFields,
                    tn.range( startPos, tn.pos )
                )
            );
        }

        tn.skip( Token.Semicolon ); // if any

        return new StructDecl(
            name,
            typeParams ?? [],
            constrs,
            tn.range( startPos, tn.pos )
        );
    }

    parseStructConstrFields( flags: CommonFlags ): VarDecl[] | undefined
    {
        const tn = this.tn;
        // at '{'

        const fields = new Array<VarDecl>();

        while( !tn.skip( Token.CloseBrace ) )
        {
            const field = this._parseVarDecl( flags );
            if( !field ) return this.warning(
                DiagnosticCode._0_expected,
                tn.range(), "var declaration"
            );

            if( !field.type )
            return this.error(
                DiagnosticCode.Type_expected,
                field.range.atEnd()
            );

            if( field.initExpr )
            return this.error(
                DiagnosticCode.Initialization_expressions_are_not_allowed_in_a_struct_declaration,
                SourceRange.join( field.type.range.atEnd(), field.initExpr.range )
            );

            fields.push( field );

            if(
                tn.skip( Token.Comma ) ||
                tn.skip( Token.Semicolon ) ||
                tn.isNextTokenOnNewLine()
            ) continue;

            if( tn.skip( Token.CloseBrace ) ) break;
            else return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "}"
            );
        }

        return fields;
    }
    
    private parseNamedFuncSig(
        flags: CommonFlags = CommonFlags.None,
        startPos?: number
    ): [ Identifier, PebbleAstType[] | undefined, AstFuncType ] | undefined
    {
        const tn = this.tn;

        startPos = startPos ?? tn.tokenPos;

        if( !tn.skipIdentifier() )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );

        const name = new Identifier( tn.readIdentifier(), tn.range() );
        let sigStart = -1;

        let typeParams: PebbleAstType[] | undefined = undefined;
        if( tn.skip( Token.LessThan ) )
        {
            sigStart = tn.tokenPos;
            typeParams = this.parseTypeParameters();
            if( !typeParams || typeParams.length === 0 ) return undefined;
            flags |= CommonFlags.Generic;
        }

        if( !tn.skip( Token.OpenParen ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "("
        );

        sigStart = sigStart < 0 ? tn.tokenPos : sigStart;

        const params = this.parseParameters();
        if( !params ) return undefined;

        let returnType: PebbleAstType | undefined = undefined;
        if( tn.skip( Token.Colon ) )
        {
            returnType = this.parseType();
            if( !returnType ) return undefined;
        }

        return [
            name,
            typeParams,
            new AstFuncType(
                params,
                returnType,
                tn.range( sigStart, tn.pos )
            )
        ];
    }

    parseFuncDecl(
        flags: CommonFlags,
        startPos?: number
    ): FuncDecl | undefined
    {
        const tn = this.tn;

        startPos = startPos ?? tn.tokenPos;

        const namedSig = this.parseNamedFuncSig( flags, startPos );
        if( !namedSig ) return undefined;

        const [ name, typeParams, sig ] = namedSig;

        if( !tn.skip( Token.OpenBrace ) )
        return this.error(
            DiagnosticCode.Function_implementation_is_missing_or_not_immediately_following_the_declaration,
            tn.range()
        );
        
        const body = this.parseBlockStmt();
        if( !body ) return undefined;

        const endPos = tn.pos;

        tn.skip( Token.Semicolon ); // if any

        return new FuncDecl(
            name,
            flags,
            typeParams ?? [],
            sig,
            body,
            ArrowKind.None,
            tn.range( startPos, endPos )
        );
    }

    parseEnum(
        flags: CommonFlags,
        startPos: number
    ): EnumDecl | undefined
    {
        const tn = this.tn;
        // at 'enum': Identifier '{' (EnumValueDecl (',' EnumValueDecl )*)? '}' ';'?

        if( tn.next() !== Token.Identifier )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );
        const identifier = new Identifier( tn.readIdentifier(), tn.range() );
        if( !tn.skip( Token.OpenBrace ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "{"
        );

        const members = new Array<EnumValueDecl>();
        while( !tn.skip( Token.CloseBrace ) )
        {
            const member = this.parseEnumValue( CommonFlags.None );
            if( !member ) return undefined;
            members.push( member );
            
            if( tn.skip( Token.Comma ) ) continue;

            if( tn.skip( Token.CloseBrace ) ) break;
            else return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "}"
            );
        }

        tn.skip( Token.Semicolon ); // if any

        return new EnumDecl(
            identifier,
            members,
            tn.range( startPos, tn.pos )
        );
    }

    parseEnumValue(
        parentFlags: CommonFlags
    ): EnumValueDecl | undefined
    {
        const tn = this.tn;
        // before: Identifier ('=' Expression)?

        if( !tn.skipIdentifier() )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );
        const identifier = new Identifier(tn.readIdentifier(), tn.range());
        let value: PebbleExpr | undefined = undefined;
        if( tn.skip( Token.Equals ) )
        {
            value = this.parseExpr(Precedence.Comma + 1);
            if (!value) return undefined;
        }
        return new EnumValueDecl(
            identifier,
            parentFlags,
            value,
            SourceRange.join(identifier.range, tn.range())
        );
    }

    parseVarStmt(
        flags: CommonFlags,
        startPos: number,
        opts: Partial<ParseVarOpts> = defaultParseVarOpts
    ): VarStmt | undefined
    {
        const tn = this.tn;
        // at (`const` | `let` | `var`)
        // varDecl [, ...varDecl] `;`?

        opts = {
            ...defaultParseVarOpts,
            ...opts
        };
        const isFor = opts.isFor;

        const decls: VarDecl[] = [];
        let decl: VarDecl | undefined = undefined;
        do {
            decl = this._parseVarDecl( flags );
            if( !decl ) return undefined;
            if( !isFor && !decl.initExpr )
            {
                this.error(
                    DiagnosticCode.Variable_declaration_must_have_an_initializer,
                    decl.range
                );
                return undefined;
            }
            decls.push( decl );
        } while( tn.skip( Token.Comma ) ); // keep pushing while there are commas
        
        if( !isNonEmpty( decls ) )
        {
            this.error(
                DiagnosticCode.A_variable_statement_must_have_at_least_one_variable_declaration,
                tn.range( startPos, tn.pos )
            );
            return undefined;
        }

        const result = new VarStmt( decls, tn.range( startPos, tn.pos ) );

        // if there is no final semicolon (and we are not in a for loop)
        if( !isFor && !tn.skip(Token.Semicolon) )
        {
            // check for automatic semicolon insertion
            this.emitErrorIfInvalidAutoSemicolon();
        }

        return result;
    }

    // parseVarDecl(
    //     flags: CommonFlags = CommonFlags.None,
    //     opts: Partial<ParseVarOpts> = defaultParseVarOpts
    // ): VarDecl | undefined
    // {
    //     const tn = this.tn;
    //     // const startRange = tn.range();
    // 
    //     opts = {
    //         ...defaultParseVarOpts,
    //         ...opts
    //     };
    // 
    //     const varDecl = this._parseVarDecl();
    //     if( !varDecl ) return undefined;
    // 
    //     if( !varDecl.initExpr && !opts.isParam )
    //     {
    //     }
    // }

    /**
     * the parsed variable declaration may or may not have a type and/or an initializer
     * 
     * this is so that `_parseVarDecl` can be used both when parsing a variable statement
     * or (recursively) when parsing a deconstructed variable declaration
     * 
     * in the case of the variable statement, and a destructured variable,
     * an intializer is REQUIRED, with an optional explicit type
     * 
     * on the contrary in case we are parsing a field of a deconstructed variable declaration
     * an initializer MUST NOT be present NOR a type
     */
    private _parseVarDecl(
        flags: CommonFlags,
    ): VarDecl | undefined
    {
        const tn = this.tn;

        // ConstrName{ ... } || renamed
        const renamedField: Identifier | undefined = this.parseIdentifier();

        if(
            tn.skip( Token.OpenBrace )
        ) // ConstrName{ ... } || { ... }
        {
            const unnamed = this.parseSingleDeconstructVarDecl( flags );
            if( !unnamed ) return undefined;
            return renamedField instanceof Identifier ? 
                // ConstrName{ ... }
                NamedDeconstructVarDecl.fromSingleDeconstruct( renamedField, unnamed ) :
                // { ... }
                unnamed;
        }
        else if( tn.skip( Token.OpenBracket ) ) // [ ... ]
        {
            if( renamedField instanceof Identifier ) // renamed[ ... ] (what?)
            {
                this.error(
                    DiagnosticCode.Unexpected_token,
                    tn.range(),
                );
                return undefined;
            }
            return this.parseArrayLikeDeconstr( flags );
        }
        else if( renamedField instanceof Identifier ) // renamed
        {
            const [ explicitType, initializer ] = this._parseTypeAndInitializer();
            let range = renamedField.range;

            if( initializer ) range = SourceRange.join( range, initializer.range );
            else if( explicitType ) range = SourceRange.join( range, explicitType.range );

            return new SimpleVarDecl(
                renamedField,
                explicitType,
                initializer,
                flags,
                range
            );
        }
        else return undefined;
    }

    parseSingleDeconstructVarDecl( flags: CommonFlags ): SingleDeconstructVarDecl | undefined
    {
        const tn = this.tn;

        const initRange = tn.range();

        let elements = new Map<string, VarDecl>();
        let fieldName: Identifier | undefined = undefined;
        let element: VarDecl | undefined = undefined;
        let rest: Identifier | undefined = undefined;
        let isRest = false;
        let startRange: SourceRange | undefined = undefined
        let explicitType: PebbleAstType | undefined = undefined;
        let initializer: PebbleExpr | undefined = undefined;
        while( !tn.skip( Token.CloseBrace ) )
        {
            if( isRest )
            {
                this.error(
                    DiagnosticCode.A_rest_element_must_be_last_in_an_object_destructuring_pattern,
                    tn.range()
                );
                return undefined
            }
            
            startRange = tn.range();

            if( tn.skip(Token.Dot_Dot_Dot) ) isRest = true;

            // field
            fieldName = this.parseIdentifier( startRange )!;
            if( isRest ) {
                rest = fieldName;
                tn.skip( Token.Comma ); // skip comma if present
                continue; // checks for close brace and exits while loop
            }

            if( !fieldName ) { // (eg: { , ... }) ??
                this.error(
                    DiagnosticCode.Identifier_expected,
                    tn.range()
                );
                return undefined;
            }

            if( !tn.skip( Token.Colon ) ) // only field, with no colon (eg: { field, ... })
            {
                element = SimpleVarDecl.onlyIdentifier( fieldName, flags );
                elements.set( fieldName.name, element );
                tn.skip( Token.Comma ); // skip comma if present
                continue; // early continue to check for close brace or next field
            }            
            // else ther is colon (eg: { field: ... })

            element = this._parseVarDecl( flags );
            if( !element ) // field: ... what?
            {
                this.error(
                    DiagnosticCode.Unexpected_token,
                    tn.range()
                );
                return undefined;
            }

            if( element.initExpr )
            {
                this.error(
                    DiagnosticCode.A_field_in_a_deconstructed_declaration_cannot_have_an_initialization,
                    element.range
                );
                return undefined;
            }
            if( element.type )
            {
                this.error(
                    DiagnosticCode.A_field_in_a_deconstructed_declaration_cannot_have_an_explicit_type_did_you_mean_to_cast_using_the_as_keyword,
                    element.range
                );
                return undefined;
            }

            elements.set( fieldName.name, element );
            tn.skip( Token.Comma ); // skip comma if present
        } // while( !tn.skip( Token.CloseBrace ) )

        [ explicitType, initializer ] = this._parseTypeAndInitializer();

        return new SingleDeconstructVarDecl(
            elements,
            rest,
            explicitType,
            initializer,
            flags,
            SourceRange.join( initRange, tn.range() )
        );
    }

    parseArrayLikeDeconstr( flags: CommonFlags ): ArrayLikeDeconstr | undefined
    {
        const tn = this.tn;

        // at '[': ( VarDecl ','? )* ']' ( ':' PebbleAstType )? ( '=' PebbleExpr )?

        const startPos = tn.pos;

        const elems = new Array<VarDecl>();
        let rest: Identifier | undefined = undefined;

        while( !tn.skip( Token.CloseBracket ) )
        {
            if( tn.skip( Token.Dot_Dot_Dot ) )
            {
                if( rest )
                return this.error(
                    DiagnosticCode.A_rest_element_must_be_last_in_an_array_destructuring_pattern,
                    tn.range()
                );

                rest = this.parseIdentifier();
                if( !rest )
                return this.error(
                    DiagnosticCode.Identifier_expected,
                    tn.range()
                );

                tn.skip( Token.Comma ); // skip comma if present

                continue; // checks for close bracket
            }

            if( rest )
            return this.error(
                DiagnosticCode.A_rest_element_must_be_last_in_an_array_destructuring_pattern,
                rest.range
            );

            const elem = this._parseVarDecl( flags );
            if( !elem ) return undefined;

            if( elem.initExpr || elem.type )
            return this.error(
                DiagnosticCode.Deconstructed_elements_may_not_have_initializers_or_explicit_types,
                elem.initExpr ? elem.initExpr.range : elem.type!.range
            );

            elems.push( elem );

            if( tn.skip( Token.Comma ) ) continue;

            if( tn.skip( Token.CloseBracket ) ) break;
            else {
                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(), "]"
                );
                return undefined;
            }
        }

        const [ explicitType, initializer ] = this._parseTypeAndInitializer();

        let range = tn.range( startPos, tn.pos );

        if( initializer ) range = SourceRange.join( range, initializer.range );
        else if( explicitType ) range = SourceRange.join( range, explicitType.range );

        return new ArrayLikeDeconstr(
            elems,
            rest,
            explicitType,
            initializer,
            flags,
            range
        );
    }

    parseIdentifier(
        startRange?: SourceRange | undefined
    ): Identifier | undefined
    {
        const tn = this.tn;
        startRange = startRange ?? tn.range();
        if( tn.skipIdentifier() )
        {
            return new Identifier(
                tn.readIdentifier(),
                SourceRange.join( startRange, tn.range() )
            );
        }
        return undefined;
    }

    /**
     * parses `(: PebbleAstType)? (= PebbleExpr)?` for parameters and variable declarations
     */
    private _parseTypeAndInitializer(
        startRange: SourceRange = this.tn.range(),
        isRest: boolean = false,
    ): [ type: PebbleAstType | undefined, initializer: PebbleExpr | undefined ]
    {
        const tn = this.tn;

        let type: PebbleAstType | undefined = undefined;

        if( tn.skip(Token.Colon) ) type = this.parseType();

        if( !tn.skip(Token.Equals) ) return [ type, undefined ];

        if( isRest ){
            this.error(
                DiagnosticCode.A_rest_parameter_cannot_have_an_initializer,
                SourceRange.join( startRange, tn.range() )
            );
        }

        const init = this.parseExpr(Precedence.Comma + 1);
        return [ type, init ];
    }

    parseType(
        suppressErrors: boolean = false
    ): PebbleAstType | undefined
    {
        const tn = this.tn;

        const canError = !suppressErrors;

        const token = tn.next();
        let startPos = tn.tokenPos;

        const currRange = tn.range( startPos, tn.pos );

        switch( token )
        {
            case Token.Void: return new AstVoidType( currRange );
            // case Token.True:
            // case Token.False: 
            case Token.Boolean: return new AstBooleanType( currRange );
            case Token.Int: return new AstNumberType( currRange )
            // case Token.Number: return new AstNumberType( currRange )
            case Token.Bytes: return new AstBytesType( currRange );
            case Token.Optional: {

                if( !tn.skip( Token.LessThan ) )
                {
                    canError && this.error(
                        DiagnosticCode._0_expected,
                        currRange, "Type argument for Optional"
                    );
                    return undefined;
                }

                const tyArg = this.parseType();
                if( !tyArg ) return undefined;

                if (!tn.skip(Token.GreaterThan)) {
                    canError && this.error(
                        DiagnosticCode._0_expected,
                        tn.range(tn.pos), ">"
                    );
                    return undefined;
                }

                return new AstNativeOptionalType( tyArg, tn.range( startPos, tn.pos ) );
            }
            case Token.List: {

                if( !tn.skip( Token.LessThan ) )
                {
                    canError && this.error(
                        DiagnosticCode._0_expected,
                        currRange, "Type argument for Optional"
                    );
                    return undefined;
                }

                const tyArg = this.parseType();
                if( !tyArg ) return undefined;

                if (!tn.skip(Token.GreaterThan)) {
                    canError && this.error(
                        DiagnosticCode._0_expected,
                        tn.range(tn.pos), ">"
                    );
                    return undefined;
                }

                new AstListType( tyArg, tn.range( startPos, tn.pos ) );
            }
            case Token.LinearMap: {

                if( !tn.skip( Token.LessThan ) )
                {
                    canError && this.error(
                        DiagnosticCode._0_expected,
                        currRange, "Type argument for Optional"
                    );
                    return undefined;
                }

                const keyTy = this.parseType();
                if( !keyTy ) return undefined;

                if( !tn.skip( Token.Comma ) )
                {
                    canError && this.error(
                        DiagnosticCode._0_expected,
                        currRange, ","
                    );
                    return undefined;
                }

                const valTy = this.parseType();
                if( !valTy ) return undefined;

                if (!tn.skip(Token.GreaterThan)) {
                    canError && this.error(
                        DiagnosticCode._0_expected,
                        tn.range(tn.pos), ">"
                    );
                    return undefined;
                }

                new AstLinearMapType( keyTy, valTy, tn.range( startPos, tn.pos ) );
            }
            case Token.Identifier: {

                const name = new Identifier( tn.readIdentifier(), tn.range() );
                
                const params = new Array<PebbleAstType>();

                if( tn.skip( Token.LessThan ) )
                {
                    do {
                        const ty = this.parseType();
                        if( !ty ) return undefined;
                        params.push( ty );
                    } while( tn.skip( Token.Comma ) );

                    if( !tn.skip( Token.GreaterThan ) )
                    {
                        canError && this.error(
                            DiagnosticCode._0_expected,
                            tn.range(), ">"
                        );
                        return undefined;
                    }
                }

                return new AstNamedType(
                    name,
                    params,
                    tn.range( startPos, tn.pos )
                );
            }
            default: {
                canError && this.error(
                    DiagnosticCode.Type_expected,
                    tn.range()
                );
                return undefined;
            }
        }
    }

    parseParenthesizedExpr(
        startPos?: number | undefined
    ): ParentesizedExpr | undefined
    {
        const tn = this.tn;
        startPos = tn.range( startPos ).start;
        const inner = this.parseExpr();
        if (!inner) return undefined;
        if (!tn.skip(Token.CloseParen)) {
            this.error(
                DiagnosticCode._0_expected,
                tn.range(), ")"
            );
            return undefined;
        }
        return new ParentesizedExpr(inner, tn.range(startPos, tn.pos));
    }

    parseExpr(
        precedence: Precedence = Precedence.Comma
    ): PebbleExpr | undefined
    {
        const tn = this.tn;

        let expr: PebbleExpr = this.parseExprStart()!;
        if( !expr ) return undefined;

        const startPos = expr.range.start;

        // precedence climbing
        // see: http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm#climbing
        let nextPrecedence: Precedence;
        while(
            (nextPrecedence = determinePrecedence(tn.peek())) >= precedence
        ) {
            const token = tn.next();
            switch( token ) {
                case Token.As: {
                    if( tn.skip( Token.Const ) )
                    return this.error(
                        DiagnosticCode.Not_implemented_0,
                        tn.range(), "as const"
                    );

                    const toType = this.parseType();
                    if( !toType ) return undefined;

                    expr = new TypeConversionExpr(
                        expr,
                        toType,
                        tn.range( startPos, tn.pos )
                    );
                    break;
                }
                case Token.Exclamation: {
                    expr = new NonNullExpr(
                        expr,
                        tn.range( startPos, tn.pos )
                    );
                    expr = this.tryParseCallExprOrReturnSame( expr );
                    break;
                }
                case Token.InstanceOf: {
                    const ofType = this.parseType();
                    if( !ofType ) return undefined;
                    expr = new InstanceOfExpr(
                        expr,
                        ofType,
                        tn.range( startPos, tn.pos )
                    );
                    break;
                }
                case Token.OpenBracket: { // [ // accessing list element
                    const idxExpr = this.parseExpr();
                    if( !idxExpr ) return undefined;
                    if( !tn.skip( Token.CloseBracket ) )
                    return this.error(
                        DiagnosticCode._0_expected,
                        tn.range(), "]"
                    );
                    expr = new ElemAccessExpr(
                        expr,
                        idxExpr,
                        tn.range( startPos, tn.pos )
                    );
                    break;
                }
                case Token.Plus_Plus:
                case Token.Minus_Minus: {

                    if(!( expr instanceof Identifier ))
                    return this.error(
                        DiagnosticCode.The_operand_of_an_increment_or_decrement_operator_must_be_a_variable,
                        expr.range
                    );

                    expr = makeUnaryPostfixExpr(
                        token,
                        expr,
                        tn.range( startPos, tn.pos )
                    );

                    break;
                }
                case Token.Question: {
                    const ifTrue = this.parseExpr();
                    if( !ifTrue ) return undefined;

                    if( !tn.skip( Token.Colon ) )
                    return this.error(
                        DiagnosticCode._0_expected,
                        tn.range(), ":"
                    );

                    const ifFalse = this.parseExpr(
                        precedence > Precedence.Comma ? Precedence.Comma + 1 : Precedence.Comma
                    );
                    if( !ifFalse ) return undefined;

                    expr = new TernaryExpr(
                        expr,
                        ifTrue,
                        ifFalse,
                        tn.range( startPos, tn.pos )
                    );
                    break;
                }
                case Token.Comma: { // comma operator
                    const commaExprs = [ expr ];
                    do {
                        expr = this.parseExpr( Precedence.Comma + 1 )!;
                        if( !expr ) return undefined;
                        commaExprs.push( expr );
                    } while( tn.skip( Token.Comma ) );
                    expr = new CommaExpr(
                        commaExprs,
                        tn.range( startPos, tn.pos )
                    );
                    break;
                }
                case Token.Question_Dot:
                case Token.Exclamation_Dot:
                case Token.Dot: { // accessing property
                    let prop: Identifier | CallExpr | undefined = undefined;
                    if( tn.skipIdentifier( IdentifierHandling.Always ) )
                    {
                        prop = new Identifier(
                            tn.readIdentifier(),
                            tn.range()
                        );
                        expr = makePropAccessExpr(
                            token,
                            expr,
                            prop,
                            tn.range( startPos, tn.pos )
                        );
                        expr = this.tryParseCallExprOrReturnSame( expr );
                        break;
                    }

                    const state = tn.mark();
                    prop = this.parseExpr( Precedence.Comma + 1 ) as CallExpr | undefined;

                    if( prop instanceof CallExpr )
                    {
                        expr = this.joinPropertyCall(
                            startPos,
                            expr,
                            prop
                        )!;
                        if( !expr ) return undefined;
                        break;
                    }
                    else {
                        let errRange: SourceRange;
                        if( prop ) errRange = (prop as PebbleExpr).range;
                        else {
                            tn.reset( state );
                            errRange = tn.range();
                        }
                        return this.error(
                            DiagnosticCode.Identifier_expected,
                            errRange
                        );
                    }
                    break;
                }
                case Token.Equals:
                case Token.Plus_Equals:
                case Token.Minus_Equals:
                case Token.Asterisk_Asterisk_Equals:
                case Token.Asterisk_Equals:
                case Token.Slash_Equals:
                case Token.Percent_Equals:
                case Token.LessThan_LessThan_Equals:
                case Token.GreaterThan_GreaterThan_Equals:
                case Token.GreaterThan_GreaterThan_GreaterThan_Equals:
                case Token.Ampersand_Equals:
                case Token.Caret_Equals:
                case Token.Ampersand_Ampersand_Equals:
                case Token.Bar_Bar_Equals :
                case Token.Question_Question_Equals:
                case Token.Bar_Equals: {
                    return this.error(
                        DiagnosticCode.Assignments_are_statemetns_not_expressions,
                        tn.range()
                    );
                }
                // BinaryExpression (right associative)
                case Token.Asterisk_Asterisk: {
                    const next = this.parseExpr( nextPrecedence );
                    if( !next ) return undefined;
                    expr = makeBinaryExpr(
                        token,
                        expr,
                        next,
                        tn.range( startPos, tn.pos )
                    );
                    break;
                }
                // BinaryExpression
                case Token.LessThan:
                case Token.GreaterThan:
                case Token.LessThan_Equals:
                case Token.GreaterThan_Equals:
                case Token.Equals_Equals:
                case Token.Equals_Equals_Equals:
                case Token.Exclamation_Equals_Equals:
                case Token.Exclamation_Equals:
                case Token.Plus:
                case Token.Minus:
                case Token.Asterisk:
                case Token.Slash:
                case Token.Percent:
                case Token.LessThan_LessThan:
                case Token.GreaterThan_GreaterThan:
                case Token.GreaterThan_GreaterThan_GreaterThan:
                case Token.Ampersand:
                case Token.Bar:
                case Token.Caret:
                case Token.Ampersand_Ampersand:
                case Token.Question_Question:
                case Token.Bar_Bar:
                // case Token.In:
                {
                    const next = this.parseExpr( nextPrecedence + 1 );
                    if( !next ) return undefined;
                    expr = makeBinaryExpr(
                        token,
                        expr,
                        next,
                        tn.range( startPos, tn.pos )
                    );
                    break;
                }
                default: {
                    return this.error(
                        DiagnosticCode.Expression_expected,
                        tn.range()
                    );
                }
            }
        }

        return expr;
    }

    parseExprStart(): PebbleExpr | undefined
    {
        const tn = this.tn;
        const token = tn.next( IdentifierHandling.Prefer );
        const startPos = tn.tokenPos;

        switch (token) {

            // TODO: SpreadPebbleExpr, YieldPebbleExpr
            // case Token.Yield: 
            case Token.Dot_Dot_Dot:
            {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "SpreadPebbleExpr, YieldPebbleExpr"
                )
                return undefined;
            }

            // UnaryPrefixPebbleExpr
            case Token.Exclamation:
            case Token.Tilde:
            case Token.Plus:
            case Token.Minus:
            // case Token.TypeOf:
            // case Token.Delete:
            {
                let operand = this.parseExpr(Precedence.UnaryPrefix);
                if (!operand) return undefined;
                return makeUnaryPrefixExpr(
                    token,
                    operand,
                    tn.range(startPos, tn.pos)
                );
            }
            case Token.Plus_Plus:
            case Token.Minus_Minus: {
                let operand = this.parseExpr(Precedence.UnaryPrefix);
                if (!operand) return undefined;
                if(!(
                    operand instanceof Identifier
                    // operand instanceof ElementAccessExpr ||
                    // operand instanceof PropertyAccessExpr
                ))
                {
                    this.error(
                        DiagnosticCode.The_operand_of_an_increment_or_decrement_operator_must_be_a_variable,
                        operand.range
                    );
                }
                return makeUnaryPrefixExpr(
                    token,
                    operand,
                    tn.range(startPos, tn.pos)
                );
            }

            // Special Identifier
            case Token.Void: return new LitVoidExpr( tn.range() );
            case Token.Undefined: return new LitUndefExpr(tn.range());
            case Token.True: return new LitTrueExpr(tn.range());
            case Token.False: return new LitFalseExpr(tn.range());
            case Token.This: return new LitThisExpr(tn.range());

            // ParenthesizedPebbleExpr or FunctionPebbleExpr
            case Token.OpenParen: {
                // determine whether this is a function expression

                if (tn.skip(Token.CloseParen)) { // must be a function expression (fast route)
                    return this.parseCommonFuncExpr(
                        Identifier.anonymous(tn.range(startPos)),
                        [],
                        ArrowKind.Parenthesized
                    );
                }

                const isFunc = this.isArrowFuncOrParenExprLookahead();
                
                if (isFunc)
                    return this.parseFunctionExpr();
                else {
                    const inner = this.parseParenthesizedExpr( startPos );
                    if( !inner ) return undefined;
                    return this.tryParseCallExprOrReturnSame( inner );
                }
           }
            // ArrayLiteralPebbleExpr
            case Token.OpenBracket: {
                const elementPebbleExprs = new Array<PebbleExpr>();
                while (!tn.skip(Token.CloseBracket))
                {
                    let expr: PebbleExpr | undefined;
                    if (tn.peek() === Token.Comma) {
                        this.error(
                            DiagnosticCode.Expression_expected,
                            tn.range()
                        );
                        return undefined;
                    } else {
                        expr = this.parseExpr(Precedence.Comma + 1);
                        if (!expr) return undefined;
                    }
                 
                    elementPebbleExprs.push(expr);

                    if( tn.skip( Token.Comma ) ) continue;

                    if( tn.skip( Token.CloseBracket ) ) {
                        break;
                    } else {
                        this.error(
                            DiagnosticCode._0_expected,
                            tn.range(), "]"
                        );
                        return undefined;
                    }
                }
                return new LitArrExpr(
                    elementPebbleExprs,
                    tn.range(startPos, tn.pos)
                );
            }
            // LitObjExpr
            case Token.OpenBrace: {
                let startPos = tn.tokenPos;
                let names = new Array<Identifier>();
                let values = new Array<PebbleExpr>();
                let name: Identifier;
                while (!tn.skip(Token.CloseBrace)) {

                    if (!tn.skipIdentifier()) {
                        this.error(
                            DiagnosticCode.Identifier_expected,
                            tn.range(),
                        );
                        return undefined;
                    }
                    
                    name = new Identifier(tn.readIdentifier(), tn.range());
                    names.push(name);

                    if (tn.skip(Token.Colon))
                    {
                        let value = this.parseExpr(Precedence.Comma + 1);
                        if (!value) return undefined;
                        values.push(value);
                    }
                    else values.push(name);

                    if( tn.skip( Token.Comma ) ) continue; 

                    if( tn.skip(Token.CloseBrace) ) break;
                    else {
                        this.error(
                            DiagnosticCode._0_expected,
                            tn.range(), "}"
                        );
                        return undefined;
                    }
                }

                return new LitObjExpr(names, values, tn.range(startPos, tn.pos));
            }
            case Token.Identifier: {
                const identifierText = tn.readIdentifier();
                if (identifierText === "undefined") return new LitUndefExpr(tn.range()); // special

                const identifier = new Identifier(identifierText, tn.range(startPos, tn.pos));

                // LitNamedObjExpr
                // eg: `Identifier{ a: 1, b: 2 }`
                if( tn.peek() === Token.OpenBrace ) {
                    const endPos = tn.pos;
                    const litObjExpr = this.parseExprStart();
                    if(!( litObjExpr instanceof LitObjExpr ))
                    {
                        this.error(
                            DiagnosticCode.Object_literal_expected,
                            tn.range( identifier.range.end, endPos )
                        );
                        return undefined;
                    }

                    return new LitNamedObjExpr(
                        identifier,
                        litObjExpr.fieldNames,
                        litObjExpr.values,
                        SourceRange.join( identifier.range, litObjExpr.range )
                    );
                }

                if(
                    tn.peek() === Token.FatArrow
                    // && !tn.isNextTokenOnNewLine() // original impl had this, not sure why
                ) {
                    return this.parseCommonFuncExpr(
                        Identifier.anonymous(tn.range(startPos)),
                        [
                            SimpleVarDecl.onlyIdentifier( identifier, CommonFlags.None )
                        ],
                        ArrowKind.Single,
                        startPos
                    );
                }
                return this.tryParseCallExprOrReturnSame(identifier, true);
            }
            case Token.StringLiteral: {
                return new LitStrExpr(tn.readString(), tn.range(startPos, tn.pos));
            }
            case Token.StringTemplateLiteralQuote: {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "string template literals"
                )
                return undefined;
                // return this.parseTemplateLiteral();
            }
            case Token.IntegerLiteral: {
                const value = tn.readInteger();
                tn.checkForIdentifierStartAfterNumericLiteral();
                return new LitIntExpr(value, tn.range(startPos, tn.pos));
            }
            case Token.HexBytesLiteral: {
                return new LitHexBytesExpr(
                    tn.readHexBytes(),
                    tn.range(startPos, tn.pos)
                );
            };
            // RegexpLiteralPebbleExpr
            // note that this also continues on invalid ones so the surrounding AST remains intact
            case Token.Slash: {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "RegexpLiteralPebbleExpr"
                );
                return undefined;
                // let regexpPattern = tn.readRegexpPattern(); // also reports
                // if (!tn.skip(Token.Slash)) {
                //     this.error(
                //         DiagnosticCode._0_expected,
                //         tn.range(), "/"
                //     );
                //     return undefined;
                // }
                // return new RegexpLiteralPebbleExpr(
                //     regexpPattern,
                //     tn.readRegexpFlags(), // also reports
                //     tn.range(startPos, tn.pos)
                // );
            }
            case Token.Function: {
                const expr = this.parseFunctionExpr();
                if (!expr) return undefined;
                return this.tryParseCallExprOrReturnSame(expr);
            }
            case Token.Case: {
                const expr = this.parseCaseExpr();
                if (!expr) return undefined;
            }
            // case Token.Class: return this.parseClassPebbleExpr();
            // case Token.Struct: return this.parseStructExpr();
            default: {
                if (token === Token.EndOfFile) {
                    this.error(
                        DiagnosticCode.Unexpected_end_of_text,
                        tn.range(startPos)
                    );
                } else {
                    this.error(
                        DiagnosticCode.Expression_expected,
                        tn.range()
                    );
                }
                return undefined;
            }
        }
    }

    private joinPropertyCall(
        startPos: number,
        expr: PebbleExpr,
        call: CallExpr
    ): CallExpr | undefined
    {
        const tn = this.tn;
        let callee = call.func;
        switch( true )
        {
            case callee instanceof Identifier: return call;
            case callee instanceof CallExpr: {
                const inner = this.joinPropertyCall(
                    startPos,
                    expr,
                    callee as any as CallExpr
                );
                if( !inner ) return undefined;
                call = new CallExpr(
                    inner,
                    call.genericTypeArgs,
                    call.args,
                    tn.range( startPos, tn.pos )
                );
                break;
            }
            default: {
                return this.error(
                    DiagnosticCode.Identifier_expected,
                    call.range
                );
            }
        }
        return call;
    }

    parseCaseExpr(): CaseExpr | undefined
    {
        const tn = this.tn;
        // at 'case': Expression ('is' VarDecl '=>' Expression)+

        const startPos = tn.tokenPos;

        const expr = this.parseExpr();
        if (!expr) return undefined;

        let noPatternCaseSeen = false;
        const cases = new Array<CaseExprMatcher>();

        while( tn.skip( Token.Is ) )
        {            
            if( noPatternCaseSeen )
            return this.error(
                DiagnosticCode.This_case_will_never_be_evaluated_because_all_patterns_will_be_catched_before,
                tn.range()
            );

            const startPos = tn.tokenPos;

            const matcher = this._parseVarDecl( CommonFlags.Const );
            if( !matcher ) return undefined;

            if( matcher instanceof SimpleVarDecl ) noPatternCaseSeen = true;

            if( matcher.initExpr || matcher.type )
            return this.error(
                DiagnosticCode.Patterns_may_not_have_initializers_or_explicit_types,
                matcher.initExpr ? matcher.initExpr.range : matcher.type!.range
            );

            if( !tn.skip( Token.FatArrow ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "=>"
            );

            const body = this.parseExpr( Precedence.CaseExpr );
            if( !body ) return undefined;

            cases.push(
                new CaseExprMatcher(
                    matcher,
                    body,
                    tn.range( startPos, tn.pos )
                )
            );
        }

        const finalRange = tn.range( startPos, tn.pos );

        if( cases.length < 1 )
        return this.error(
            DiagnosticCode.A_case_expression_must_have_at_least_one_clause,
            finalRange
        );

        return new CaseExpr(
            expr,
            cases,
            finalRange
        );
    }

    parseFunctionExpr(): FuncExpr | undefined
    {
        const tn = this.tn;
        const startPos = tn.tokenPos;
        let name: Identifier | undefined = undefined;
        let arrowKind: ArrowKind = ArrowKind.None;

        // either at 'function':
        //  Identifier?
        //  '(' Parameters (':' Type)?
        //  PebbleStmt

        if (tn.token === Token.Function) {
            if (tn.skipIdentifier()) {
                name = new Identifier(tn.readIdentifier(), tn.range());
            } else { // empty name
                name = Identifier.anonymous(tn.range(tn.pos));
            }
            
            if (!tn.skip(Token.OpenParen)) {
                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(tn.pos), "("
                );
                return undefined;
            }

            // or at '(' of arrow function:
            //  Parameters (':' Type)?
            //  PebbleStmt

        } else {
            arrowKind = ArrowKind.Parenthesized;
            if(tn.token !== Token.OpenParen)
            {
                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(), "("
                );
                return undefined;
            }
            name = Identifier.anonymous(tn.range(tn.tokenPos));
        } 

        // TODO: type parameters? doesn't seem worth it.

        let signatureStart = tn.pos;
        let parameters = this.parseParameters();
        if (!parameters) return undefined;

        return this.parseCommonFuncExpr(
            name, 
            parameters, 
            arrowKind, 
            startPos, 
            signatureStart
        );
    }

    parseParameters(): VarDecl[] | undefined
    {
        const tn = this.tn;

        // at Token.OpenParen
        // (Parameter (',' Parameter)*)?
        // Token.CloseParen

        // at '(': (Parameter (',' Parameter)*)? ')'
        let parameters = new Array<VarDecl>();

        while (!tn.skip(Token.CloseParen))
        {
            let param = this.parseParameter( CommonFlags.Const );
            if (!param) return undefined;
            parameters.push(param);

            if (!tn.skip(Token.Comma))
            {
                // if not comma, then we expect no more params
                if (tn.skip(Token.CloseParen)) break;

                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(), ")"
                );
                return undefined;
            }
        }
        
        return parameters;
    }

    parseParameter( flags: CommonFlags ): VarDecl | undefined
    {
        const tn = this.tn;
        // before: Identifier '?'? (':' Type)? ('=' PebbleExpr)?

        if (tn.skip(Token.Dot_Dot_Dot)) {
            this.error(
                DiagnosticCode.A_parameter_property_cannot_be_declared_using_a_rest_parameter,
                tn.range()
            );
            return undefined;
        }

        return this._parseVarDecl( flags );
    }

    /**
     * usually called right after a function expression or access property (method) expression
     * 
     * example: the function expression parsed the identifier of the function,
     * and now we look for the "call" part of the expression 
     * 
     * ```ts
     * function foo() {}
     * 
     * // `foo` is the function expression
     * // `()` is the call part of the expression
     * foo() // <- here
     * ``` 
     */
    private tryParseCallExprOrReturnSame(
        callerExpr: PebbleExpr,
        potentiallyGeneric: boolean = false
    ): PebbleExpr {
        const tn = this.tn;
        let typeArguments: PebbleAstType[] | undefined = undefined;
        while (
            tn.skip(Token.OpenParen) ||
            potentiallyGeneric &&
            (typeArguments = this.tryParseTypeArgumentsBeforeArguments())
        ) {
            let args = this.parseArguments();
            if (!args) break;
            callerExpr = new CallExpr( // is again callable
                callerExpr,
                typeArguments,
                args,
                tn.range( callerExpr.range.start, tn.pos )
            );
            potentiallyGeneric = false;
        }
        return callerExpr;
    }

    tryParseTypeArgumentsBeforeArguments(): PebbleAstType[] | undefined
    {
        const tn = this.tn;
        // at '<': Type (',' Type)* '>' '('

        const state = tn.mark();
        if (!tn.skip(Token.LessThan)) return undefined;

        const startPos = tn.tokenPos;
        let typeArguments: PebbleAstType[] = [];
        do {
            // closing '>'
            if (tn.peek() === Token.GreaterThan) break;

            let type = this.parseType( /*suppressError*/ true );
            if( !type ) {
                tn.reset(state);
                return undefined;
            }
            
            typeArguments.push(type);
        } while( tn.skip( Token.Comma ) );

        // closing '>'
        if( !tn.skip( Token.GreaterThan ) )
        {
            tn.reset(state);
            return undefined;
        }

        let end = tn.pos;
        // next token must be '('
        // because this method is called BEFORE parsing arguments
        if( !tn.skip(Token.OpenParen) )
        {
            tn.reset(state);
            return undefined;
        }

        if( typeArguments.length <= 0 )
        {
            this.error(
                DiagnosticCode.Type_argument_list_cannot_be_empty,
                tn.range(startPos, end)
            );
            return undefined;
        }

        return typeArguments;
    }

    parseArguments(): PebbleExpr[] | undefined
    {
        const tn = this.tn;
        // at '(': (PebbleExpr (',' PebbleExpr)*)? ')'

        let args = new Array<PebbleExpr>();
        while( !tn.skip( Token.CloseParen ) )
        {
            const expr = this.parseExpr( Precedence.Comma + 1 );
            if (!expr) return undefined;
            args.push(expr);
            
            if( tn.skip( Token.Comma ) ) continue;
            
            if (tn.skip(Token.CloseParen)) break;
            
            this.error(
                DiagnosticCode._0_expected,
                tn.range(), ")"
            );
            return undefined;
        }
        return args;
    }

    private emitErrorIfInvalidAutoSemicolon(): void {
        const tn = this.tn;
        // see: https://tc39.es/ecma262/#sec-automatic-semicolon-insertion
        const nextToken = tn.peek();
        if(
            nextToken === Token.EndOfFile  ||
            nextToken === Token.CloseBrace || // } => end of block
            tn.isNextTokenOnNewLine()
        ) return undefined; // all good
        this.error(
            DiagnosticCode.Unexpected_token,
            tn.range(tn.nextTokenPos)
        );
    }

    private parseCommonFuncExpr(
        name: Identifier,
        parameters: VarDecl[],
        arrowKind: ArrowKind,
        startPos: number = -1,
        signatureStart: number = -1
    ): FuncExpr | undefined {
        const tn = this.tn;

        if (startPos < 0) startPos = name.range.start;
        if (signatureStart < 0) signatureStart = startPos;

        let returnType: PebbleAstType | undefined = undefined;
        
        // either `function ( ... )` or `( ... )`
        // BUT NOT `param =>`
        // AND there is a `:`
        // we parse the return type
        if( arrowKind !== ArrowKind.Single && tn.skip(Token.Colon) )
        {
            returnType = this.parseType();
            if (!returnType) return undefined;
        }
        // else the return type stays undefined (to infer)
        else returnType = undefined;
 
        const expectArrow = arrowKind !== ArrowKind.None;

        if(
            expectArrow &&                      // if we expect an arrow
            !tn.skip(Token.FatArrow)  // but there is none; then error 
        )
        {
            this.error(
                DiagnosticCode._0_expected,
                tn.range(tn.pos), "=>"
            );
            return undefined;
        }

        let signature = new AstFuncType(
            parameters,
            returnType,
            tn.range(signatureStart, tn.pos)
        );

        let body: BlockStmt | PebbleExpr | undefined = undefined;
        if( expectArrow )
        {
            // if `{` then block statement `() => {}`
            // else lambda `() => expr`
            body = tn.skip( Token.OpenBrace ) ?
                this.parseBlockStmt( false ) :
                // this.parseExpr( Precedence.Comma + 1 );
                this.parseExpr( Precedence.CaseExpr );
        } else {
            if (!tn.skip(Token.OpenBrace)) {
                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(tn.pos), "{"
                );
                return undefined;
            }
            body = this.parseBlockStmt( false );
        }
        if (!body) return undefined;

        let declaration = new FuncDecl(
            name,
            CommonFlags.None,
            [],
            signature,
            body,
            arrowKind,
            tn.range(startPos, tn.pos)
        );
        return new FuncExpr(declaration, declaration.range);
    }

    parseStatement(
        topLevel: boolean = false
    ): PebbleStmt | undefined
    {
        const tn = this.tn;
        // at previous token

        const state = tn.mark();
        const token = tn.next();
        let statement: PebbleStmt | undefined = undefined;
        switch (token) {
            case Token.Break: {
                statement = this.parseBreak();
                break;
            }
            case Token.Var:
            case Token.Let:
            case Token.Const: {
                statement = this.parseVarStmt( CommonFlags.Const, tn.tokenPos );
                break;
            }
            case Token.Continue: {
                statement = this.parseContinue();
                break;
            }
            case Token.Do: {
                statement = this.parseDoStatement();
                break;
            }
            case Token.For: {
                statement = this.parseForStatement();
                break;
            }
            case Token.If: {
                statement = this.parseIfStatement();
                break;
            }
            case Token.OpenBrace: {
                statement = this.parseBlockStmt( topLevel );
                break;
            }
            case Token.Return: {
                if( topLevel ) {
                    this.error(
                        DiagnosticCode.A_return_statement_can_only_be_used_within_a_function_body,
                        tn.range()
                    ); // recoverable
                }
                statement = this.parseReturn();
                break;
            }
            case Token.Test: {
                if( !topLevel )
                return this.error(
                    DiagnosticCode.A_test_can_only_be_specified_at_the_top_level_of_the_file_it_cannot_be_defined_in_functions_etc,
                    tn.range()
                );
                statement = this.parseTestStatement();
                break;
            }
            case Token.Semicolon: {
                return new EmptyStmt(tn.range(tn.tokenPos));
            }
            // case Token.Switch: {
            //     statement = this.parseSwitchStatement();
            //     break;
            // }
            case Token.Match: {
                statement = this.parseMatchStatement();
                break;
            };
            // case Token.Throw: {
            //     statement = this.parseThrowStatement();
            //     break;
            // }
            case Token.Fail: {
                statement = this.parseFailStatement();
                break;
            };
            case Token.Assert: {
                statement = this.parseAssertStatement();
                break;
            };
            // case Token.Try: {
            //     statement = this.parseTryStatement();
            //     break;
            // }
            case Token.Void: {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "void statements"
                )
                // statement = this.parseVoidStatement();
                break;
            }
            case Token.While: {
                statement = this.parseWhileStatement();
                break;
            }
            // case Token.Type: { // also identifier
            //     if (tn.peek(IdentifierHandling.Prefer) === Token.Identifier) {
            //         statement = this.parseTypeDeclaration(CommonFlags.None, tn.tokenPos);
            //         break;
            //     }
            //     // fall-through
            // }
            case Token.Equals:
            case Token.Plus_Equals:
            case Token.Minus_Equals:
            case Token.Asterisk_Asterisk_Equals:
            case Token.Asterisk_Equals:
            case Token.Slash_Equals:
            case Token.Percent_Equals:
            case Token.LessThan_LessThan_Equals:
            case Token.GreaterThan_GreaterThan_Equals:
            case Token.GreaterThan_GreaterThan_GreaterThan_Equals:
            case Token.Ampersand_Equals:
            case Token.Caret_Equals:
            case Token.Ampersand_Ampersand_Equals:
            case Token.Bar_Bar_Equals :
            case Token.Question_Question_Equals:
            case Token.Bar_Equals:
            {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "mutable variables assignmets"
                );
                break;
            }
            case Token.Identifier: {
                // const preIdState = tn.mark();
                // tn.readIdentifier();
                // const nextToken = tn.peek();
                // tn.reset(preIdState);
                // if( isAssignmentToken( nextToken ) )
                // {
                    statement = this.parseAssignmentStatement();
                    break;
                // }
                // else fall through to default
            }
            default: {
                // tn.reset(state);
                // statement = this.parseExprStmt();
                break;
            }
        }
        if( !statement ) { // has been reported
            tn.reset(state);
            this.error(
                DiagnosticCode.Statement_expected,
                tn.range()
            );
            this.skipStatement();
        } else {
            // tn.discard(state);
        }
        return statement;
    }

    parseExprStmt(): ExprStmt | undefined
    {
        const tn = this.tn;

        const startPos = tn.tokenPos;
        const expr = this.parseExpr();
        if (!expr) return undefined;
        
        return new ExprStmt(expr, tn.range(startPos, tn.pos));
    }

    parseAssignmentStatement(): AssignmentStmt | undefined
    {
        const tn = this.tn;
        const startPos = tn.tokenPos;

        if( !tn.skipIdentifier() )
        return this.error(
            DiagnosticCode.Identifier_expected,
            tn.range()
        );

        const varIdentifier = new Identifier( tn.readIdentifier(), tn.range() );
        const assignmentToken = tn.next();
        switch( assignmentToken )
        {
            case Token.Equals:
            case Token.Plus_Equals:
            case Token.Minus_Equals:
            case Token.Asterisk_Asterisk_Equals:
            case Token.Asterisk_Equals:
            case Token.Slash_Equals:
            case Token.Percent_Equals:
            case Token.LessThan_LessThan_Equals:
            case Token.GreaterThan_GreaterThan_Equals:
            case Token.GreaterThan_GreaterThan_GreaterThan_Equals:
            case Token.Ampersand_Equals:
            case Token.Caret_Equals:
            case Token.Bar_Equals:
            case Token.Ampersand_Ampersand_Equals:
            case Token.Bar_Bar_Equals :
            // case Token.Question_Question_Equals:
            {
                const expr = this.parseExpr();
                if( !expr ) return undefined;
                return makeAssignmentStmt(
                    varIdentifier,
                    assignmentToken,
                    expr,
                    tn.range( startPos, tn.pos )
                );
            }
            case Token.Question_Question_Equals: {
                return this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "??="
                )
            }
            default: {
                return this.error(
                    DiagnosticCode._0_expected,
                    tn.range(), "="
                );
            }
        }
    }


    parseBlockStmt(
        topLevel: boolean = false
    ): BlockStmt | undefined
    {
        const tn = this.tn;
        // at '{': PebbleStmt* '}' ';'?

        const startPos = tn.tokenPos;
        const statements = new Array<PebbleStmt>();

        while( !tn.skip( Token.CloseBrace ) )
        {
            let state = tn.mark();
            let statement = this.parseStatement(topLevel);
            if (!statement) {
                if (tn.token === Token.EndOfFile) return undefined;
                tn.reset(state);
                this.skipStatement();
            } else {
                statements.push(statement);
            }
        }

        let ret = new BlockStmt(statements, tn.range(startPos, tn.pos));
        if (topLevel) tn.skip(Token.Semicolon);
        return ret;
    }

    parseBreak(): BreakStmt | undefined
    {
        const tn = this.tn;
        // at 'break': Identifier? ';'?

        let identifier: Identifier | undefined = undefined;
        if (tn.peek() === Token.Identifier && !tn.isNextTokenOnNewLine()) {
            tn.next(IdentifierHandling.Prefer);
            identifier = new Identifier(tn.readIdentifier(), tn.range());
        }
        const result = new BreakStmt(identifier, tn.range());
        tn.skip(Token.Semicolon);
        return result;
    }

    parseContinue(): ContinueStmt | undefined
    {
        const tn = this.tn;
        // at 'continue': Identifier? ';'?

        let identifier: Identifier | undefined = undefined;
        if (tn.peek() === Token.Identifier && !tn.isNextTokenOnNewLine()) {
            tn.next(IdentifierHandling.Prefer);
            identifier = new Identifier(tn.readIdentifier(), tn.range());
        }
        let ret = new ContinueStmt(identifier, tn.range());
        tn.skip(Token.Semicolon);
        return ret;
    }

    parseDoStatement(): DoWhileStmt | undefined
    {
        const tn = this.tn;
        // at 'do': Statement 'while' '(' Expression ')' ';'?

        let startPos = tn.tokenPos;
        let statement = this.parseStatement();
        if (!statement) return undefined;

        if( !tn.skip( Token.While ) )
        {
            this.error(
                DiagnosticCode._0_expected,
                tn.range(), "while"
            );
            return undefined;
        }
        if( !tn.skip( Token.OpenParen ) )
        {
            this.error(
                DiagnosticCode._0_expected,
                tn.range(), "("
            );
            return undefined;
        }

        let condition = this.parseExpr();
        if (!condition) return undefined;

        if( !tn.skip( Token.CloseParen ) )
        {
            this.error(
                DiagnosticCode._0_expected,
                tn.range(), ")"
            );
            return undefined;
        }

        const result = new DoWhileStmt(
            statement,
            condition,
            tn.range(startPos, tn.pos)
        );
        tn.skip(Token.Semicolon);
        return result;
    }

    parseForStatement(): ForStmt | ForOfStmt | undefined
    {
        const tn = this.tn;
        // at 'for': '(' Statement? Expression? ';' Expression? ')' Statement

        const startPos = tn.tokenPos;

        if( !tn.skip( Token.OpenParen ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "("
        );

        let init: VarStmt | undefined = undefined;

        this.parseVarStmt
        const token = tn.peek();
        switch( token )
        {
            case Token.Let:
            case Token.Var:
            case Token.Const: {
                tn.next();
                init = this.parseVarStmt(
                    token === Token.Const ? CommonFlags.Const : CommonFlags.Let,
                    tn.tokenPos,
                    { isFor: true }
                );
                break;
            }
        }

        // for...of
        if( tn.skip( Token.Of ) )
        {
            if(!( init instanceof VarStmt ))
            return this.error(
                DiagnosticCode._0_expected,
                tn.range( startPos ), "Variable declaration"
            );

            const decls = init.declarations;
            if( decls.length !== 1 )
            return this.error(
                DiagnosticCode.Only_a_single_variable_is_allowed_in_a_for_of_statement,
                tn.range()
            );

            const decl = decls[0];
            if(
                decl.initExpr !== undefined ||
                decl.type !== undefined
            )
            {
                return this.error(
                    DiagnosticCode.The_variable_declaration_of_a_for_of_statement_cannot_have_an_initializer,
                    tn.range()
                );
            }
            
            const iterable = this.parseExpr();
            if( !iterable ) return undefined;

            if( !tn.skip( Token.CloseParen ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), ")"
            );

            const body = this.parseStatement();
            if( !body ) return undefined;

            return new ForOfStmt(
                init as VarStmt<[VarDecl]>,
                iterable,
                body,
                tn.range(startPos, tn.pos)
            );
        }

        // non for...of

        if( !tn.skip( Token.Semicolon ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), ";"
        );

        let condition: PebbleExpr | undefined = undefined;
        if( !tn.skip( Token.Semicolon ) )
        {
            condition = this.parseExpr();
            if (!condition) return undefined;

            if( !tn.skip( Token.Semicolon ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), ";"
            );
        }

        let update: PebbleExpr | undefined = undefined;
        if( !tn.skip( Token.CloseParen ) )
        {
            update = this.parseExpr();
            if (!update) return undefined;

            if( !tn.skip( Token.CloseParen ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), ")"
            );
        }

        const body = this.parseStatement();
        if( !body ) return undefined;
        
        return new ForStmt(
            init,
            condition,
            update,
            body,
            tn.range(startPos, tn.pos)
        );
    }

    parseIfStatement(): IfStmt | undefined
    {
        const tn = this.tn;
        // at 'if': '(' Expression ')' Statement ('else' Statement)?

        const startPos = tn.tokenPos;

        if( !tn.skip( Token.OpenParen ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "("
        );

        let condition = this.parseExpr();
        if (!condition) return undefined;

        if( !tn.skip( Token.CloseParen ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), ")"
        );

        let thenStatement = this.parseStatement();
        if (!thenStatement) return undefined;

        let elseStatement: PebbleStmt | undefined = undefined;
        if( tn.skip( Token.Else ) )
        {
            elseStatement = this.parseStatement();
            if (!elseStatement) return undefined;
        }

        return new IfStmt(
            condition,
            thenStatement,
            elseStatement,
            tn.range(startPos, tn.pos)
        );
    }

    parseReturn(): ReturnStmt | undefined
    {
        const tn = this.tn;
        // at 'return': Expression? ';'

        const startPos = tn.tokenPos;

        let expr: PebbleExpr | undefined = undefined;
        if(
            !tn.skip(Token.Semicolon) &&
            !tn.isNextTokenOnNewLine()
        ) {
            expr = this.parseExpr();
            if (!expr) return undefined;
            tn.skip(Token.Semicolon); // if any
        }

        return new ReturnStmt(expr, tn.range(startPos, tn.pos));
    }

    parseTestStatement(): TestStmt | undefined
    {
        const tn = this.tn;
        // at 'test': string? BlockStmt

        let testName: string | undefined = undefined;
        if( tn.skip( Token.StringLiteral ) ) testName = tn.readString();

        let body = this.parseBlockStmt( true );
        if( !body )
        return this.error(
            DiagnosticCode.Tests_must_be_specified_in_a_block_statement,
            tn.range()
        );

        return new TestStmt(
            testName,
            body,
            tn.range()
        );
    }

    parseMatchStatement(): MatchStmt | undefined
    {
        const tn = this.tn;
        // at 'match': Expression '{' MatchStmtCase* '}' ';'

        const startPos = tn.pos;

        const expr = this.parseExpr();
        if( !expr )
        return this.error(
            DiagnosticCode.Expression_expected,
            tn.range( startPos - 5, startPos)
        );

        if( !tn.skip( Token.OpenBrace ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "{"
        );

        let noPatternCaseSeen: boolean = false;
        const cases = new Array<MatchStmtCase>();
        while( !tn.skip( Token.CloseBrace ) )
        {
            if( !tn.skip( Token.When ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), "when"
            );

            // const startPos = tn.pos;
            const pattern = this._parseVarDecl( CommonFlags.Const );

            if( !pattern )
            return this.error(
                DiagnosticCode.Pattern_expected,
                tn.range()
            );

            if( noPatternCaseSeen )
            return this.error(
                DiagnosticCode.This_case_will_never_be_evaluated_because_all_patterns_will_be_catched_before,
                pattern.range
            );

            if( pattern instanceof SimpleVarDecl ) noPatternCaseSeen = true;

            if( !tn.skip( Token.Colon ) )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range(), ":"
            );

            const statePreBody = tn.mark();
            const body = this.parseStatement( false );
            if( !body )
            return this.error(
                DiagnosticCode._0_expected,
                tn.range( statePreBody.tokenPos, statePreBody.pos ), "{"
            )

            cases.push(
                new MatchStmtCase(
                    pattern,
                    body,
                    tn.range()
                )
            );
        }

        if( cases.length < 1 )
        return this.error(
            DiagnosticCode.A_match_statement_must_have_at_least_one_case,
            tn.range( startPos, tn.pos )
        );

        return new MatchStmt(
            expr,
            cases,
            tn.range( startPos, tn.pos )
        );
    }

    parseFailStatement(): FailStmt | undefined
    {
        const tn = this.tn;
        // at 'fail': Expression? ';'

        if(
            tn.skip( Token.Semicolon ) ||
            tn.isNextTokenOnNewLine()
        )
        return new FailStmt( undefined, tn.range() );

        const expr = this.parseExpr();
        if( !expr ) return undefined;
        
        return new FailStmt( expr, tn.range() );
    }

    parseAssertStatement(): AssertStmt | undefined
    {
        const tn = this.tn;

        // at 'assert': Expression (else Expression)? ';'?

        const condition = this.parseExpr();
        if( !condition )
        return this.error(
            DiagnosticCode.Expression_expected,
            tn.range()
        );

        if( !tn.skip( Token.Else ) )
        {
            tn.skip( Token.Semicolon );
            return new AssertStmt(
                condition,
                undefined, 
                tn.range()
            );
        }
    
        const message = this.parseExpr();
        if( !message )
        return this.error(
            DiagnosticCode.Expression_expected,
            tn.range()
        );

        tn.skip( Token.Semicolon );

        return new AssertStmt(
            condition,
            message,
            tn.range()
        );
    }

    parseWhileStatement(): WhileStmt | undefined
    {
        const tn = this.tn;
        // at 'while': '(' Expression ')' Statement

        const startPos = tn.tokenPos;

        if( !tn.skip( Token.OpenParen ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), "("
        );

        let condition = this.parseExpr();
        if (!condition) return undefined;

        if( !tn.skip( Token.CloseParen ) )
        return this.error(
            DiagnosticCode._0_expected,
            tn.range(), ")"
        );

        let statement = this.parseStatement();
        if (!statement)
        return this.error(
            DiagnosticCode.Statement_expected,
            tn.range()
        );

        return new WhileStmt(
            condition,
            statement,
            tn.range(startPos, tn.pos)
        );
    }
    
    /**
     * looks ahead to see if the expression
     * needs to be parsed as an arrow function or a parenthesized expression
     * 
     * @returns {boolean}
     * `true` if the expression is an arrow function,
     * `false` if it is a parenthesized expression
     */
    private isArrowFuncOrParenExprLookahead(): boolean {
        const tn = this.tn;

        // `()` makes no sense as parenthesized expression
        // it must be `() =>` or `(): Type =>`
        if (tn.skip(Token.CloseParen)) return true;

        // get back to this token before return
        const tnState = tn.mark();
        // let again = true;
        while( /* again */ true ) {
            switch( tn.next( IdentifierHandling.Prefer ) ) {

                // function expression rest parameter
                // ( ...rest ) => ...
                case Token.Dot_Dot_Dot: {
                    tn.reset(tnState);
                    return true;
                }

                // can be both parenthesized expression or function parameter
                // ( Identifier...
                case Token.Identifier: {

                    // discard identifier for now, we'll get back later
                    tn.readIdentifier();

                    switch (tn.next()) {

                        // if we got here, check for arrow
                        // ( Identifier ) ...
                        case Token.CloseParen: {

                            // `( Identifier ):Type =>` is function expression
                            if (tn.skip(Token.Colon)) {
                                let type = this.parseType( true );

                                // we got `( Identifier ):` but no type
                                // so it must be a parenthesized expression
                                // for example in a `match` statement
                                if (type === undefined) {
                                    tn.reset(tnState);
                                    return false;
                                }
                            }

                            // no arrow after `( Identifier )`
                            // so it must be a parenthesized expression
                            if (!tn.skip(Token.FatArrow)) {
                                tn.reset(tnState);
                                return false;
                            }
                            
                            // else (we met `=>`)
                            tn.reset(tnState);
                            return true;
                        }
                        // function expression
                        // type annotation
                        // ( Identifier:Type ...
                        case Token.Colon: {
                            tn.reset(tnState);
                            return true;
                        }
                        // optional parameter not supported in pebble
                        // ( Identifier? ... )
                        // likely optional prop access ( Identifier?.prop ... )
                        case Token.Question: {
                            tn.reset(tnState);
                            return false;
                        }
                        case Token.Comma: {
                            // not necessarlily a function expression
                            // ( Identifier, ...
                            // could be the `comma operator` (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comma_operator)
                            // for example in a for loop
                            // for( ...; ...; (i++, j++) )
                            break; // continue
                        }
                        // case Token.EQUALS:  // missing type annotation for simplicity
                        case Token.Equals: {
                            // not necessarlily a function expression
                            // ( Identifier = ...
                            // can still be part of a comma operator (see case Token.Comma)
                            // eg: ( myVar = somehtingElse, doStuff( myVar ) )

                            // parse (and discard) initialization expr
                            // (both comma reassignment or function parameter default value)
                            this.parseExpr(Precedence.Comma + 1);
                            break; // continue
                        }
                        // parenthesized expression
                        default: {
                            tn.reset(tnState);
                            return false;
                        }
                    }
                    break;
                }
                // parenthesized expression
                default: {
                    tn.reset(tnState);
                    return false;
                }
            }
        }

        // parse parenthesized
        tn.reset(tnState);
        return false;
    }

    /** Skips over a statement on errors in an attempt to reduce unnecessary diagnostic noise. */
    skipStatement(): void
    {
        const tn = this.tn;
        if (tn.isNextTokenOnNewLine()) tn.next(); // if reset() to the previous line
        do {
            let nextToken = tn.peek();
            if (
                nextToken === Token.EndOfFile ||   // next step should handle this
                nextToken === Token.Semicolon      // end of the statement for sure
            ) {
                tn.next();
                break;
            }
            if (tn.isNextTokenOnNewLine()) break;   // end of the statement maybe
            switch (tn.next()) {
                case Token.Identifier: {
                    tn.readIdentifier();
                    break;
                }
                case Token.StringLiteral:
                case Token.StringTemplateLiteralQuote: {
                    tn.readString();
                    break;
                }
                case Token.IntegerLiteral: {
                    tn.readInteger();
                    tn.checkForIdentifierStartAfterNumericLiteral();
                    break;
                }
                case Token.HexBytesLiteral: {
                    tn.readHexBytes();
                    break;
                };
                // case Token.FloatLiteral: {
                //     tn.readFloat();
                //     tn.checkForIdentifierStartAfterNumericLiteral();
                //     break;
                // }
                case Token.OpenBrace: {
                    this.skipBlock(tn);
                    break;
                }
            }
        } while (true);
        tn.readingTemplateString = false;
    }

    /** Skips over a block on errors in an attempt to reduce unnecessary diagnostic noise. */
    skipBlock(tn: Tokenizer): void {
        // at '{': ... '}'
        let depth = 1;
        let again = true;
        do {
            switch (tn.next()) {
                case Token.EndOfFile: {
                    this.error(
                        DiagnosticCode._0_expected,
                        tn.range(), "}"
                    );
                    again = false;
                    break;
                }
                case Token.OpenBrace: {
                    ++depth;
                    break;
                }
                case Token.CloseBrace: {
                    --depth;
                    if (!depth) again = false;
                    break;
                }
                case Token.Identifier: {
                    tn.readIdentifier();
                    break;
                }
                case Token.StringLiteral: {
                    tn.readString();
                    break;
                }
                case Token.StringTemplateLiteralQuote: {
                    tn.readString();
                    while (tn.readingTemplateString) {
                        this.skipBlock(tn);
                        tn.readString(CharCode.Backtick);
                    }
                    break;
                }
                case Token.IntegerLiteral: {
                    tn.readInteger();
                    tn.checkForIdentifierStartAfterNumericLiteral();
                    break;
                }
                case Token.HexBytesLiteral: {
                    tn.readHexBytes();
                    break;
                };
                // case Token.FloatLiteral: {
                //     tn.readFloat();
                //     tn.checkForIdentifierStartAfterNumericLiteral();
                //     break;
                // }
            }
        } while (again);
    }

    
}

const defaultParseVarOpts: ParseVarOpts = Object.freeze({
    isFor: false,
    isForOf: false,
    isParam: false
});

export interface ParseVarOpts {
    isFor: boolean;
    isForOf: boolean;
    isParam: boolean
}