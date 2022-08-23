import ObjectUtils from "../ObjectUtils";

export default class AdditionalInfo
{
    constructor( addInfos: object )
    {
        for(let key in addInfos )
        {
            ObjectUtils.defineReadOnlyProperty(
                this,
                key,
                (addInfos as any)[key]
            )
        }
    }
}