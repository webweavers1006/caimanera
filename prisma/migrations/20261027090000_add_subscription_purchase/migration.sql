-- Add the transaction type used when a player buys or renews a pass.
ALTER TYPE "PaymentType" ADD VALUE IF NOT EXISTS 'SUBSCRIPTION_PURCHASE';
