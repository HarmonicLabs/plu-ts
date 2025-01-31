import { COLOR_CYAN, COLOR_MAGENTA, COLOR_RED, COLOR_YELLOW } from "../utils/terminal";

/** Indicates the category of a {@link DiagnosticMessage}. */
export enum DiagnosticCategory {
    /** Overly pedantic message. */
    Pedantic,
    /** Informatory message. */
    Info,
    /** Warning message. */
    Warning,
    /** Error message. */
    Error
};
Object.freeze(DiagnosticCategory);

/** Returns the string representation of the specified diagnostic category. */
export function diagnosticCategoryToString(category: DiagnosticCategory): string {
    switch (category) {
        case DiagnosticCategory.Pedantic: return "PEDANTIC";
        case DiagnosticCategory.Info: return "INFO";
        case DiagnosticCategory.Warning: return "WARNING";
        case DiagnosticCategory.Error: return "ERROR";
        default: {
            throw new Error(`Unexpected diagnostic category: ${category} ${DiagnosticCategory[category]}`);
        }
    }
}

/** Returns the ANSI escape sequence for the specified category. */
export function diagnosticCategoryToColor(category: DiagnosticCategory): string {
    switch (category) {
        case DiagnosticCategory.Pedantic: return COLOR_MAGENTA;
        case DiagnosticCategory.Info: return COLOR_CYAN;
        case DiagnosticCategory.Warning: return COLOR_YELLOW;
        case DiagnosticCategory.Error: return COLOR_RED;
        default: {
            throw new Error(`Unexpected diagnostic category: ${category} ${DiagnosticCategory[category]}`);
        }
    }
}

export type DiagnosticCode = number;
