-- Test records are rolled back inside the subtransaction, including successful cases.
DO $checks$
DECLARE
  account_id uuid := gen_random_uuid();
  role_id bigint;
  before_users bigint;
  code_attempts integer;
BEGIN
  SELECT count(*) INTO before_users FROM public.users;
  SELECT id INTO STRICT role_id FROM public.roles WHERE role_name='Student';
  BEGIN
    INSERT INTO public.users(id,user_name,email,password,rolesid)
      VALUES(account_id,'auth_check_user',account_id::text||'@example.test','test-only-hash',role_id);
    BEGIN
      INSERT INTO public.users(user_name,email,password,rolesid)
        VALUES('AUTH_CHECK_USER','other-'||account_id::text||'@example.test','test-only-hash',role_id);
      RAISE EXCEPTION 'Case-insensitive username uniqueness failed';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
    BEGIN
      INSERT INTO public.users(user_name,email,password,rolesid)
        VALUES('other_auth_check',upper(account_id::text||'@example.test'),'test-only-hash',role_id);
      RAISE EXCEPTION 'Case-insensitive email uniqueness failed';
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
    INSERT INTO public.sessions(id,started_at,usersid) VALUES(-900000000001,now() AT TIME ZONE 'utc',account_id);
    BEGIN
      INSERT INTO public.sessions(id,started_at,usersid)
        VALUES(-900000000002,now() AT TIME ZONE 'utc',gen_random_uuid());
      RAISE EXCEPTION 'Session owner FK failed';
    EXCEPTION WHEN foreign_key_violation THEN NULL;
    END;
    UPDATE public.users SET auth_version=auth_version+1 WHERE id=account_id AND auth_version=0;
    UPDATE public.users SET auth_version=auth_version+1 WHERE id=account_id AND auth_version=0;
    IF (SELECT auth_version FROM public.users WHERE id=account_id) <> 1 THEN
      RAISE EXCEPTION 'Conditional revocation is not idempotent';
    END IF;
    UPDATE public.users SET verification_code_hash='test-code-hash',verification_expires_at=now()+interval '10 minutes',
      verification_sent_at=now(),verification_attempts=0 WHERE id=account_id;
    UPDATE public.users SET verification_attempts=verification_attempts+1 WHERE id=account_id;
    SELECT verification_attempts INTO code_attempts FROM public.users WHERE id=account_id;
    IF code_attempts <> 1 THEN RAISE EXCEPTION 'Verification attempt did not persist'; END IF;
    UPDATE public.users SET email_verified_at=now(),verification_code_hash=NULL,
      verification_expires_at=NULL,verification_sent_at=NULL,verification_attempts=0 WHERE id=account_id;
    IF EXISTS(SELECT 1 FROM public.users WHERE id=account_id AND
      (email_verified_at IS NULL OR verification_code_hash IS NOT NULL)) THEN
      RAISE EXCEPTION 'Verification consumption failed';
    END IF;
    RAISE EXCEPTION SQLSTATE 'ZT001' USING MESSAGE='Roll back test records';
  EXCEPTION WHEN SQLSTATE 'ZT001' THEN NULL;
  END;
  IF (SELECT count(*) FROM public.users) <> before_users THEN RAISE EXCEPTION 'Test records were not rolled back'; END IF;
END;
$checks$;
