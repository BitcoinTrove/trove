export interface SecretShareEnvelope {
  version: number;
  codeVersion: string;
  numberOfShares: number;
  numberOfRequiredShares: number;
  shareNames: string[];
  shareEnvelopeChecksums?: string[];
  thisSharesIndex: number;
  shareId: string;
  shareIds: string[];
  referenceName: string;
  addressStrategy: string;
  creationDate: string;
  shareData: string;
  tags: object;
  network: string;
  custodian: string;
  message: string;
  messageAfterRevealing: string;
  slip39PasswordHash?: string;
}
