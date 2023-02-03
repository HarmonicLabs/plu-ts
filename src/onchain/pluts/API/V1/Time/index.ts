import { int } from "../../../Term/Type/base";
import { palias } from "../../../PTypes/PAlias/palias";
import { PInterval } from "../Interval/PInterval";

export const PPOSIXTime = palias( int );

export const PPOSIXTimeRange = PInterval( PPOSIXTime.type );
