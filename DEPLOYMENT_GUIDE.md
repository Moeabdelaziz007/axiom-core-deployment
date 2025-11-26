# 🚀 AXIOM Staking System Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the AXIOM Staking System to production, including testing, monitoring, and rollback procedures.

## Prerequisites

### System Requirements

- **Node.js** 18+ with npm
- **Solana CLI** 1.18+
- **Anchor Framework** 0.30+
- **TypeScript** 5.0+
- **Git** for version control
- **5+ SOL** for mainnet deployment fees

### Environment Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd axiom-core-deployment
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your production values
   ```

## Deployment Process

### Phase 1: Smart Contract Deployment

#### 1.1 Deploy Staking Program to Mainnet

```bash
# Deploy staking program to mainnet
npm run deploy:staking
```

**Expected Output:**
- Program ID deployed to mainnet
- Vault PDA initialized
- Deployment info saved to `deployment-staking-mainnet.json`

#### 1.2 Verify Program Deployment

```bash
# Check program on mainnet
solana program show <PROGRAM_ID> --url mainnet-beta
```

**Verification Checklist:**
- [ ] Program ID is visible on mainnet
- [ ] Vault PDA is created and owned by program
- [ ] Program is immutable (if required)
- [ ] Deployment info saved correctly

### Phase 2: Frontend Deployment

#### 2.1 Build Frontend for Production

```bash
# Build frontend application
npm run build
```

#### 2.2 Deploy Frontend

```bash
# Deploy to production
npm run deploy:prod
```

**Deployment Checklist:**
- [ ] Frontend builds successfully
- [ ] Environment variables configured
- [ ] API endpoints updated for mainnet
- [ ] Static assets optimized
- [ ] HTTPS configured

### Phase 3: Testing & Validation

#### 3.1 Security Audit

```bash
# Run comprehensive security audit
npm run audit:security
```

**Security Audit Checklist:**
- [ ] Program ownership verified
- [ ] Vault PDA security confirmed
- [ ] Access controls implemented
- [ ] Input validation working
- [ ] No critical vulnerabilities found

#### 3.2 End-to-End Testing

```bash
# Run comprehensive E2E tests
npm run test:e2e
```

**E2E Test Checklist:**
- [ ] Stake account initialization
- [ ] Token staking functionality
- [ ] Agent deployment with staking
- [ ] Token unstaking
- [ ] Agent undeployment
- [ ] Freeze mechanism
- [ ] All tests pass

#### 3.3 Production Monitoring

```bash
# Start production monitoring
npm run monitor:prod
```

**Monitoring Checklist:**
- [ ] Health checks configured
- [ ] Performance metrics collected
- [ ] Security events monitored
- [ ] Alert system active
- [ ] Dashboard accessible

## Configuration

### Environment Variables

Create `.env.production` with the following variables:

```bash
# AI Configuration
GEMINI_API_KEY=your_production_gemini_api_key

# Solana Configuration
SOLANA_NETWORK=mainnet-beta
SOLANA_PRIVATE_KEY=your_production_mainnet_private_key
SOLANA_PUBLIC_KEY=your_production_mainnet_public_key

# Helius RPC Configuration
HELIUS_RPC_URL=https://rpc.helius.xyz/?api-key=your_production_helius_key
HELIUS_API_KEY=your_production_helius_key

# AXIOM Staking Configuration
AXIOM_TOKEN_MINT=your_axiom_token_mint_address
STAKING_PROGRAM_ID=your_staking_program_id
VAULT_PDA_ADDRESS=your_vault_pda_address

# Google Cloud Configuration
GOOGLE_CLOUD_API_KEY=your_production_google_cloud_api_key

# Production Monitoring
SENTRY_DSN=your_sentry_dsn_for_error_tracking
LOG_LEVEL=warn
```

### Network Configuration

#### Solana Mainnet
- **RPC URL**: `https://api.mainnet-beta.solana.com`
- **Network**: `mainnet-beta`
- **Commitment**: `confirmed`

#### Helius RPC (Recommended)
- **URL**: `https://rpc.helius.xyz/?api-key=YOUR_KEY`
- **Benefits**: Faster response times, reliability
- **Features**: Enhanced indexing, webhooks

## Monitoring & Alerting

### Health Monitoring

The system includes comprehensive monitoring:

- **System Health**: Overall system status
- **Component Health**: Individual component status
- **Performance Metrics**: Response times, resource usage
- **Security Events**: Unusual activity detection
- **Alert Management**: Real-time notifications

### Monitoring Dashboard

Access monitoring data at:
- **API Endpoint**: `/api/monitoring`
- **Health Status**: `/api/monitoring?type=health`
- **Metrics**: `/api/monitoring?type=metrics`
- **Alerts**: `/api/monitoring?type=alerts`

### Alert Levels

- **INFO**: Informational messages
- **WARNING**: Performance degradation
- **ERROR**: Component failures
- **CRITICAL**: System-wide issues

## Rollback Procedures

### Creating Rollback Points

```bash
# Create rollback point before deployment
npm run rollback:create staking-program "Pre-deployment backup"
```

### Executing Rollbacks

```bash
# Execute specific rollback
npm run rollback:execute rb_1234567890

# Emergency rollback to last good state
npm run rollback:emergency

# List available rollback points
npm run rollback:list
```

### Recovery Options

- **Staking Program Recovery**: Restore previous program version
- **Frontend Recovery**: Revert to previous commit
- **Configuration Recovery**: Restore from backup files

## Security Considerations

### Private Key Management

1. **Secure Storage**
   - Use hardware wallet for mainnet
   - Store private keys offline
   - Never commit keys to version control

2. **Access Control**
   - Limit mainnet access to authorized personnel
   - Use multi-signature for critical operations
   - Rotate keys regularly

3. **Environment Security**
   - Use environment variables for secrets
   - Enable audit logging
   - Monitor for unauthorized access

### Smart Contract Security

1. **Program Verification**
   - Verify program source matches deployed bytecode
   - Check program authority settings
   - Validate PDA derivations

2. **Vault Security**
   - Confirm vault is program-owned
   - Verify vault cannot be drained
   - Test freeze mechanism

3. **Access Controls**
   - Validate user permissions
   - Check minimum stake requirements
   - Test freeze authority

## Performance Optimization

### Frontend Optimization

1. **Bundle Size**
   - Target: < 250KB (gzipped)
   - Use code splitting
   - Optimize imports

2. **Loading Performance**
   - Target: < 2 seconds LCP
   - Use lazy loading
   - Optimize images

3. **API Performance**
   - Target: < 500ms response time
   - Use caching
   - Implement rate limiting

### Blockchain Optimization

1. **Transaction Efficiency**
   - Minimize compute units
   - Optimize account lookups
   - Batch operations when possible

2. **RPC Optimization**
   - Use Helius for production
   - Implement connection pooling
   - Cache frequently accessed data

## Troubleshooting

### Common Issues

#### Deployment Failures

**Issue**: Program deployment fails
```
Solution:
1. Check SOL balance (minimum 5 SOL required)
2. Verify network configuration
3. Check Anchor framework version
4. Review program code for errors
```

**Issue**: Frontend build fails
```
Solution:
1. Check Node.js version (18+ required)
2. Clear npm cache: npm cache clean --force
3. Delete .next directory: rm -rf .next
4. Check for TypeScript errors
```

#### Runtime Issues

**Issue**: Staking transactions fail
```
Solution:
1. Check user token balance
2. Verify program is deployed correctly
3. Check RPC endpoint connectivity
4. Review transaction logs for errors
```

**Issue**: Monitoring alerts not working
```
Solution:
1. Check environment variables
2. Verify monitoring service is running
3. Check alert configuration
4. Review monitoring logs
```

## Maintenance

### Regular Maintenance Tasks

1. **Daily**
   - Check system health
   - Review error logs
   - Monitor performance metrics
   - Verify backup completion

2. **Weekly**
   - Update dependencies
   - Review security scan results
   - Test rollback procedures
   - Clean old logs

3. **Monthly**
   - Security audit
   - Performance optimization
   - Documentation updates
   - Capacity planning

## Support

### Emergency Contacts

- **Technical Lead**: [Contact Information]
- **DevOps Team**: [Contact Information]
- **Security Team**: [Contact Information]

### Documentation

- **API Reference**: `/docs/api`
- **User Guide**: `/docs/user-guide`
- **Troubleshooting**: `/docs/troubleshooting`
- **Security Guide**: `/docs/security`

## Conclusion

Following this deployment guide ensures:
- ✅ Secure and reliable deployment
- ✅ Comprehensive testing
- ✅ Production monitoring
- ✅ Quick rollback capabilities
- ✅ Ongoing maintenance procedures

The AXIOM Staking System is designed for production reliability with built-in security and monitoring capabilities.

---

*Last Updated: November 2025*
*Version: 1.0.0*