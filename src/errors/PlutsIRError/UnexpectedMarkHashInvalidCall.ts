import { PlutsIRError } from ".";

export class UnexpectedMarkHashInvalidCall extends PlutsIRError
{
    constructor( nodeName?: string )
    {
        const msg = typeof nodeName === "string" ? 
            "unexpected 'markHashInvalid' call; " +
            "it should be impossible for a '"+ nodeName +
            "' node to have changes" :
            "unexpected 'markHashInvalid' call;"

        super( msg )
    }
}