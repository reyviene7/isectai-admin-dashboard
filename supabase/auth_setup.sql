-- ==============================================================================================
-- iSectAI Platform: Supabase Auth (GoTrue) Production Setup & Identity Sync
-- Run this in your Supabase Project -> SQL Editor
-- 1. Drops any conflicting trigger on auth.users to resolve "Database error querying schema"
-- 2. Sanitizes all auth.users string token columns to empty string '' (prevents Go scan NULL error)
-- 3. Resets empty phone strings to NULL to respect the unique constraint "users_phone_key"
-- 4. Upserts all users from public.users into auth.users with encrypted passwords & metadata
-- 5. Creates matching entries in auth.identities so email/password login works for ALL accounts
-- ==============================================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Remove any custom triggers causing GoTrue 500
DROP TRIGGER IF EXISTS tr_auth_user_metadata_sync ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_metadata_sync();

-- 2. Reset empty phone strings to NULL to prevent duplicate key violations on users_phone_key
UPDATE auth.users SET phone = NULL WHERE phone = '';

-- 3. Clean up any invalid or NULL token columns in auth.users
UPDATE auth.users
SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    email_change = COALESCE(email_change, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, '');

-- 4. Synchronize all accounts from public.users into auth.users and auth.identities
DO $$
DECLARE
    r RECORD;
    v_user_id uuid;
    v_email text;
    v_password text;
    v_role text;
    v_tenant_id text;
BEGIN
    FOR r IN SELECT * FROM public.users LOOP
        v_email := lower(trim(r.email));
        v_password := COALESCE(r.password, 'password123');
        v_role := r.role::text;
        v_tenant_id := CASE WHEN r.tenant_id IS NOT NULL THEN r.tenant_id::text ELSE '' END;

        -- Check if user exists in auth.users by email
        SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = v_email;

        IF v_user_id IS NULL THEN
            v_user_id := r.id;
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                confirmation_token,
                recovery_token,
                email_change_token_new,
                email_change_token_current,
                email_change,
                phone,
                phone_change,
                phone_change_token,
                reauthentication_token,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                v_user_id,
                'authenticated',
                'authenticated',
                v_email,
                crypt(v_password, gen_salt('bf')),
                now(),
                '',
                '',
                '',
                '',
                '',
                NULL,
                '',
                '',
                '',
                jsonb_build_object(
                    'provider', 'email',
                    'providers', jsonb_build_array('email'),
                    'role', v_role,
                    'tenant_id', v_tenant_id
                ),
                jsonb_build_object(
                    'full_name', r.full_name,
                    'role', v_role,
                    'tenant_id', v_tenant_id
                ),
                now(),
                now()
            );
        ELSE
            UPDATE auth.users
            SET
                encrypted_password = crypt(v_password, gen_salt('bf')),
                email_confirmed_at = COALESCE(email_confirmed_at, now()),
                confirmation_token = COALESCE(confirmation_token, ''),
                recovery_token = COALESCE(recovery_token, ''),
                email_change_token_new = COALESCE(email_change_token_new, ''),
                email_change_token_current = COALESCE(email_change_token_current, ''),
                email_change = COALESCE(email_change, ''),
                phone_change = COALESCE(phone_change, ''),
                phone_change_token = COALESCE(phone_change_token, ''),
                reauthentication_token = COALESCE(reauthentication_token, ''),
                raw_app_meta_data = jsonb_build_object(
                    'provider', 'email',
                    'providers', jsonb_build_array('email'),
                    'role', v_role,
                    'tenant_id', v_tenant_id
                ),
                raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
                    'full_name', r.full_name,
                    'role', v_role,
                    'tenant_id', v_tenant_id
                ),
                updated_at = now()
            WHERE id = v_user_id;
        END IF;

        -- 5. Create or update linked row in auth.identities
        DELETE FROM auth.identities WHERE user_id = v_user_id AND provider = 'email';
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            v_user_id,
            jsonb_build_object('sub', v_user_id::text, 'email', v_email),
            'email',
            v_user_id::text,
            now(),
            now(),
            now()
        );
    END LOOP;
END;
$$;

-- 6. Explicitly grant platform_admin to admin accounts
DO $$
DECLARE
    v_admin_id uuid;
BEGIN
    FOR v_admin_id IN 
        SELECT id FROM auth.users WHERE lower(email) IN ('admin@isectai.internal', 'admin@isectai.com')
    LOOP
        UPDATE auth.users
        SET
            email_confirmed_at = now(),
            encrypted_password = crypt('password123', gen_salt('bf')),
            raw_app_meta_data = jsonb_build_object(
                'provider', 'email',
                'providers', jsonb_build_array('email'),
                'role', 'platform_admin'
            )
        WHERE id = v_admin_id;

        DELETE FROM auth.identities WHERE user_id = v_admin_id AND provider = 'email';
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            v_admin_id,
            v_admin_id,
            jsonb_build_object('sub', v_admin_id::text, 'email', (SELECT email FROM auth.users WHERE id = v_admin_id)),
            'email',
            v_admin_id::text,
            now(),
            now(),
            now()
        );
    END LOOP;
END;
$$;
