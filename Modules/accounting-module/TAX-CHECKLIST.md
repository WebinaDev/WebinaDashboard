# Tax / Moadian cockpit checklist

Living checklist for the accounting-module tax features. Mark `- [x]` when done; leave Incomplete items until verified.

**Sources (manual refresh):** [intamedia.ir](https://intamedia.ir), [tax.gov.ir](https://tax.gov.ir), INTA technical PDF for Moadian, intacode tables, budget law VAT rate.

**Disclaimer:** Estimates are configuration-driven. Final compliance remains with the taxpayer / licensed advisor.

---

## Phase 0 — Foundation

- [x] `TAX-CHECKLIST.md` created and linked from README
- [x] Settings: `taxpayer_type`, tracking code, inta fields, corporate rate, vat_regime, wizard flags
- [x] Table `webino_acc_intacodes`
- [x] Table `webino_acc_tax_rate_versions`
- [x] Table `webino_acc_tax_tips`
- [x] Default rate version seed (general VAT 10%, art.131 brackets, corporate rate)
- [x] Sample intacode seed (common retail/wholesale/service codes)

## Phase 1A — Setup wizard

- [x] Route `/accounting/tax-setup`
- [x] Step: taxpayer type (individual / corporate)
- [x] Step: company / economic / national / postal
- [x] Step: tax file tracking code
- [x] Step: intacode search + profit ratio / VAT liability override
- [x] Step: fiscal ID + private key + connection test
- [x] Step: default VAT from active rate version + summary confirm → `wizard_done`
- [x] FA/EN `accounting.taxWizard.*`

## Phase 1B — Tax engine

- [x] `Accounting_Tax_Engine` VAT line rules (exempt / special / general)
- [x] Period revenue / COGS / expense / profit / loss
- [x] Individual income tax (inta ratio + art.131 brackets)
- [x] Corporate income tax (`corporate_tax_rate`)
- [x] Net VAT (output − input)
- [x] `GET accounting/tax/summary`
- [x] UI disclaimer for estimates

## Phase 1C — Cockpit + tips

- [x] Route `/accounting/tax` KPI cockpit
- [x] Tip engine (cron + on load)
- [x] Tips: threshold proximity, quarterly VAT deadline, missing SSTID, Moadian failed, incomplete keys, rate version change
- [x] Tip dismiss API/UI
- [x] Soft redirect to wizard when `!wizard_done`

## Phase 1D — Direct Moadian hardening

- [x] Verhoeff / official taxid check digit
- [x] JWE / packet fields per current INTA doc (AES-GCM + RSA-OAEP when server pubkey available)
- [x] Sandbox host wiring (`sandboxrc.tax.gov.ir` when sandbox flag on)
- [x] Inquiry closed-loop cron → accepted / rejected
- [x] Type-2 B2C payload (payments stub filled for Woo)
- [ ] Fixture or sandbox verification recorded — **Incomplete** (needs merchant keys / live sandbox proof)

## Phase 2 — TSP (trusted provider)

- [x] `moadian_transport` = `direct` | `tsp`
- [x] Encrypted TSP credentials
- [x] `Accounting_Moadian_Transport` interface
- [x] Direct adapter (existing client)
- [x] TSP HTTP adapter
- [x] Settings / wizard toggle

## Data maintenance

- [x] Admin JSON upload for intacodes (`POST accounting/tax/intacodes/import`) / rate versions (`POST accounting/tax/rates`)
- [ ] Documented monthly manual refresh procedure (no live scrape) — **Incomplete** (operators: download intacode/rate tables from tax.gov.ir / intamedia.ir and import via REST)

## Explicitly Incomplete / out of scope

- [ ] Certified TSP product certification / legal opinion
- [ ] Full اظهارنامه XML export to my.tax.gov
- [ ] Automatic national SSTID goods catalog sync
- [ ] Zero accountant involvement for edge exemptions
- [ ] Guaranteed live INTA acceptance without merchant keys / sandbox proof

## Release

- [x] Module version bump (1.5.0)
- [x] Dashboard version bump (0.9.40)
- [x] `build-module-client.sh accounting-module`
- [x] Host SPA build + release zip
