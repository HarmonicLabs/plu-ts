import palias from "../../../PTypes/PAlias/palias";
import { int } from "../../../Term/Type/base";
import PInterval from "../Interval/PInterval";

export const PPOSIXTime = palias( int );
// export const PPOSIXTime = int;

const PPOSIXTimeRange = PInterval( PPOSIXTime.type );

export default PPOSIXTimeRange;
