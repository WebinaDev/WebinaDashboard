import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useProductEditorForm } from '@/hooks/useProductEditorForm'

import { QueryErrorState } from '@/components/QueryErrorState'
import { ProductAttributesPanel } from '@/components/products/editor/ProductAttributesPanel'
import { ProductDescriptionsSection } from '@/components/products/editor/ProductDescriptionsSection'
import { ProductEditorLayout } from '@/components/products/editor/ProductEditorLayout'
import { ProductImagesPanel } from '@/components/products/editor/ProductImagesPanel'
import { ProductInventoryPanel } from '@/components/products/editor/ProductInventoryPanel'
import { ProductPricingPanel } from '@/components/products/editor/ProductPricingPanel'
import { ProductPublishPanel } from '@/components/products/editor/ProductPublishPanel'
import { ProductRelatedPanel } from '@/components/products/editor/ProductRelatedPanel'
import { ProductShippingPanel } from '@/components/products/editor/ProductShippingPanel'
import { ProductTagsPanel } from '@/components/products/editor/ProductTagsPanel'
import { ProductTaxonomyPanel } from '@/components/products/editor/ProductTaxonomyPanel'
import { ProductTitleSection } from '@/components/products/editor/ProductTitleSection'
import { ProductTypePanel } from '@/components/products/editor/ProductTypePanel'
import { ProductVariationsPanel } from '@/components/products/editor/ProductVariationsPanel'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductEditorPage() {
  const form = useProductEditorForm()
  useQueryErrorToast(form.productQ)
  useQueryErrorToast(form.lookupQ)

  const lookup = form.lookupQ.data
  const cats = lookup?.categories ?? []
  const brands = lookup?.brands ?? []
  const tags = lookup?.tags ?? []

  async function handleSave() {
    if (form.id && !form.save.isPending && !form.patchWfcp.isPending) {
      try {
        await form.patchWfcp.mutateAsync()
      } catch {
        return
      }
    }
    await form.save.mutateAsync()
  }

  function handlePurchaseBlur() {
    if (form.id && !form.save.isPending && !form.patchWfcp.isPending) {
      void form.patchWfcp.mutateAsync()
    }
  }

  if (form.loadFailed) {
    return (
      <ProductEditorLayout
        productId={form.id}
        loading={false}
        saving={false}
        saveDisabled
        onSave={() => {}}
        main={
          <QueryErrorState
            onRetry={() => {
              void form.productQ.refetch()
              void form.lookupQ.refetch()
            }}
          />
        }
        sidebar={<></>}
      />
    )
  }

  const main = form.loading ? (
    <>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </>
  ) : (
    <>
      <ProductTitleSection
        name={form.name}
        slug={form.slug}
        onNameChange={form.setName}
        onSlugChange={form.setSlug}
        onSlugTouched={() => form.setSlugTouched(true)}
      />
      <ProductDescriptionsSection
        shortDescription={form.shortDescription}
        description={form.description}
        disabled={form.save.isPending}
        onShortChange={form.setShortDescription}
        onDescriptionChange={form.setDescription}
      />
      <ProductPricingPanel
        productType={form.productType}
        purchase={form.purchase}
        lockPrice={form.lockPrice}
        wfcpPrices={form.wfcpPrices}
        regular={form.regular}
        sale={form.sale}
        savingWfcp={form.patchWfcp.isPending}
        onPurchaseChange={form.setPurchase}
        onLockPriceChange={form.setLockPrice}
        onRegularChange={form.setRegular}
        onSaleChange={form.setSale}
        onPurchaseBlur={handlePurchaseBlur}
      />
      <ProductShippingPanel
        weight={form.weight}
        length={form.length}
        width={form.width}
        height={form.height}
        onWeightChange={form.setWeight}
        onLengthChange={form.setLength}
        onWidthChange={form.setWidth}
        onHeightChange={form.setHeight}
      />
      <ProductInventoryPanel
        productType={form.productType}
        sku={form.sku}
        manageStock={form.manageStock}
        stock={form.stock}
        backorders={form.backorders}
        onSkuChange={form.setSku}
        onManageStockChange={form.setManageStock}
        onStockChange={form.setStock}
        onBackordersChange={form.setBackorders}
      />
      <ProductRelatedPanel
        upsellIds={form.upsellIds}
        crossSellIds={form.crossSellIds}
        onUpsellChange={form.setUpsellIds}
        onCrossSellChange={form.setCrossSellIds}
      />
      <ProductAttributesPanel attributes={form.attributes} onChange={form.setAttributes} />
      {form.productType === 'variable' && form.id ? (
        <ProductVariationsPanel productId={form.id} />
      ) : null}
    </>
  )

  const sidebar = form.loading ? null : (
    <>
      <ProductPublishPanel
        status={form.status}
        catalogVisibility={form.catalogVisibility}
        featured={form.featured}
        onStatusChange={form.setStatus}
        onCatalogVisibilityChange={form.setCatalogVisibility}
        onFeaturedChange={form.setFeatured}
      />
      <ProductTypePanel
        productType={form.productType}
        disabled={form.typeChangeDisabled}
        onChange={form.setProductType}
      />
      <ProductImagesPanel
        imageId={form.imageId}
        imageUrl={form.imageUrl}
        gallery={form.gallery}
        onCoverChange={form.setCover}
        onCoverRemove={form.clearCover}
        onGalleryChange={form.setGallery}
      />
      <ProductTaxonomyPanel
        titleKey="products.fieldCategories"
        emptyKey="products.noCategories"
        items={cats}
        loading={form.lookupQ.isLoading}
        selected={form.categoryIds}
        onChange={form.setCategoryIds}
      />
      <ProductTaxonomyPanel
        titleKey="products.fieldBrands"
        emptyKey="products.noBrands"
        items={brands}
        loading={form.lookupQ.isLoading}
        selected={form.brandIds}
        onChange={form.setBrandIds}
      />
      <ProductTagsPanel allTags={tags} tagIds={form.tagIds} onChange={form.setTagIds} />
    </>
  )

  return (
    <ProductEditorLayout
      productId={form.id}
      loading={form.loading}
      saving={form.save.isPending}
      saveDisabled={form.loadFailed}
      onSave={() => void handleSave()}
      main={main}
      sidebar={sidebar}
    />
  )
}
