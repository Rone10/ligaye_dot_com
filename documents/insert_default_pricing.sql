-- First, check if you have any admin users and get their profile IDs
SELECT id, full_name, user_id 
FROM profiles 
WHERE role = 'admin' 
LIMIT 5;

-- Once you have identified an admin profile ID from the above query,
-- use it to insert the default pricing (replace 'YOUR_ADMIN_PROFILE_ID' with the actual ID):

/*
INSERT INTO pricing_config (price_per_month, currency, active, created_by)
VALUES (350000, 'GMD', true, 'YOUR_ADMIN_PROFILE_ID');
*/

-- Alternative: Insert using a subquery to automatically use the first admin
INSERT INTO pricing_config (price_per_month, currency, active, created_by)
SELECT 350000, 'GMD', true, id
FROM profiles
WHERE role = 'admin'
LIMIT 1;