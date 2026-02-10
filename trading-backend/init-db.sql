-- Initialize trading_analytics database
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE trading_analytics TO trading_user;

-- Set timezone
SET timezone = 'UTC';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Trading Analytics Database initialized successfully!';
  RAISE NOTICE 'Database: trading_analytics';
  RAISE NOTICE 'User: trading_user';
  RAISE NOTICE 'Ready for Prisma migrations!';
END
$$;
