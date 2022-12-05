import Epoch from "../Epoch";
import ProtocolParamters from "./ProtocolParameters";

export type ProtocolUpdateProposal = [ ProtocolParametersUpdate, Epoch ];

export default ProtocolUpdateProposal;

export type ProtocolParametersUpdate = Partial<ProtocolParamters>;