-- Add staff assignment to orders table
ALTER TABLE orders 
ADD COLUMN staff_id INT REFERENCES staff(id) ON DELETE SET NULL;

-- Create index for staff_id for better performance
CREATE INDEX idx_orders_staff_id ON orders(staff_id);

-- Add comment to explain the field
COMMENT ON COLUMN orders.staff_id IS 'ID of the staff member assigned to handle this order';
