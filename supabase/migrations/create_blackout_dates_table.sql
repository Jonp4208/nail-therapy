-- Create a table for blackout dates/times
CREATE TABLE IF NOT EXISTS blackout_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  all_day BOOLEAN DEFAULT TRUE,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  
  -- Constraints
  CONSTRAINT start_before_end_date CHECK (start_date <= end_date),
  CONSTRAINT time_range_valid CHECK (
    (all_day = TRUE) OR 
    (all_day = FALSE AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

-- Create RLS policies for blackout dates
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage blackout dates
CREATE POLICY "Admins can manage blackout dates" 
ON blackout_dates 
USING (is_admin());

-- Everyone can view blackout dates
CREATE POLICY "Everyone can view blackout dates" 
ON blackout_dates 
FOR SELECT
USING (TRUE);
