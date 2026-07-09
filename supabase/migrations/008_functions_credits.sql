-- Migration: 008_functions_credits
-- Design Ref: §7.2 Credit Integrity Pattern (atomic reserve/refund)
-- Plan SC: FR-12 Credit system + NFR Security (credit integrity)

-- Reserve credits atomically. Raises INSUFFICIENT_CREDITS if insufficient.
CREATE OR REPLACE FUNCTION reserve_credits(p_user_id UUID, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining INT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: amount must be positive';
  END IF;

  UPDATE profiles
     SET credits = credits - p_amount
   WHERE id = p_user_id
     AND credits >= p_amount
  RETURNING credits INTO v_remaining;

  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  RETURN v_remaining;
END;
$$;

-- Refund credits (partial refund on batch chunk failure)
CREATE OR REPLACE FUNCTION refund_credits(p_user_id UUID, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining INT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_AMOUNT: amount must be positive';
  END IF;

  UPDATE profiles
     SET credits = credits + p_amount
   WHERE id = p_user_id
  RETURNING credits INTO v_remaining;

  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  RETURN v_remaining;
END;
$$;

-- Monthly reset batch (called by scheduled edge function)
CREATE OR REPLACE FUNCTION monthly_credit_reset(p_reset_amount INT DEFAULT 30)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE profiles
     SET credits = GREATEST(credits, p_reset_amount),
         credits_reset_at = NOW() + INTERVAL '1 month'
   WHERE credits_reset_at IS NULL OR credits_reset_at <= NOW();

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- Grant execute to authenticated users (they call via RPC)
REVOKE EXECUTE ON FUNCTION reserve_credits(UUID, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION refund_credits(UUID, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION monthly_credit_reset(INT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION reserve_credits(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION refund_credits(UUID, INT) TO service_role;
GRANT EXECUTE ON FUNCTION monthly_credit_reset(INT) TO service_role;
