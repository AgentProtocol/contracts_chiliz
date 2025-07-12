# ContractMe - Chiliz Chain Smart Contract

A buy-in system smart contract built Chiliz Chain that implements logarithmic cost scaling and prize pool management.

## 🏟️ Features

- **Logarithmic Cost Scaling**: Buy-in costs increase using the formula `Feeₙ = BaseFee × (1 + log₂(n + 1))`
- **Prize Pool Management**: Automated prize pool accumulation with owner-controlled payouts
- **Owner Fee Structure**: 5% developer fee, 95% goes to prize pool
- **Upgradeable Parameters**: Owner can update base fees and reset costs
- **Event Logging**: Comprehensive events for frontend integration
- **Safety Mechanisms**: Built-in checks to prevent overflows and unauthorized access

## 🔧 Contract Functions

### Public Functions

| Function            | Description                       | Returns   |
| ------------------- | --------------------------------- | --------- |
| `actionCost()`      | Get current buy-in cost           | `uint256` |
| `prizePoolAmount()` | Get current prize pool balance    | `uint256` |
| `ownerFeesAmount()` | Get accumulated owner fees        | `uint256` |
| `totalBuyIns()`     | Get total number of buy-ins       | `uint256` |
| `buyIn()`           | Buy into the game (payable)       | -         |
| `fundPrizePool()`   | Add funds to prize pool (payable) | -         |

### Owner-Only Functions

| Function              | Description                            | Parameters                          |
| --------------------- | -------------------------------------- | ----------------------------------- |
| `payout()`            | Transfer prize pool funds to recipient | `address recipient, uint256 amount` |
| `withdrawOwnerFees()` | Withdraw accumulated owner fees        | -                                   |
| `resetCost()`         | Reset buy-in count to 0                | -                                   |
| `drain()`             | Transfer all funds to owner and reset  | -                                   |
| `updateBaseFee()`     | Update the base fee amount             | `uint256 newBaseFee`                |
| `transferOwnership()` | Transfer contract ownership            | `address newOwner`                  |
| `togglePause()`       | Emergency pause/unpause contract       | -                                   |

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask wallet configured for Chiliz Chain

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd contracts_chiliz
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
PRIVATE_KEY=your-private-key-here
CHILISCAN_API_KEY=your-chiliscan-api-key
```

### Development

1. **Compile contracts:**

```bash
npm run compile
```

2. **Run tests:**

```bash
npm run test
```

3. **Deploy to Spicy Testnet:**

```bash
npm run deploy:spicy
```

4. **Deploy to Chiliz Mainnet:**

```bash
npm run deploy:chiliz
```

## 📊 Cost Calculation Example

The contract uses a logarithmic formula to calculate buy-in costs:

```
Fee₁ = 2.5 CHZ × (1 + log₂(1 + 1)) = 2.5 CHZ × (1 + 1) = 5.0 CHZ
Fee₂ = 2.5 CHZ × (1 + log₂(2 + 1)) = 2.5 CHZ × (1 + 1.58) = 6.45 CHZ
Fee₃ = 2.5 CHZ × (1 + log₂(3 + 1)) = 2.5 CHZ × (1 + 2) = 7.5 CHZ
```

## 🌐 Network Configuration

### Chiliz Chain Mainnet

- **Chain ID**: 88888
- **RPC URL**: https://rpc.chiliz.com
- **Block Explorer**: https://chiliscan.com

### Spicy Testnet

- **Chain ID**: 88882
- **RPC URL**: https://spicy-rpc.chiliz.com
- **Block Explorer**: https://spicy-explorer.chiliz.com
- **Faucet**: https://spicy-faucet.chiliz.com

## 📝 Contract Events

The contract emits the following events for frontend integration:

```solidity
event BuyIn(address indexed user, uint256 cost, uint256 buyInNumber);
event PrizeFunded(address indexed funder, uint256 amount);
event Payout(address indexed recipient, uint256 amount);
event CostReset(uint256 newBuyInCount);
event ContractDrained(uint256 prizePoolAmount, uint256 ownerFeesAmount);
event BaseFeeUpdated(uint256 oldBaseFee, uint256 newBaseFee);
event OwnerFeesWithdrawn(address indexed owner, uint256 amount);
```

## 🔒 Security Features

- **Access Control**: Owner-only functions protected by `onlyOwner` modifier
- **Input Validation**: All inputs validated for zero addresses and amounts
- **Overflow Protection**: Built-in SafeMath operations
- **Payout Limits**: Payouts cannot exceed available prize pool
- **Emergency Pause**: Owner can pause contract operations if needed

## 🧪 Testing

The contract includes comprehensive tests covering:

- Deployment and initialization
- Action cost calculation
- Buy-in functionality with edge cases
- Prize pool funding
- Owner function access control
- Event emissions
- Error conditions

Run tests with:

```bash
npm run test
```

## 📋 Deployment Checklist

Before deploying to mainnet:

- [ ] Update `.env` with production private key
- [ ] Verify all contract parameters
- [ ] Run full test suite
- [ ] Deploy to Spicy testnet first
- [ ] Verify contract on block explorer
- [ ] Test all functions on testnet
- [ ] Deploy to Chiliz mainnet
- [ ] Verify mainnet contract

## 🛠️ Configuration

### Gas Settings

- **Gas Price**: 2,500 gwei (minimum for Chiliz Chain)
- **Gas Limit**: 8,000,000
- **Priority Fee**: 1 gwei minimum

### Solidity Settings

- **Version**: 0.8.23 (Chiliz Chain compatible)
- **EVM Version**: Paris (EVM version 19)
- **Optimizer**: Enabled with 200 runs

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For questions or issues:

- Create an issue in this repository
- Check the [Chiliz Chain documentation](https://docs.chiliz.com)
- Join the Chiliz community Discord

---

Built with ❤️ for the Chiliz Chain ecosystem
