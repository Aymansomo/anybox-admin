-- Update admin_orders view to include staff information
CREATE OR REPLACE VIEW admin_orders AS
SELECT 
    o.id,
    o.order_number,
    o.total_amount,
    o.status,
    o.payment_status,
    o.shipping_address,
    o.billing_address,
    o.notes,
    o.tracking_number,
    o.shipped_at,
    o.delivered_at,
    o.created_at,
    o.updated_at,
    o.user_id,
    o.customer_id,
    o.staff_id,
    -- Customer information from profiles
    CASE 
        WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN p.first_name || ' ' || p.last_name
        WHEN p.first_name IS NOT NULL THEN p.first_name
        WHEN p.email IS NOT NULL THEN SPLIT_PART(p.email, '@', 1)
        ELSE 'Unknown Customer'
    END as customer_name,
    COALESCE(p.email, 'unknown@example.com') as customer_email,
    COALESCE(p.phone, '') as customer_phone,
    -- Customer address from profiles
    p.address,
    p.city,
    p.state,
    p.zip_code,
    p.country,
    -- Staff information (use different aliases to avoid conflicts)
    s.full_name as staff_full_name,
    s.email as staff_email,
    s.role as staff_role
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN staff s ON o.staff_id = s.id
ORDER BY o.created_at DESC;
