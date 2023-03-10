import { HoistedSourceUID } from ".";

export function genHoistedSourceUID(): HoistedSourceUID
{
    return Symbol() as any
}