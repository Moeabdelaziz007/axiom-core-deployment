use anchor_lang::prelude::*;
use anchor_spl::token::{self::Mint, TokenAccount};

declare_id!("AXIOM_MARKETPLACE");

#[program]
pub mod errors {
    #[error_code]
    pub enum MarketplaceError {
        #[msg("Unauthorized access")]
        Unauthorized,
        #[msg("Insufficient funds")]
        InsufficientFunds,
        #[msg("Invalid listing")]
        InvalidListing,
        #[msg("Listing not active")]
        ListingNotActive,
        #[msg("Transaction already completed")]
        TransactionAlreadyCompleted,
        #[msg("Invalid escrow state")]
        InvalidEscrowState,
        #[msg("Refund period not elapsed")]
        RefundPeriodNotElapsed,
        #[msg("Invalid dispute status")]
        InvalidDisputeStatus,
    }
}

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub bump: u64,
}

#[account]
pub struct AgentListing {
    pub seller: Pubkey,
    pub mint: Pubkey, // NFT representing the agent
    pub price: u64, // Price in lamports
    pub rent_price: Option<u64>, // Hourly rental price in lamports
    pub currency: Currency,
    pub status: ListingStatus,
    pub created_at: i64,
    pub escrow_account: Option<Pubkey>, // Holds funds during transaction
    pub bump: u64,
}

#[account]
pub struct Transaction {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub listing: Pubkey,
    pub amount: u64,
    pub currency: Currency,
    pub status: TransactionStatus,
    pub created_at: i64,
    pub completed_at: Option<i64>,
    pub escrow_release_time: i64, // When escrow can be released
    pub dispute_deadline: i64, // Deadline for filing disputes
    pub bump: u64,
}

#[account]
pub struct Escrow {
    pub transaction: Pubkey,
    pub amount: u64,
    pub currency: Currency,
    pub status: EscrowStatus,
    pub release_time: i64,
    pub bump: u64,
}

#[account]
pub struct Dispute {
    pub transaction: Pubkey,
    pub complainant: Pubkey,
    pub respondent: Pubkey,
    pub reason: String,
    pub status: DisputeStatus,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
    pub resolution: Option<String>,
    pub bump: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Currency {
    SOL,
    USDC,
    AXIOM,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ListingStatus {
    Active,
    Sold,
    Delisted,
    Paused,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TransactionStatus {
    Pending,
    Completed,
    Failed,
    Cancelled,
    Refunded,
    Disputed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowStatus {
    Active,
    Released,
    Refunded,
    Disputed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DisputeStatus {
    Filed,
    UnderReview,
    Resolved,
    Dismissed,
}

#[derive(Account)]
pub struct UserTokenAccount<'info> {
    #[account(init)]
    pub token_account: TokenAccount<'info>,
}

#[event]
pub struct ListingCreated {
    pub seller: Pubkey,
    pub listing: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub currency: Currency,
}

#[event]
pub struct TransactionInitiated {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub listing: Pubkey,
    pub transaction: Pubkey,
    pub amount: u64,
    pub currency: Currency,
}

#[event]
pub struct TransactionCompleted {
    pub transaction: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub currency: Currency,
}

#[event]
pub struct EscrowReleased {
    pub transaction: Pubkey,
    pub amount: u64,
    pub currency: Currency,
}

#[event]
pub struct DisputeFiled {
    pub transaction: Pubkey,
    pub complainant: Pubkey,
    pub respondent: Pubkey,
    pub reason: String,
}

#[event]
pub struct DisputeResolved {
    pub transaction: Pubkey,
    pub resolution: String,
}

#[error_code]
pub const MARKETPLACE_SEED: u8 = b'marketplace';
#[error_code]
pub const AGENT_LISTING_SEED: u8 = b'agent_listing';
#[error_code]
pub const TRANSACTION_SEED: u8 = b'transaction';
#[error_code]
pub const ESCROW_SEED: u8 = b'escrow';
#[error_code]
pub const DISPUTE_SEED: u8 = b'dispute';

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(mut, seeds = [MARKETPLACE_SEED, AUTHORITY_SEED])]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, seeds = [AGENT_LISTING_SEED, seller.key()])]
    pub listing: Account<'info, AgentListing>,
    #[account(mut, seeds = [ESCROW_SEED, listing.key()])]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account()]
    pub system_program: Program<'info, System>,
    #[account()]
    pub token_program: Program<'info, Token>,
    #[account()]
    pub agent_mint: Account<'info, Mint<'info>>,
    #[account()]
    pub seller_token_account: Account<'info, TokenAccount<'info>>,
    pub rent: Signer<'info>,
}

#[derive(Accounts)]
pub struct PurchaseAgent<'info> {
    #[account(mut, seeds = [MARKETPLACE_SEED, AUTHORITY_SEED])]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, seeds = [AGENT_LISTING_SEED, listing.seller.key(), listing.key()])]
    pub listing: Account<'info, AgentListing>,
    #[account(mut, seeds = [ESCROW_SEED, listing.key()])]
    pub escrow: Account<'info, Escrow>,
    #[account(mut, seeds = [TRANSACTION_SEED, buyer.key(), listing.key()])]
    pub transaction: Account<'info, Transaction>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub seller: Account<'info, System>,
    #[account()]
    pub system_program: Program<'info, System>,
    #[account()]
    pub token_program: Program<'info, Token>,
    #[account()]
    pub agent_mint: Account<'info, Mint<'info>>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount<'info>>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount<'info>>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount<'info>>,
    pub rent: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteTransaction<'info> {
    #[account(mut, seeds = [MARKETPLACE_SEED, AUTHORITY_SEED])]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, seeds = [TRANSACTION_SEED, buyer.key(), listing.key()])]
    pub transaction: Account<'info, Transaction>,
    #[account(mut, seeds = [ESCROW_SEED, listing.key()])]
    pub escrow: Account<'info, Escrow>,
    #[account()]
    pub buyer: Signer<'info>,
    #[account()]
    pub seller: Account<'info, System>,
    #[account()]
    pub system_program: Program<'info, System>,
    #[account()]
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount<'info>>,
    pub rent: Signer<'info>,
}

#[derive(Accounts)]
pub struct FileDispute<'info> {
    #[account(mut, seeds = [MARKETPLACE_SEED, AUTHORITY_SEED])]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, seeds = [TRANSACTION_SEED, buyer.key(), listing.key()])]
    pub transaction: Account<'info, Transaction>,
    #[account(mut, seeds = [DISPUTE_SEED, transaction.key()])]
    pub dispute: Account<'info, Dispute>,
    #[account()]
    pub complainant: Signer<'info>,
    #[account()]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut, seeds = [MARKETPLACE_SEED, AUTHORITY_SEED])]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, seeds = [TRANSACTION_SEED, buyer.key(), listing.key()])]
    pub transaction: Account<'info, Transaction>,
    #[account(mut, seeds = [DISPUTE_SEED, transaction.key()])]
    pub dispute: Account<'info, Dispute>,
    #[account()]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    #[account(mut, seeds = [MARKETPLACE_SEED, AUTHORITY_SEED])]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut, seeds = [TRANSACTION_SEED, buyer.key(), listing.key()])]
    pub transaction: Account<'info, Transaction>,
    #[account(mut, seeds = [ESCROW_SEED, listing.key()])]
    pub escrow: Account<'info, Escrow>,
    #[account()]
    pub system_program: Program<'info, System>,
    #[account()]
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount<'info>>,
    #[account()]
    pub seller_token_account: Account<'info, TokenAccount<'info>>,
    #[account()]
    pub rent: Signer<'info>,
}

#[program]
pub mod marketplace {
    use super::*;

    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        authority: Pubkey,
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.bump = ctx.bumps.marketplace;
        marketplace.authority = authority;
        
        emit_cpi!(ListingCreated {
            seller: authority,
            listing: Pubkey::default(), // Placeholder
            mint: Pubkey::default(), // Placeholder
            price: 0,
            currency: Currency::SOL,
        });
        
        Ok(())
    }

    pub fn create_listing(
        ctx: Context<CreateListing>,
        mint: Pubkey,
        price: u64,
        currency: Currency,
        rent_price: Option<u64>,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let escrow = &mut ctx.accounts.escrow;
        
        // Initialize listing
        listing.seller = ctx.accounts.seller.key();
        listing.mint = mint;
        listing.price = price;
        listing.rent_price = rent_price;
        listing.currency = currency;
        listing.status = ListingStatus::Active;
        listing.created_at = Clock::get().unix_timestamp;
        listing.escrow_account = Some(escrow.key());
        listing.bump = ctx.bumps.listing;
        
        // Initialize escrow
        escrow.transaction = Pubkey::default(); // Will be set when purchase happens
        escrow.amount = 0;
        escrow.currency = currency;
        escrow.status = EscrowStatus::Active;
        escrow.release_time = 0;
        escrow.bump = ctx.bumps.escrow;
        
        // Transfer agent NFT to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.seller.to_account_info(),
            to: ctx.accounts.escrow.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        
        transfer(
            CpiContext::new(cpi_accounts),
            ctx.accounts.agent_mint.to_account_info(),
            ctx.accounts.seller_token_account,
            1, // Transfer 1 NFT
        )?;
        
        emit_cpi!(ListingCreated {
            seller: ctx.accounts.seller.key(),
            listing: listing.key(),
            mint: mint,
            price,
            currency,
        });
        
        Ok(())
    }

    pub fn purchase_agent(
        ctx: Context<PurchaseAgent>,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        let escrow = &mut ctx.accounts.escrow;
        let transaction = &mut ctx.accounts.transaction;
        
        // Check if listing is active
        require!(
            listing.status == ListingStatus::Active,
            MarketplaceError::ListingNotActive
        );
        
        // Initialize transaction
        transaction.buyer = ctx.accounts.buyer.key();
        transaction.seller = ctx.accounts.seller.key();
        transaction.listing = listing.key();
        transaction.amount = listing.price;
        transaction.currency = listing.currency;
        transaction.status = TransactionStatus::Pending;
        transaction.created_at = Clock::get().unix_timestamp;
        transaction.completed_at = None;
        transaction.escrow_release_time = Clock::get().unix_timestamp + (7 * 24 * 60 * 60); // 7 days
        transaction.dispute_deadline = Clock::get().unix_timestamp + (3 * 24 * 60 * 60); // 3 days
        transaction.bump = ctx.bumps.transaction;
        
        // Update escrow
        escrow.transaction = transaction.key();
        escrow.amount = listing.price;
        escrow.currency = listing.currency;
        escrow.release_time = transaction.escrow_release_time;
        
        // Transfer funds to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        
        transfer(
            CpiContext::new(cpi_accounts),
            ctx.accounts.agent_mint.to_account_info(),
            ctx.accounts.buyer_token_account,
            listing.price,
        )?;
        
        // Transfer NFT to buyer
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow.to_account_info(),
            to: ctx.accounts.buyer.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        
        transfer(
            CpiContext::new(cpi_accounts),
            ctx.accounts.agent_mint.to_account_info(),
            ctx.accounts.escrow_token_account,
            1, // Transfer 1 NFT
        )?;
        
        emit_cpi!(TransactionInitiated {
            buyer: ctx.accounts.buyer.key(),
            seller: ctx.accounts.seller.key(),
            listing: listing.key(),
            transaction: transaction.key(),
            amount: listing.price,
            currency: listing.currency,
        });
        
        Ok(())
    }

    pub fn complete_transaction(
        ctx: Context<CompleteTransaction>,
    ) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let escrow = &mut ctx.accounts.escrow;
        
        // Check if transaction is pending and escrow period has elapsed
        require!(
            transaction.status == TransactionStatus::Pending,
            MarketplaceError::TransactionAlreadyCompleted
        );
        
        let current_time = Clock::get().unix_timestamp;
        require!(
            current_time >= escrow.release_time,
            MarketplaceError::RefundPeriodNotElapsed
        );
        
        // Update transaction status
        transaction.status = TransactionStatus::Completed;
        transaction.completed_at = Some(current_time);
        
        // Update escrow status
        escrow.status = EscrowStatus::Released;
        
        // Transfer funds from escrow to seller
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        
        transfer(
            CpiContext::new(cpi_accounts),
            ctx.accounts.agent_mint.to_account_info(),
            ctx.accounts.escrow_token_account,
            escrow.amount,
        )?;
        
        emit_cpi!(TransactionCompleted {
            transaction: transaction.key(),
            buyer: ctx.accounts.buyer.key(),
            seller: ctx.accounts.seller.key(),
            amount: escrow.amount,
            currency: escrow.currency,
        });
        
        emit_cpi!(EscrowReleased {
            transaction: transaction.key(),
            amount: escrow.amount,
            currency: escrow.currency,
        });
        
        Ok(())
    }

    pub fn file_dispute(
        ctx: Context<FileDispute>,
        reason: String,
    ) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let dispute = &mut ctx.accounts.dispute;
        
        // Check if transaction is completed and within dispute deadline
        require!(
            transaction.status == TransactionStatus::Completed,
            MarketplaceError::TransactionAlreadyCompleted
        );
        
        let current_time = Clock::get().unix_timestamp;
        require!(
            current_time <= transaction.dispute_deadline,
            MarketplaceError::InvalidDisputeStatus
        );
        
        // Initialize dispute
        dispute.transaction = transaction.key();
        dispute.complainant = ctx.accounts.complainant.key();
        dispute.respondent = transaction.seller; // Seller is the respondent
        dispute.reason = reason;
        dispute.status = DisputeStatus::Filed;
        dispute.created_at = current_time;
        dispute.resolved_at = None;
        dispute.resolution = None;
        dispute.bump = ctx.bumps.dispute;
        
        // Update transaction status to disputed
        transaction.status = TransactionStatus::Disputed;
        
        emit_cpi!(DisputeFiled {
            transaction: transaction.key(),
            complainant: ctx.accounts.complainant.key(),
            respondent: transaction.seller,
            reason,
        });
        
        Ok(())
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        resolution: String,
        favor_complainant: bool,
    ) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let dispute = &mut ctx.accounts.dispute;
        
        // Check if dispute is under review
        require!(
            dispute.status == DisputeStatus::UnderReview,
            MarketplaceError::InvalidDisputeStatus
        );
        
        let current_time = Clock::get().unix_timestamp;
        
        // Update dispute
        dispute.status = DisputeStatus::Resolved;
        dispute.resolved_at = Some(current_time);
        dispute.resolution = Some(resolution.clone());
        
        // Update transaction based on dispute resolution
        if favor_complainant {
            // Refund buyer
            transaction.status = TransactionStatus::Refunded;
            transaction.completed_at = Some(current_time);
            
            // Transfer funds back to buyer (would need escrow account access)
            // This is simplified - in real implementation, you'd access escrow funds
        } else {
            // Release funds to seller (already done in complete_transaction)
            transaction.status = TransactionStatus::Completed;
        }
        
        emit_cpi!(DisputeResolved {
            transaction: transaction.key(),
            resolution,
        });
        
        Ok(())
    }

    pub fn release_escrow(
        ctx: Context<ReleaseEscrow>,
    ) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let escrow = &mut ctx.accounts.escrow;
        
        // Check if escrow is active and release time has elapsed
        require!(
            escrow.status == EscrowStatus::Active,
            MarketplaceError::InvalidEscrowState
        );
        
        let current_time = Clock::get().unix_timestamp;
        require!(
            current_time >= escrow.release_time,
            MarketplaceError::RefundPeriodNotElapsed
        );
        
        // Update escrow status
        escrow.status = EscrowStatus::Released;
        
        // Transfer funds to seller
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: escrow.to_account_info(),
        };
        
        transfer(
            CpiContext::new(cpi_accounts),
            ctx.accounts.agent_mint.to_account_info(),
            ctx.accounts.escrow_token_account,
            escrow.amount,
        )?;
        
        emit_cpi!(EscrowReleased {
            transaction: transaction.key(),
            amount: escrow.amount,
            currency: escrow.currency,
        });
        
        Ok(())
    }

    pub fn cancel_listing(
        ctx: Context<CreateListing>,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        
        // Check if listing is active
        require!(
            listing.status == ListingStatus::Active,
            MarketplaceError::ListingNotActive
        );
        
        // Update listing status
        listing.status = ListingStatus::Delisted;
        
        // Return NFT to seller
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow.to_account_info(),
            to: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        
        transfer(
            CpiContext::new(cpi_accounts),
            ctx.accounts.agent_mint.to_account_info(),
            ctx.accounts.escrow_token_account,
            1, // Transfer 1 NFT
        )?;
        
        Ok(())
    }
}