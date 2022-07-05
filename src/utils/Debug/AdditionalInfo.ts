import ObjectUtils from "../ObjectUtils";

export default class AdditionalInfo
{
    constructor( addInfos: object )
    {
        for(let key in addInfos )
        {
            ObjectUtils.defineStaticProperty(
                this,
                key,
                (addInfos as any)[key]
            )
        }
    }
}