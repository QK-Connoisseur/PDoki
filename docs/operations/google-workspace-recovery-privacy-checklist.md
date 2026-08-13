# Google Workspace recovery and privacy checklist

Status: planning checklist only. It does not record account state or authorize a
live-account change. Confirm current behavior in Google's official documentation
before acting because controls and labels can change.

## Privacy boundary

Never record phone numbers, personal email addresses, recovery codes, key serial
numbers, account screenshots, or other recovery details in Git, pull requests,
tickets, chat, or logs. Keep the detailed inventory in an approved password
manager or comparably protected business record.

## Review the controls separately

| Surface                     | Verify                                                                                  | Do not assume                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Workspace directory/profile | Who can discover each contact field                                                     | Hiding a directory field removes a recovery factor                                |
| Password/account recovery   | Which recovery email or administrator/provider process can restore a forgotten password | A security key or backup code is necessarily a password-reset route               |
| Sign-in second step         | Which passkey, security key, authenticator, backup code, or phone can complete sign-in  | A second-step factor can also reset a forgotten password                          |
| Signup/risk verification    | Whether a previously supplied contact still has a current role                          | A signup verification contact is necessarily a directory field or recovery factor |
| Public business surfaces    | Website, group, alias, domain, support, and business-listing exposure                   | Workspace settings control unrelated public services                              |

Current Google Workspace guidance says a user with 2-Step Verification enabled
can use only a recovery email for self-service password reset. Treat hardware
keys and backup codes as sign-in/second-step options unless the exact provider
flow being tested proves otherwise; administrator recovery is a separate path.

## Private inventory

Record privately:

- Workspace/domain, privileged accounts, and accountable business owner
- Directory visibility for each contact field
- Current sign-in and recovery factors for each privileged account
- Factors that share the same phone, inbox, device, provider, or person
- Protected spare hardware keys, recovery codes, and administrator recovery paths
- Privileged administrators able to perform account recovery without depending
  on the account being recovered
- Last access/recovery test, result, and planned rollback window

A backup is independent only if losing the original phone, inbox, device,
provider, or individual would not also remove the backup.

## Safe replacement sequence

1. Inspect directory visibility, recovery factors, privileged accounts, and
   public business surfaces without changing them. Keep a known-good session open.
2. Enroll a business-controlled recovery route independent of the temporary
   personal contact. For privileged accounts, prefer approved phishing-resistant
   hardware-backed access plus a separately protected recovery route. Also verify
   an independently controlled administrator-recovery path. When staffing permits,
   keep more than one individually assigned administrator with security-settings
   access; a solo-administrator exception remains a documented risk and needs a
   provider-supported recovery alternative.
3. Test the independent route from a separate private browser session or trusted
   device. Stop if the test is ambiguous or still depends on the temporary contact.
4. Replace only the intended field. Do not combine this with administrator,
   domain, group, alias, or directory changes. Google may continue offering the
   previous recovery information for seven days after a change, so UI absence is
   not proof that the old route is immediately unusable. Record and monitor the
   provider-controlled residual window privately.
5. Re-test access before closing the known-good session. Then verify separately
   that the retired contact is absent from the intended recovery surfaces and is
   not visible through directory or public business surfaces. Recheck after the
   residual window, including signup/risk-verification and other Google account or
   service surfaces; removing a number from one setting does not prove every other
   use was removed. If the old contact or account may be compromised, stop this
   planned sequence and use the approved account-security/administrator response
   instead of waiting on a routine privacy change.
6. Update the private record with the operator, date, result, and next review.

## Repository-safe evidence

Only a sanitized outcome belongs in the repository or project tracker:

> Workspace recovery/privacy review completed on YYYY-MM-DD. Independent backup
> access was tested before replacement. Directory visibility and recovery controls
> were verified separately. Detailed evidence is held in the approved private
> operations record.

Do not replace the current factor without a tested independent route, an
accountable owner, and a recoverable known-good session.

## Official Google references

- [Set up a recovery phone number or email address](https://support.google.com/accounts/answer/183723)
- [Set up password recovery for Workspace users](https://support.google.com/a/answer/33382)
- [Set up and manage the Workspace Directory](https://support.google.com/a/answer/1628009)
- [Protect a business with 2-Step Verification](https://support.google.com/a/answer/175197)
