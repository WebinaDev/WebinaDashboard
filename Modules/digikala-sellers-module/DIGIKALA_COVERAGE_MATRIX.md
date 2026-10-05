# Digikala Coverage Contract (OpenAPI seller.digikala.com)

Status: dual engines `WncDigikala` (Connector) + `WebinoDigikala` (Dashboard).

## Auth (RSA-4096)

- Generate keypair on Dashboard/Connector — `implemented`
- Paste public key in Digikala panel — seller action
- Decrypt encrypted authorization code + `POST open-api/v1/auth/token` — `implemented`
- `POST open-api/v1/auth/refresh-token` — `implemented`
- Plaintext `authorization_code` primary path — **removed**

## Domains

| Domain | Status |
|---|---|
| Variant search | implemented |
| Selling price PATCH + batch fallback | implemented |
| Seller stock batch | implemented |
| Product import (search/v2) | implemented |
| Product export / auto-link by SKU | implemented |
| Orders pull + WC create | implemented |
| Order status push | implemented |
| Jobs queue | implemented |
| Runtime ownership (Dashboard wins) | implemented |

## Hosts

- https://seller.digikala.com/open-api/v1/ (see [Digikala OpenAPI docs](https://seller.digikala.com/open-api/v1/doc/))
