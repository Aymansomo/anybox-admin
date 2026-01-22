-- Admin view that uses real profile data
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
    -- Real customer information from profiles
    CASE 
        WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN p.first_name || ' ' || p.last_name
        WHEN p.first_name IS NOT NULL THEN p.first_name
        WHEN p.email IS NOT NULL THEN SPLIT_PART(p.email, '@', 1)
        ELSE 'Unknown Customer'
    END as customer_name,
    COALESCE(p.email, 'customer@example.com') as customer_email,
    COALESCE(p.phone, '') as customer_phone
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;
