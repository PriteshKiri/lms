# Setting Up Initial Users in Supabase

Since Supabase manages authentication in a specific way, the best approach to create initial users is to:

## Option 1: Use the Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Users"
3. Click "Add User"
4. Create two users:
   - Email: admin@zenacademy.com, Password: password123
   - Email: user@zenacademy.com, Password: password123

5. After creating the users, get their UUIDs from the users list

6. Then, go to "SQL Editor" and run the following SQL to add them to your custom users table:

```sql
-- Replace the UUIDs with the actual UUIDs from your auth.users table
INSERT INTO public.users (id, name, email, role)
VALUES 
  ('paste-admin-uuid-here', 'Admin User', 'admin@zenacademy.com', 'admin'),
  ('paste-user-uuid-here', 'Normal User', 'user@zenacademy.com', 'user');
```

## Option 2: Use the API from your application

You can also create users programmatically using the Supabase JavaScript client:

1. Create a temporary setup script in your project:

```javascript
// setup-users.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'your-supabase-url'
const supabaseServiceKey = 'your-supabase-service-role-key' // Use service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupUsers() {
  try {
    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@zenacademy.com',
      password: 'password123',
      email_confirm: true
    })
    
    if (adminError) throw adminError
    
    // Add admin to users table
    const { error: adminProfileError } = await supabase
      .from('users')
      .insert([{
        id: adminData.user.id,
        name: 'Admin User',
        email: 'admin@zenacademy.com',
        role: 'admin'
      }])
    
    if (adminProfileError) throw adminProfileError
    
    // Create normal user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'user@zenacademy.com',
      password: 'password123',
      email_confirm: true
    })
    
    if (userError) throw userError
    
    // Add user to users table
    const { error: userProfileError } = await supabase
      .from('users')
      .insert([{
        id: userData.user.id,
        name: 'Normal User',
        email: 'user@zenacademy.com',
        role: 'user'
      }])
    
    if (userProfileError) throw userProfileError
    
    console.log('Users created successfully!')
  } catch (error) {
    console.error('Error creating users:', error)
  }
}

setupUsers()
```

2. Run this script with Node.js:
```
node -r esm setup-users.js
```

## Option 3: Use Database Functions (Advanced)

If you need to automate this process, you can create a database function in Supabase:

```sql
-- Create a function to add a user with both auth and profile
CREATE OR REPLACE FUNCTION create_complete_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create the user in auth.users
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  ) RETURNING id INTO new_user_id;
  
  -- Create the user profile
  INSERT INTO public.users (id, name, email, role)
  VALUES (new_user_id, user_name, user_email, user_role);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call the function to create users
SELECT create_complete_user('admin@zenacademy.com', 'password123', 'Admin User', 'admin');
SELECT create_complete_user('user@zenacademy.com', 'password123', 'Normal User', 'user');
```

## Login Credentials

After setting up the users, you can log in with:

**Admin User:**
- Email: admin@zenacademy.com
- Password: password123

**Normal User:**
- Email: user@zenacademy.com
- Password: password123