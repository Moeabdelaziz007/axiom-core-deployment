use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, SetAuthority, Token, TokenAccount, Transfer};

declare_id!("AX1oMst4k1ngYYYvLwNpDxPJWwVD8xZJwiHJWwK4z9pQ");

#[program]
pub mod axiom_staking {
    use super::*;

    // 1. Initialize stake account for user (first time)
    pub fn initialize_stake_account(ctx: Context<InitializeStake>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.owner = ctx.accounts.user.key();
        stake_account.staked_amount = 0;
        stake_account.reputation_score = 100; // Reputation starts at 100
        stake_account.last_update = Clock::get()?.unix_timestamp;
        stake_account.active_agents = 0;
        stake_account.is_frozen = false;
        stake_account.frozen_at = None;
        Ok(())
    }

    // 2. Stake tokens: Transfer tokens from user to vault
    pub fn stake_tokens(ctx: Context<StakeTokens>, amount: u64) -> Result<()> {
        // Transfer tokens
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        // Update stake account
        let stake_account = &mut ctx.accounts.stake_account;
        stake_account.staked_amount += amount;
        stake_account.last_update = Clock::get()?.unix_timestamp;

        msg!("Staked {} AXIOM tokens. New Balance: {}", amount, stake_account.staked_amount);
        Ok(())
    }

    // 3. Unstake tokens: Withdraw tokens
    pub fn unstake_tokens(ctx: Context<UnstakeTokens>, amount: u64) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;

        // Check balance
        require!(stake_account.staked_amount >= amount, StakingError::InsufficientFunds);

        // Check if stake is frozen
        require!(!stake_account.is_frozen, StakingError::StakeFrozen);

        // Check lock period (can't unstake if active agents exist)
        require!(stake_account.active_agents == 0, StakingError::ActiveAgentsExist);

        // Sign with PDA (vault owned by program)
        let bump = *ctx.bumps.get("vault_token_account").unwrap();
        let seeds = &[b"axiom_vault".as_ref(), &[bump]];
        let signer = &[&seeds[..]];

        // Transfer tokens from vault to user
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_token_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new_with_signer(cpi_program, cpi_accounts, signer), amount)?;

        // Update balance
        stake_account.staked_amount -= amount;

        msg!("Unstaked {} AXIOM tokens.", amount);
        Ok(())
    }

    /// Freeze stake for poor agent performance (Jail mechanism)
    /// Requires governance review before any slashing occurs
    pub fn freeze_stake(ctx: Context<FreezeStake>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;

        // Check if stake is already frozen
        require!(!stake_account.is_frozen, StakingError::StakeAlreadyFrozen);

        // Freeze the stake (prevents unstaking, deployment)
        stake_account.is_frozen = true;
        stake_account.frozen_at = Some(Clock::get()?.unix_timestamp);

        msg!("Stake frozen for governance review");
        Ok(())
    }

    // Deploy agent - increment active agents counter
    pub fn deploy_agent(ctx: Context<DeployAgent>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;

        // Check minimum stake for agent deployment
        require!(stake_account.staked_amount >= 100 * 10u64.pow(9), StakingError::InsufficientStakeForAgent);

        // Check if stake is frozen
        require!(!stake_account.is_frozen, StakingError::StakeFrozen);

        stake_account.active_agents += 1;
        msg!("Agent deployed. Active agents: {}", stake_account.active_agents);
        Ok(())
    }

    // Undeploy agent - decrement active agents counter
    pub fn undeploy_agent(ctx: Context<UndeployAgent>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;

        require!(stake_account.active_agents > 0, StakingError::NoActiveAgents);
        stake_account.active_agents -= 1;
        msg!("Agent undeployed. Active agents: {}", stake_account.active_agents);
        Ok(())
    }
}
// Initialize vault for centralized token storage
pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
    msg!("Vault initialized successfully");
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [b"axiom_vault"],
        bump,
        token::mint = mint,
        token::authority = vault_token_account, // The PDA is its own authority
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>, // AXIOM token mint
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// --- Data Structures (Haikal al-Bayanat) ---

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,        // 32
    pub staked_amount: u64,   // 8
    pub reputation_score: u16,// 2 (0-65535)
    pub last_update: i64,     // 8
    pub active_agents: u8,    // 1 (how many agents currently running)
    pub is_frozen: bool,      // 1 (frozen for governance review)
    pub frozen_at: Option<i64>, // 9 (when frozen)
}

#[derive(Accounts)]
pub struct InitializeStake<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8 + 2 + 8 + 1 + 1 + 9)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"axiom_vault"],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"axiom_vault"],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FreezeStake<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeployAgent<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct UndeployAgent<'info> {
    #[account(mut)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[error_code]
pub enum StakingError {
    #[msg("Insufficient staked funds.")]
    InsufficientFunds,
    #[msg("Stake is frozen.")]
    StakeFrozen,
    #[msg("Cannot unstake while agents are active.")]
    ActiveAgentsExist,
    #[msg("Stake already frozen.")]
    StakeAlreadyFrozen,
    #[msg("Insufficient stake for agent deployment.")]
    InsufficientStakeForAgent,
    #[msg("No active agents to undeploy.")]
    NoActiveAgents,
}