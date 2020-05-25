import { MasterSeed } from "./master_seed";
import { AddressStrategy } from "./address_strategy";
import { SecretShareEnvelope } from "./secret_share_envelope";

export interface RequiresSettings {
  settingsChanged: (
    masterSeed: MasterSeed,
    addressStrategy: AddressStrategy,
    baseEnvelope: SecretShareEnvelope
  ) => void;
}
