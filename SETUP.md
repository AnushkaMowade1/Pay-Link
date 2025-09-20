# PayLink Rewards System Setup

## Smart Contract Deployment

After deploying your smart contracts using the provided deployment script, you'll need to update the contract addresses in the code.

### Steps:

1. **Deploy the contracts** using the deployment script:
   \`\`\`bash
   # Run the deployment script (this will be done in the v0 environment)
   node scripts/deploy-contracts.js
   \`\`\`

2. **Update contract addresses** in `lib/rewards.ts`:
   \`\`\`typescript
   export const REWARD_CONTRACTS = {
     REWARD_TOKEN: 'YOUR_DEPLOYED_REWARD_TOKEN_ADDRESS',
     REWARD_VAULT: 'YOUR_DEPLOYED_REWARD_VAULT_ADDRESS',
   }
   \`\`\`

3. **Fund the vault** with initial SHM for redemptions (done automatically in deployment script)

4. **Add your backend/admin address** as an authorized minter in the RewardCoin contract

## Security Notes

- Contract addresses are public blockchain data and safe to include in client code
- The reward system automatically mints tokens when payments are made
- Users can redeem RWD tokens for SHM through the vault contract
- All smart contract interactions are secured by the blockchain network

## Testing

1. Make a payment to earn RWD tokens
2. Check your reward balance in the wallet tab
3. Redeem RWD tokens for SHM when you have at least 10 RWD

## Conversion Rates

- **Earning**: 10 RWD per 1 SHM sent
- **Redemption**: 100 RWD = 1 SHM (configurable by contract owner)
