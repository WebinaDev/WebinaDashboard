# Basalam Coverage Contract (Webina OAuth + WooSalam sync parity)

Status legend: `implemented`, `queued`, `pending`.

## Engine

Independent dual ports:

- WebinaConnector: `includes/api/basalam/engine` (`WncBasalam`) — yields runtime when Dashboard engine is present
- WebinaDashboard: `Modules/basalam-module/engine` (`WebinoBasalam`) — **owns** webhooks/jobs when installed

## Auth (Webina-owned)

- SSO client: `webino-wp` / client_id `2357`
- Redirect URI: `https://webina.dev/api/basalam/oauth/callback`
- Proxy: `WebinaCRM` `POST /wp-json/webinocrm/v1/basalam/oauth/start` + `/refresh`
- Client secret: **only in CRM option** (`webinocrm_basalam_oauth`) via Marketplace → Basalam UI — never in merchant ZIP / wp-config / credentials.local.php
- Hamsalam OAuth (`api.hamsalam.ir` wp-get-token / client 779): **removed** from connect path

## Domain mapping

- Auth / WebinaCRM OAuth SSO — `implemented`
- Product create / update / bulk / archive / restore / connect — `implemented`
- Uploadio media — `implemented`
- Category mapping + detection + option maps — `implemented`
- Order webhook + poll + confirm/cancel/cancel-request/delay/tracking — `implemented`
- Job manager (7 types + discount) — `implemented`
- Finance (balance / banks / create settlement) — `implemented`
- Advanced sync settings via Dashboard REST/UI — `implemented`
- Booth profile / shipping / webhook CRUD / discounts / chat widget — `implemented`
- Shipping Service (`openapi.basalam.com/v1/shipping/*`) — `implemented` (Core shipping-methods deprecated)
- Hamsalam tickets / announcements — **removed** (use Webina support)
- Legacy payment gateway / wallet stubs — quarantined (not WooSalam)

## Hosts

- openapi.basalam.com
- core.basalam.com
- order-processing.basalam.com
- uploadio.basalam.com
- categorydetection.basalam.com
- auth.basalam.com
- webina.dev (OAuth proxy)
- accounting.basalam.com / identity.basalam.com
