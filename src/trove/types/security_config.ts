import { MasterSeed } from "./master_seed";
import { AddressStrategy } from "./address_strategy";
import { SecretShareEnvelope } from "./secret_share_envelope";

export type SecurityConfig = {
  masterSeed: MasterSeed;
  addressStrategy: AddressStrategy;
  baseEnvelope: SecretShareEnvelope;
};
