import palias from "../../../PTypes/PAlias";
import { int } from "../../../Term/Type";
import PInterval from "../Interval";

export const PPOSIXTime = palias( int );
// export const PPOSIXTime = int;

const PPOSIXTimeRange = PInterval( PPOSIXTime.type );

export default PPOSIXTimeRange;
