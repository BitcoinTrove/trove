export class AddressStrategy {
  private strategyName: string;
  private addressCount: number;

  private constructor(strategyName: string, addressCount: number) {
    this.strategyName = strategyName;
    this.addressCount = addressCount;
  }

  public getStrategyName() {
    return this.strategyName;
  }

  public getAddressCount() {
    return this.addressCount;
  }

  public isSingle() {
    return this.addressCount === 1;
  }

  public isMultiple() {
    return this.addressCount > 1;
  }

  public static fromStrategyName(strategyName: string) {
    if (strategyName === "single") {
      return new AddressStrategy(strategyName, 1);
    } else if (strategyName === "multiplePrinted") {
      return new AddressStrategy(strategyName, 20);
    } else if (strategyName === "multipleRandom") {
      return new AddressStrategy(strategyName, 100000);
    }
    throw "Unknown address strategy, " + strategyName;
  }
}
