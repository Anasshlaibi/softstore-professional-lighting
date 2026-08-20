-- Next-Generation Schema Extension for 'products gearshop'
-- NON-BREAKING ADDITIVE MIGRATION

ALTER TABLE "products gearshop" 
  ADD COLUMN IF NOT EXISTS product_group TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'lens',
  ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '7Artisans',
  ADD COLUMN IF NOT EXISTS mount TEXT,
  ADD COLUMN IF NOT EXISTS compatible_mounts TEXT[],
  ADD COLUMN IF NOT EXISTS condition_rating TEXT,
  ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS used_attributes JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Comment for Documentation
COMMENT ON COLUMN "products gearshop".product_group IS 'Classification: new | used';
COMMENT ON COLUMN "products gearshop".product_type IS 'Classification: lens | camera | light | filter | adapter | accessory';
COMMENT ON COLUMN "products gearshop".technical_specs IS 'Dynamic EAV JSON attributes per product type';
COMMENT ON COLUMN "products gearshop".used_attributes IS 'Secondhand equipment attributes: cosmetic rating, shutter count, serial, etc.';
