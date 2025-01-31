import { AstNodeKind } from "./AstNodeKind";
import { TypeAssertionExpression } from "./nodes/expressions/TypeAssertionExpression";
import { BinaryExpression } from "./nodes/expressions/BinaryExpression";
import { CallExpression } from "./nodes/expressions/CallExpression";
import { ClassExpression } from "./nodes/expressions/ClassExpression";
import { CommaExpression } from "./nodes/expressions/CommaExpression";
import { ConstructorExpression } from "./nodes/expressions/ConstructorExpression";
import { ElementAccessExpression } from "./nodes/expressions/ElementAccessExpression";
import { FunctionExpression } from "./nodes/expressions/FunctionExpression";
import { IdentifierExpression } from "./nodes/expressions/IdentifierExpression";
import { InstanceOfExpression } from "./nodes/expressions/InstanceOfExpression";
import { ArrayLiteralExpression, LiteralExpression } from "./nodes/expressions/LitteralExpression";
import { NewExpression } from "./nodes/expressions/NewExpression";
import { OmittedExpression } from "./nodes/expressions/OmittedExpression";
import { ParenthesizedExpression } from "./nodes/expressions/ParentesizedExpression";
import { PropertyAccessExpression } from "./nodes/expressions/PropertyAccessExpression";
import { TernaryExpression } from "./nodes/expressions/TernaryExpression";
import { UnaryExpression } from "./nodes/expressions/UnaryExpression";
import { CommentAst } from "./nodes/extra/CommentAst";
import { SourceRange } from "./nodes/Source/SourceRange";
import { BlockStatement } from "./nodes/statements/BlockStatement";
import { BreakStatement } from "./nodes/statements/BreakStatement";
import { ContinueStatement } from "./nodes/statements/ContinueStatement";
import { DeclarationStatement, FunctionDeclaration } from "./nodes/statements/DeclarationStatement";
import { DoStatement } from "./nodes/statements/DoStatement";
import { EmptyStatement } from "./nodes/statements/EmptyStatement";
import { ExportImportStatement } from "./nodes/statements/ExportImportStatement";
import { ExportStatement } from "./nodes/statements/ExportStatement";
import { ExpressionStatement } from "./nodes/statements/ExpressionStatement";
import { FailStatement } from "./nodes/statements/FailStatement";
import { ForOfStatement } from "./nodes/statements/ForOfStatement";
import { ForStatement } from "./nodes/statements/ForStatement";
import { IfStatement } from "./nodes/statements/IfStatement";
import { ImportStatement } from "./nodes/statements/ImportStatement";
import { MatchStatement } from "./nodes/statements/MatchSatement";
import { ReturnStatement } from "./nodes/statements/ReturnStatement";
import { VariableDeclaration } from "./nodes/statements/VariableLikeDeclarationStatement";
import { VariableStatement } from "./nodes/statements/VariableStatement";
import { VoidStatement } from "./nodes/statements/VoidStatement";
import { WhileStatement } from "./nodes/statements/WhileStatement";
import { FunctionTypeNode } from "./nodes/types/FunctionTypeNode";
import { NamedTypeNode } from "./nodes/types/NamedType";
import { TypeName } from "./nodes/types/TypeName";
import { TypeParameterNode } from "./nodes/types/TypeParameterNode";
import { AssertStatement } from "./nodes/statements/AssertStatement";

export interface IAstNode {
    kind: AstNodeKind;
    range: SourceRange;
}

export interface IExpression extends IAstNode {}

export interface IStatement extends IAstNode {}

export interface ITypeAstNode extends IAstNode
{
    isNullable: boolean;
    currentlyResolving: boolean;
    hasGenericComponent(typeParameterNodes: TypeParameterNode[]): boolean;
}

export type Statement
    = BlockStatement
    | BreakStatement
    | DeclarationStatement | FunctionDeclaration
    | ForOfStatement
    | ForStatement
    | IfStatement
    | ImportStatement
    | ReturnStatement
    | VariableDeclaration
    | VariableStatement
    | WhileStatement
    | ExpressionStatement
    | EmptyStatement
    | DoStatement
    | ContinueStatement
    | VoidStatement
    | ExportImportStatement
    | ExportStatement
    | MatchStatement
    | FailStatement
    | AssertStatement
    
export type Expression
    = TypeAssertionExpression
    | BinaryExpression
    | CallExpression
    | ClassExpression
    | CommaExpression
    | ConstructorExpression
    | ElementAccessExpression
    | FunctionExpression
    | IdentifierExpression
    | InstanceOfExpression
    | LiteralExpression | ArrayLiteralExpression
    | NewExpression
    | ParenthesizedExpression
    | PropertyAccessExpression
    | TernaryExpression
    | UnaryExpression
    | OmittedExpression

export type GenericTypeNode
    = NamedTypeNode
    | FunctionTypeNode

export type TypeNode
    = GenericTypeNode
    // | TypeName
    | TypeParameterNode;

export type AstNode
    = Statement
    | Expression
    | TypeNode
    | CommentAst;
