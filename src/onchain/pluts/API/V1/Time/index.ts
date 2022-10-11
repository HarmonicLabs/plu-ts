import { int } from "../../../Term/Type";
import PInterval from "../Interval";

// const PPOSIXTime = palias( int );
export const PPOSIXTime = int;

const PPOSIXTimeRange = PInterval( PPOSIXTime );

export default PPOSIXTimeRange;
