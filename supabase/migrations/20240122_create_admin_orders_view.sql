-- Fixed admin view that matches your actual orders table structure
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
    -- Customer information from profiles
    CASE 
        WHEN p.full_name IS NOT NULL THEN p.full_name
        WHEN p.email IS NOT NULL THEN SPLIT_PART(p.email, '@', 1)
        ELSE 'Unknown Customer'
    END as customer_name,
    COALESCE(p.email, 'unknown@example.com') as customer_email,
    COALESCE(p.phone, '') as customer_phone
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;
