import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearEmailVerificationRequired } from '../../app/uiSlice';
import { goToVerifyEmail } from '../../features/auth/verification';

/**
 * Mounted once inside the router. Turns the `verificationRequired` flag (raised by
 * baseQuery or useChat on 403 EMAIL_NOT_VERIFIED) into a navigation to /verify-email,
 * so code that has no `navigate` still lands the user on the right screen without a
 * full page reload.
 */
export function EmailVerificationRedirect() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const required  = useAppSelector((s) => s.ui.verificationRequired);
  const userEmail = useAppSelector((s) => s.auth.user?.email ?? null);

  useEffect(() => {
    if (!required) return;
    dispatch(clearEmailVerificationRequired());
    goToVerifyEmail(navigate, required.email ?? userEmail);
  }, [required, userEmail, dispatch, navigate]);

  return null;
}
