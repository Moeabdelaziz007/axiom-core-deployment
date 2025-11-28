import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair, clusterApiUrl, Transaction } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Initialize Solana connection - use mainnet in production
const network = process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet';
const connection = new Connection(clusterApiUrl(network));
const STAKING_PROGRAM_ID = new PublicKey(process.env.STAKING_PROGRAM_ID || 'AX1oMst4k1ngYYYvLwNpDxPJWwVD8xZJwiHJWwK4z9pQ');
const AXIOM_MINT = new PublicKey(process.env.AXIOM_MINT || '9tc8LSnU6qQ3s4EYMK9wdbvCnwAhRZdtpG2wSvo8152w');

export async function POST(request: NextRequest) {
  try {
    const { action, amount, userPubkey } = await request.json();

    if (!action || !userPubkey) {
      return NextResponse.json(
        { error: 'Missing required fields: action, userPubkey' },
        { status: 400 }
      );
    }

    const userPublicKey = new PublicKey(userPubkey);
    console.log(`🔍 Staking action: ${action} for user: ${userPubkey}`);

    switch (action) {
      case 'getStakeInfo':
        return await getStakeInfo(userPublicKey);

      case 'stake':
        return await stakeTokens(userPublicKey, amount);

      case 'unstake':
        return await unstakeTokens(userPublicKey, amount);

      case 'deployAgent':
        return await deployAgent(userPublicKey);

      case 'undeployAgent':
        return await undeployAgent(userPublicKey);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Staking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getStakeInfo(userPublicKey: PublicKey) {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Production: Query actual on-chain stake account
      const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake_account"), userPublicKey.toBuffer()],
        STAKING_PROGRAM_ID
      );

      const stakeAccountInfo = await connection.getAccountInfo(stakeAccountPDA);

      if (!stakeAccountInfo) {
        // Account not initialized
        return NextResponse.json({
          user: userPublicKey.toBase58(),
          stakedAmount: 0,
          reputationScore: 100,
          activeAgents: 0,
          isFrozen: false,
          canDeploy: true,
          minStakeRequired: 100 * 1e9,
          accountInitialized: false
        });
      }

      // Parse stake account data (simplified for production)
      // In production, you'd use the Anchor program to deserialize this properly
      const stakeData = {
        user: userPublicKey.toBase58(),
        stakedAmount: 0, // Parse from account data
        reputationScore: 100, // Parse from account data
        activeAgents: 0, // Parse from account data
        isFrozen: false, // Parse from account data
        canDeploy: true,
        minStakeRequired: 100 * 1e9,
        accountInitialized: true
      };

      return NextResponse.json(stakeData);
    } else {
      // Development: Return mock data for testing
      const mockStakeInfo = {
        user: userPublicKey.toBase58(),
        stakedAmount: 0,
        reputationScore: 100,
        activeAgents: 0,
        isFrozen: false,
        canDeploy: true,
        minStakeRequired: 100 * 1e9,
        accountInitialized: false
      };

      return NextResponse.json(mockStakeInfo);
    }
  } catch (error) {
    console.error('Stake info error:', error);
    return NextResponse.json(
      { error: 'Failed to get stake info' },
      { status: 500 }
    );
  }
}

async function stakeTokens(userPublicKey: PublicKey, amount: number) {
  try {
    // Validate minimum stake amount
    if (amount < 100 * 1e9) {
      return NextResponse.json(
        { error: 'Minimum stake amount is 100 AXIOM tokens' },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === 'production') {
      // Production: Create actual staking transaction
      const [stakeAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake_account"), userPublicKey.toBuffer()],
        STAKING_PROGRAM_ID
      );

      // Get user's token account address
      const userTokenAccountAddress = await getAssociatedTokenAddress(
        AXIOM_MINT,
        userPublicKey
      );

      const transaction = new Transaction();

      // Check if user token account exists
      const userTokenAccountInfo = await connection.getAccountInfo(userTokenAccountAddress);
      if (!userTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPublicKey, // payer
            userTokenAccountAddress,
            userPublicKey, // owner
            AXIOM_MINT
          )
        );
      }

      // Find vault PDA
      const [vaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("axiom_vault")],
        STAKING_PROGRAM_ID
      );

      // Get vault token account address
      const vaultTokenAccountAddress = await getAssociatedTokenAddress(
        AXIOM_MINT,
        vaultPDA,
        true // allowOwnerOffCurve
      );

      // Check if vault token account exists (it should, but for safety)
      const vaultTokenAccountInfo = await connection.getAccountInfo(vaultTokenAccountAddress);
      if (!vaultTokenAccountInfo) {
        // Note: Vault account creation usually requires a payer. 
        // Here we assume user pays if it doesn't exist, or we skip if we assume it exists.
        // For safety, let's add creation instruction with user as payer
        transaction.add(
          createAssociatedTokenAccountInstruction(
            userPublicKey, // payer
            vaultTokenAccountAddress,
            vaultPDA, // owner
            AXIOM_MINT
          )
        );
      }

      // Add staking instruction (mock data for now)
      transaction.add({
        keys: [
          { pubkey: stakeAccountPDA, isSigner: false, isWritable: true },
          { pubkey: userTokenAccountAddress, isSigner: false, isWritable: true },
          { pubkey: vaultTokenAccountAddress, isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
        ],
        programId: STAKING_PROGRAM_ID,
        data: Buffer.from([0, ...amountToBuffer(amount)])
      });

      const response = {
        success: true,
        message: `Ready to stake ${amount / 1e9} AXIOM tokens`,
        transaction: transaction,
        requiresSignature: true,
        network: network
      };

      return NextResponse.json(response);
    } else {
      // Development: Mock response
      const mockResponse = {
        success: true,
        message: `Staking ${amount / 1e9} AXIOM tokens`,
        transactionSignature: 'mock_signature_' + Date.now(),
        newStakedAmount: amount,
        network: 'devnet'
      };

      return NextResponse.json(mockResponse);
    }
  } catch (error) {
    console.error('Staking error:', error);
    return NextResponse.json(
      { error: 'Failed to stake tokens' },
      { status: 500 }
    );
  }
}

// Helper function to convert amount to buffer
function amountToBuffer(amount: number): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(amount), 0);
  return buffer;
}

async function unstakeTokens(userPublicKey: PublicKey, amount: number) {
  try {
    // In a real implementation, this would:
    // 1. Check if user has active agents
    // 2. Check if stake is frozen
    // 3. Create unstake transaction
    // 4. Have user sign and send

    const mockResponse = {
      success: true,
      message: `Unstaking ${amount / 1e9} AXIOM tokens`,
      transactionSignature: 'mock_unstake_' + Date.now(),
      remainingStake: 0,
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to unstake tokens' },
      { status: 500 }
    );
  }
}

async function deployAgent(userPublicKey: PublicKey) {
  try {
    // In a real implementation, this would:
    // 1. Check if user has sufficient stake
    // 2. Check if stake is frozen
    // 3. Call deploy_agent instruction
    // 4. Update active agents count

    const mockResponse = {
      success: true,
      message: 'Agent deployed successfully',
      agentId: 'agent_' + Date.now(),
      activeAgents: 1,
      requiresStake: 100 * 1e9,
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to deploy agent' },
      { status: 500 }
    );
  }
}

async function undeployAgent(userPublicKey: PublicKey) {
  try {
    // In a real implementation, this would:
    // 1. Check if user has active agents
    // 2. Call undeploy_agent instruction
    // 3. Update active agents count

    const mockResponse = {
      success: true,
      message: 'Agent undeployed successfully',
      activeAgents: 0,
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to undeploy agent' },
      { status: 500 }
    );
  }
}