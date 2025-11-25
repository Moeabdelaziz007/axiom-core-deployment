use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_2022::{self, Token2022, TransferChecked};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};
use spl_tlv_account_resolution::{account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList};

declare_id!("9tc8LSnU6qQ3s4EYMK9wdbvCnwAhRZdtpG2wSvo8152w"); // Updated after build

#[program]
pub mod axiom_token {
    use super::*;

    /// Initialize the transfer hook
    /// Sets up the extra account metas needed for the hook
    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        let account_metas = vec![
            // Treasury account to receive fees
            ExtraAccountMeta::new_with_seeds(
                &[
                    Seed::Literal { bytes: b"treasury".to_vec() },
                ],
                false, // is_signer
                true,  // is_writable
            )?,
        ];

        // Initialize the extra account meta list
        let account_size = ExtraAccountMetaList::size_of(account_metas.len())?;
        let mut data = ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?;
        ExtraAccountMetaList::init::<ExecuteInstruction>(&mut data, &account_metas)?;

        msg!("Transfer hook initialized with treasury account");
        Ok(())
    }

    /// Execute the transfer hook
    /// Called on every token transfer - deducts 1.5% fee to treasury
    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        msg!("Transfer hook triggered for amount: {}", amount);

        // Calculate 1.5% fee (150 basis points)
        let fee_basis_points: u64 = 150;
        let fee_amount = amount
            .checked_mul(fee_basis_points)
            .unwrap()
            .checked_div(10000)
            .unwrap();

        msg!("Fee calculated: {} tokens (1.5%)", fee_amount);

        // Only charge fee if amount is significant enough (avoid rounding to 0)
        if fee_amount > 0 {
            // Transfer fee to treasury
            let cpi_accounts = TransferChecked {
                from: ctx.accounts.source_token.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.treasury.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            };

            let cpi_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
            );

            token_2022::transfer_checked(
                cpi_ctx,
                fee_amount,
                ctx.accounts.mint.decimals,
            )?;

            msg!("Fee transferred to treasury: {}", fee_amount);
        }

        Ok(())
    }

    /// Fallback function for transfer hook interface
    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        let instruction = TransferHookInstruction::unpack(data)?;

        match instruction {
            TransferHookInstruction::Execute { amount } => {
                let account_info_iter = &mut accounts.iter();
                
                let source_account_info = next_account_info(account_info_iter)?;
                let mint_info = next_account_info(account_info_iter)?;
                let destination_account_info = next_account_info(account_info_iter)?;
                let owner_info = next_account_info(account_info_iter)?;
                let extra_account_meta_list_info = next_account_info(account_info_iter)?;
                let treasury_info = next_account_info(account_info_iter)?;
                let token_program_info = next_account_info(account_info_iter)?;

                msg!("Fallback: Executing transfer hook for amount: {}", amount);

                // Build context manually
                let mut transfer_hook_accounts = TransferHook {
                    source_token: InterfaceAccount::try_from(source_account_info)?,
                    mint: InterfaceAccount::try_from(mint_info)?,
                    destination_token: InterfaceAccount::try_from(destination_account_info)?,
                    owner: Signer::try_from(owner_info)?,
                    extra_account_meta_list: UncheckedAccount::try_from(extra_account_meta_list_info),
                    treasury: InterfaceAccount::try_from(treasury_info)?,
                    token_program: Program::try_from(token_program_info)?,
                };

                let ctx = Context::new(
                    program_id,
                    &mut transfer_hook_accounts,
                    accounts,
                    TransferHookBumps { treasury: 0 },
                );

                transfer_hook(ctx, amount)
            }
            _ => Err(ProgramError::InvalidInstructionData.into()),
        }
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: ExtraAccountMetaList Account, must use init to create it
    #[account(
        init,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + 512
    )]
    pub extra_account_meta_list: AccountInfo<'info>,

    pub mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    #[account(mut)]
    pub source_token: InterfaceAccount<'info, TokenAccount>,
    
    pub mint: InterfaceAccount<'info, Mint>,
    
    #[account(mut)]
    pub destination_token: InterfaceAccount<'info, TokenAccount>,
    
    pub owner: Signer<'info>,

    /// Extra account meta list
    pub extra_account_meta_list: UncheckedAccount<'info>,

    /// Treasury account (PDA)
    #[account(
        mut,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
}
