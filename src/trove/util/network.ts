import { networks, Network } from "bitcoinjs-lib";

export const networkFromString = (networkString: string) => {
  if (networkString === "bitcoin") {
    return networks.bitcoin;
  } else if (networkString === "testnet") {
    return networks.testnet;
  }
  throw "(networkFromString) Unknown network: " + networkString;
};
export const networkAsString = (network: Network) => {
  if (network === networks.bitcoin) {
    return "bitcoin";
  } else if (network === networks.testnet) {
    return "testnet";
  }
  throw "(networkAsString) Unknown network: " + network;
};
