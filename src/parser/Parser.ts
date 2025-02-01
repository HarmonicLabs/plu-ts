import { Identifier } from "../ast/nodes/common/Identifier";
import { NamedDeconstructVarDecl } from "../ast/nodes/VarDecl/NamedDeconstructVarDecl";
import { SingleDeconstructVarDecl } from "../ast/nodes/VarDecl/SingleDeconstructVarDecl copy";
import { DeconstructVarDecl, VarDecl } from "../ast/nodes/VarDecl/VarDecl";
import { VarStmt } from "../ast/nodes/statements/VarStmt";
import { PebbleAst } from "../ast/PebbleAst";
import { SourceKind, Source } from "../ast/Source/Source";
import { CommonFlags, LIBRARY_PREFIX, PATH_DELIMITER } from "../common";
import { DiagnosticEmitter } from "../diagnostics/DiagnosticEmitter";
import { DiagnosticMessage } from "../diagnostics/DiagnosticMessage";
import { DiagnosticCode } from "../diagnostics/diagnosticMessages.generated";
import { Token } from "../tokenizer/Token";
import { Tokenizer } from "../tokenizer/Tokenizer";
import { mangleInternalPath } from "../utils/mangleInternalPath";
import { normalizePath } from "../utils/path";
import { isNonEmpty } from "../utils/isNonEmpty";
import { PebbleExpr } from "../ast/nodes/expr/PebbleExpr";
import { SourceRange } from "../ast/Source/SourceRange";
import { SimpleVarDecl } from "../ast/nodes/VarDecl/SimpleVarDecl";
import { ArrayLikeDeconstr } from "../ast/nodes/VarDecl/ArrayLikeDeconstr";
import { PebbleType } from "../ast/nodes/types/PebbleType";
import { IdentifierHandling } from "../tokenizer/IdentifierHandling";
import { Precedence } from "./Precedence";
import { makeUnaryPrefixExpr } from "../ast/nodes/expr/unary/UnaryPrefixExpr";
import { LitUndefExpr } from "../ast/nodes/expr/litteral/LitUndefExpr";
import { LitVoidExpr } from "../ast/nodes/expr/litteral/LitVoidExpr";
import { LitFalseExpr } from "../ast/nodes/expr/litteral/LitFalseExpr";
import { LitThisExpr } from "../ast/nodes/expr/litteral/LitThisExpr";
import { LitTrueExpr } from "../ast/nodes/expr/litteral/LitTrueExpr";
import { ParentesizedExpr } from "../ast/nodes/expr/ParentesizedExpr";
import { ArrowKind } from "../ast/nodes/expr/functions/ArrowKind";
import { FuncExpr } from "../ast/nodes/expr/functions/FuncExpr";

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
    )
    {
        const normalizedPath = normalizePath(path);
        const internalPath = mangleInternalPath(normalizedPath);
    
        const kind = (
            isEntry
            ? SourceKind.UserEntry
            : path.startsWith(LIBRARY_PREFIX)
                ? path.indexOf(PATH_DELIMITER, LIBRARY_PREFIX.length) < 0
                    ? SourceKind.LibraryEntry
                    : SourceKind.Library
                : SourceKind.User
        );
    
        return Parser.parseSource(
            new Source(
                kind,
                normalizedPath,
                src
            )
        );
    }

    static parseSource(
        src: Source
    )
    {
        return new Parser(
            new Tokenizer( src )
        ).parseSource();
    }

    parseSource()
    {
        const src = this.tn.source;
        const tn = this.tn;
        let stmt: any;
        while( !tn.eof() )
        {
            stmt = this.parseTopLevelStatement();
            if( stmt )
            {
                src.statements.push( stmt );
            }
            else
            {
                this.skipStatement();
            }
        }
        return src.statements;
    }

    parseTopLevelStatement(): PebbleAst | undefined
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

        let statement: PebbleAst | undefined = undefined;
        let first = tn.peek();
        if (startPos < 0) startPos = tn.nextTokenPos;

        switch( first ) {
            case Token.Const: {
                tn.next(); // skip `const`
                flags |= CommonFlags.Const;

                if( tn.skip( Token.Enum ) ) { throw new Error("const enum not supported"); }

                statement = this.parseVarStmt( flags, startPos );
            }
        }
    }

    skipStatement()
    {

    }

    parseVarStmt(
        flags: CommonFlags,
        startPos: number,
        opts: ParseVarOpts = { isFor: false, isForOf: false }
    ): VarStmt | undefined
    {
        // at (`const` | `let` | `var`)
        // varDecl [, ...varDecl] `;`?

        const tn = this.tn;

        const decls: VarDecl[] = [];
        let decl: VarDecl | undefined = undefined;
        do {
            decl = this.parseVarDecl( flags, opts );
            if( !decl ) return undefined;
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

    parseVarDecl(
        flags: CommonFlags,
        opts: Partial<ParseVarOpts> = defaultParseVarOpts
    ): VarDecl | undefined
    {
        const tn = this.tn;
        const startRange = tn.range();

        opts = {
            ...defaultParseVarOpts,
            ...opts
        };

        const varDecl = this._parseVarDecl();
        if( !varDecl ) return undefined;

        if( !varDecl.initExpr && !opts.isParam )
        {

        }
    }

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
        flags: CommonFlags = CommonFlags.None,
    ): VarDecl | undefined
    {
        const tn = this.tn;


        // ConstrName{ ... } || renamed
        const renamedField: Identifier | undefined = this.parseIdentifier();

        if(
            tn.skip( Token.OpenBrace )
        ) // ConstrName{ ... } || { ... }
        {
            const unnamed = this.parseSingleDeconstructVarDecl();
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
            return this.parseArrayLikeDeconstr();
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
                range
            );
        }
        else return undefined;
    }

    parseSingleDeconstructVarDecl(): SingleDeconstructVarDecl | undefined
    {
        const tn = this.tn;

        const initRange = tn.range();

        let elements = new Map<string, VarDecl>();
        let fieldName: Identifier | undefined = undefined;
        let element: VarDecl | undefined = undefined;
        let rest: Identifier | undefined = undefined;
        let isRest = false;
        let startRange: SourceRange | undefined = undefined
        let flags = CommonFlags.None;
        let explicitType: PebbleType | undefined = undefined;
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
                element = SimpleVarDecl.onlyIdentifier( fieldName );
                elements.set( fieldName.name, element );
                continue; // early continue to check for close brace or next field
            }            
            // else ther is colon (eg: { field: ... })

            element = this._parseVarDecl();
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
        } // while( !tn.skip( Token.CloseBrace ) )

        [ explicitType, initializer ] = this._parseTypeAndInitializer();

        return new SingleDeconstructVarDecl(
            elements,
            rest,
            explicitType,
            initializer,
            SourceRange.join( initRange, tn.range() )
        );
    }

    parseArrayLikeDeconstr(): ArrayLikeDeconstr | undefined
    {

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
     * parses `(: PebbleType)? (= PebbleExpr)?` for parameters and variable declarations
     */
    private _parseTypeAndInitializer(
        startRange: SourceRange = this.tn.range(),
        isRest: boolean = false,
    ): [ type: PebbleType | undefined, initializer: PebbleExpr | undefined ]
    {
        const tn = this.tn;

        let type: PebbleType | undefined = undefined;

        if( tn.skip(Token.Colon) ) type = this.parseType();

        if( !tn.skip(Token.Equals) ) return [ type, undefined ];

        let initializer: PebbleExpr | undefined = undefined;

        if (isRest) {
            this.error(
                DiagnosticCode.A_rest_parameter_cannot_have_an_initializer,
                SourceRange.join( startRange, tn.range() )
            );
        }

        return [ type, this.parseExpr( Precedence.Comma + 1 ) ];
    }

    parseType(
        suppressErrors: boolean = false
    ): PebbleType | undefined
    {
        const tn = this.tn;

        const identifier = this.parseIdentifier();
        if( !identifier ) return undefined;
        return new PebbleType( identifier, identifier.range );
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

    }

    parseExprStart(): PebbleExpr | undefined
    {
        const tn = this.tn;
        const token = tn.next( IdentifierHandling.Prefer );
        const startPos = tn.tokenPos;

        switch (token) {

            // TODO: SpreadExpression, YieldExpression
            case Token.Dot_Dot_Dot:
            case Token.Yield: {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "SpreadExpression, YieldExpression"
                )
                return undefined;
            }

            // UnaryPrefixExpression
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
                        DiagnosticCode.The_operand_of_an_increment_or_decrement_operator_must_be_a_variable_or_a_property_access,
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

            // ParenthesizedExpression or FunctionExpression
            case Token.OpenParen: {
                // determine whether this is a function expression

                if (tn.skip(Token.CloseParen)) { // must be a function expression (fast route)
                    return this.parseFunctionExpressionCommon(
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
            // ArrayLiteralExpression
            case Token.OpenBracket: {
                let elementExpressions = new Array<PebbleExpr>();
                while (!tn.skip(Token.CloseBracket)) {
                    let expr: PebbleExpr | undefined;
                    if (tn.peek() === Token.Comma) {
                        expr = new OmittedExpression(tn.range(tn.pos));
                    } else {
                        expr = this.parseExpr(Precedence.Comma + 1);
                        if (!expr) return undefined;
                    }
                    elementExpressions.push(expr);
                    if (!tn.skip(Token.Comma)) {
                        if (tn.skip(Token.CloseBracket)) {
                            break;
                        } else {
                            this.error(
                                DiagnosticCode._0_expected,
                                tn.range(), "]"
                            );
                            return undefined;
                        }
                    }
                }
                return new ArrayLiteralExpression(elementExpressions, tn.range(startPos, tn.pos));
            }
            // ObjectLiteralExpression
            case Token.OpenBrace: {
                let startPos = tn.tokenPos;
                let names = new Array<Identifier>();
                let values = new Array<PebbleExpr>();
                let name: Identifier;
                while (!tn.skip(Token.CloseBrace)) {
                    if (!tn.skipIdentifier()) {
                        if (!tn.skip(Token.StringLiteral)) {
                            this.error(
                                DiagnosticCode.Identifier_expected,
                                tn.range(),
                            );
                            return undefined;
                        }
                        name = new Identifier(tn.readString(), tn.range());
                        name.isQuoted = true;
                    } else {
                        name = new Identifier(tn.readIdentifier(), tn.range());
                    }
                    names.push(name);
                    if (tn.skip(Token.Colon)) {
                        let value = this.parseExpr(Precedence.Comma + 1);
                        if (!value) return undefined;
                        values.push(value);
                    } else if (!name.isQuoted) {
                        values.push(name);
                    } else {
                        this.error(
                            DiagnosticCode._0_expected,
                            tn.range(), ":"
                        );
                        return undefined;
                    }
                    if (!tn.skip(Token.Comma)) {
                        if (tn.skip(Token.CloseBrace)) {
                            break;
                        } else {
                            this.error(
                                DiagnosticCode._0_expected,
                                tn.range(), "}"
                            );
                            return undefined;
                        }
                    }
                }
                return new ObjectLiteralExpression(names, values, tn.range(startPos, tn.pos));
            }
            // TypeAssertionExpression (unary prefix)
            case Token.LessThan: {
                let toType = this.parseType();
                if (!toType) return undefined;
                if (!tn.skip(Token.GreaterThan)) {
                    this.error(
                        DiagnosticCode._0_expected,
                        tn.range(), ">"
                    );
                    return undefined;
                }
                let expr = this.parseExpr(Precedence.Call);
                if (!expr) return undefined;
                return new TypeAssertionExpression(
                    TypeAssertionKind.Prefix,
                    expr,
                    toType,
                    tn.range(startPos, tn.pos)
                );
            }
            case Token.Identifier: {
                let identifierText = tn.readIdentifier();
                if (identifierText === "undefined") return new UndefinedExpression(tn.range()); // special
                let identifier = new Identifier(identifierText, tn.range(startPos, tn.pos));
                if (tn.skip(Token.TemplateLiteral)) {
                    return this.parseTemplateLiteral(identifier);
                }
                if (tn.peek() === Token.Equals_GreaterThan && !tn.peekOnNewLine()) {
                    return this.parseFunctionExpressionCommon(
                        Identifier.anonymous(tn.range(startPos)),
                        [
                            new VarDecl(
                                ParameterKind.Default,
                                identifier,
                                NamedTypeNode.omitted(identifier.range.atEnd()),
                                undefined,
                                identifier.range
                            )
                        ],
                        ArrowKind.Single,
                        startPos
                    );
                }
                return this.tryParseCallExprOrReturnSame(identifier, true);
            }
            case Token.StringLiteral: {
                return new StringLiteralExpression(tn.readString(), tn.range(startPos, tn.pos));
            }
            case Token.TemplateLiteral: {
                return this.parseTemplateLiteral();
            }
            case Token.IntegerLiteral: {
                let value = tn.readInteger();
                tn.checkForIdentifierStartAfterNumericLiteral();
                return new IntegerLiteralExpression(value, tn.range(startPos, tn.pos));
            }
            case Token.HexBytesLiteral: {
                return new HexBytesLiteralExpression(
                    tn.readHexBytes(),
                    tn.range(startPos, tn.pos)
                );
            };
            // RegexpLiteralExpression
            // note that this also continues on invalid ones so the surrounding AST remains intact
            case Token.Slash: {
                this.error(
                    DiagnosticCode.Not_implemented_0,
                    tn.range(), "RegexpLiteralExpression"
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
                // return new RegexpLiteralExpression(
                //     regexpPattern,
                //     tn.readRegexpFlags(), // also reports
                //     tn.range(startPos, tn.pos)
                // );
            }
            case Token.Function: {
                let expr = this.parseFunctionExpr();
                if (!expr) return undefined;
                return this.tryParseCallExprOrReturnSame(expr);
            }
            // case Token.Class: return this.parseClassExpression();
            case Token.Struct: return this.parseStructExpr();
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

    parseFunctionExpr(): FuncExpr | undefined
    {
        const tn = this.tn;
        const startPos = tn.tokenPos;
        let name: Identifier | undefined = undefined;
        let arrowKind: ArrowKind = ArrowKind.None;

        // either at 'function':
        //  Identifier?
        //  '(' Parameters (':' Type)?
        //  Statement

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
            //  Statement

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

        return this.parseFunctionExpressionCommon(
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
            let param = this.parseParameter();
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

    parseParameter(): VarDecl | undefined
    {
        const tn = this.tn;
        // before: ('public' | 'private' | 'protected' | '...')? Identifier '?'? (':' Type)? ('=' Expression)?

        let accessFlags: CommonFlags = CommonFlags.None;
        
        if (tn.skip(Token.Dot_Dot_Dot)) {
            this.error(
                DiagnosticCode.A_parameter_property_cannot_be_declared_using_a_rest_parameter,
                tn.range()
            );
            return undefined;
        }

        return this._parseVarDecl( accessFlags );
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
        expr: PebbleExpr,
        potentiallyGeneric: boolean = false
    ): PebbleExpr {
        const tn = this.tn;
        let typeArguments: PebbleType[] | undefined = undefined;
        while (
            tn.skip(Token.OpenParen) ||
            potentiallyGeneric &&
            (typeArguments = this.tryParseTypeArgumentsBeforeArguments())
        ) {
            let args = this.parseArguments();
            if (!args) break;
            expr = new CallExpression( // is again callable
                expr,
                typeArguments,
                args,
                tn.range(expr.range.start, tn.pos)
            );
            potentiallyGeneric = false;
        }
        return expr;
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

    private parseFunctionExpressionCommon(
        name: Identifier,
        parameters: VarDecl[],
        arrowKind: ArrowKind,
        startPos: number = -1,
        signatureStart: number = -1
    ): FuncExpr | undefined {
        const tn = this.tn;

        if (startPos < 0) startPos = name.range.start;
        if (signatureStart < 0) signatureStart = startPos;

        let returnType: PebbleType | undefined = undefined;
        if (arrowKind != ArrowKind.Single && tn.skip(Token.Colon)) {
            returnType = this.parseType();
            if (!returnType) return undefined;
        } else {
            returnType = NamedTypeNode.omitted(tn.range(tn.pos));
        }

        if (arrowKind) {
            if (!tn.skip(Token.Equals_GreaterThan)) {
                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(tn.pos), "=>"
                );
                return undefined;
            }
        }

        let signature = new FunctionTypeNode(
            parameters,
            returnType,
            explicitThis,
            tn.range(signatureStart, tn.pos),
            false,
        );

        let body: Statement | undefined = undefined;
        if (arrowKind) {
            if (tn.skip(Token.OpenBrace)) {
                body = this.parseBlockStatement(false);
            } else {
                let bodyExpression = this.parseExpression(Precedence.Comma + 1);
                if (bodyExpression) body = new ExpressionStatement(bodyExpression);
            }
        } else {
            if (!tn.skip(Token.OpenBrace)) {
                this.error(
                    DiagnosticCode._0_expected,
                    tn.range(tn.pos), "{"
                );
                return undefined;
            }
            body = this.parseBlockStatement(false);
        }
        if (!body) return undefined;

        let declaration = new FunctionDeclaration(
            name,
            CommonFlags.None,
            undefined,
            signature,
            body,
            arrowKind,
            tn.range(startPos, tn.pos)
        );
        return new FunctionExpression(declaration);
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
                            if (!tn.skip(Token.Equals_GreaterThan)) {
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