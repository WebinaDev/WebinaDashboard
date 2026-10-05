# Basalam-module shipping-weight hotfix

Production fatal on sites where marketplace `Modules/basalam-module` owns the engine
(`WebinoBasalam\…`, see `WNC_Basalam_Runtime`):

`Class "WebinoBasalam\Admin\Product\Data\Handlers\Webino_Shipping_Weight" not found`

## Cause

Namespaced `SimpleProductHandler` used bare `Webino_Shipping_Weight` after
`class_exists('Webino_Shipping_Weight')` succeeded for the global shipping helper.

## Patch zip

`artifacts/basalam-module-shipping-weight-hotfix.zip` unpacks to:

`WebinaDashboard/Modules/basalam-module/engine/includes/Admin/Product/Data/Handlers/SimpleProductHandler.php`

Overwrite that file on the live plugin (FTP/SCP or unzip into `wp-content/plugins/`).

Sibling `VariableProductHandler` extends this class — no separate change required.
