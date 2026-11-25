-- Manual fix for FeeAmount and NetAmount columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Payments' AND column_name = 'FeeAmount') THEN
        ALTER TABLE "Payments" ADD COLUMN "FeeAmount" numeric NOT NULL DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Payments' AND column_name = 'NetAmount') THEN
        ALTER TABLE "Payments" ADD COLUMN "NetAmount" numeric NOT NULL DEFAULT 0;
    END IF;
END $$;