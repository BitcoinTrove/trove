import { createTroveClean } from "../../platform/util/duplication";
import { sha256 } from "../../platform/util/checksum";

export const TROVE_VERSION = "0.0.2-alpha";
export const TROVE_VERSION_AND_HASH =
  TROVE_VERSION + " (" + sha256(createTroveClean()) + ")";
