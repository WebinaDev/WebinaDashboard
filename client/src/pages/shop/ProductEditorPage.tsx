import { AiGenerateButton } from '@/components/AiGenerateButton'
import { ModulePanel } from '@/components/ModulePanel'
import { useBootstrapQuery } from '@/hooks/useBootstrapQuery'
import { useQueryErrorToast } from '@/hooks/useQueryErrorToast'
import { useProductEditorForm } from '@/hooks/useProductEditorForm'

import { QueryErrorState } from '@/components/QueryErrorState'
import { ProductAttributesPanel } from '@/components/products/editor/ProductAttributesPanel'
import { ProductDescriptionsSection } from '@/components/products/editor/ProductDescriptionsSection'
import { ProductEditorLayout } from '@/components/products/editor/ProductEditorLayout'
import { ProductImagesPanel } from '@/components/products/editor/ProductImagesPanel'
import { ProductInventoryPanel } from '@/components/products/editor/ProductInventoryPanel'
import { ProductIshopPanel } from '@/components/products/editor/ProductIshopPanel'
import { ProductPricingPanel } from '@/components/products/editor/ProductPricingPanel'
import { ProductMarketplaceMapPanel } from '@/components/products/editor/ProductMarketplaceMapPanel'
import { ProductPublishPanel } from '@/components/products/editor/ProductPublishPanel'
import { ProductRankMathPanel } from '@/components/products/editor/ProductRankMathPanel'
import { ProductRelatedPanel } from '@/components/products/editor/ProductRelatedPanel'
import { ProductShippingPanel } from '@/components/products/editor/ProductShippingPanel'
import { ProductTagsPanel } from '@/components/products/editor/ProductTagsPanel'
import { ProductTaxonomyPanel } from '@/components/products/editor/ProductTaxonomyPanel'
import { ProductTitleSection, ProductViewButton } from '@/components/products/editor/ProductTitleSection'
import { ProductTypePanel } from '@/components/products/editor/ProductTypePanel'
import { ProductVariationsPanel } from '@/components/products/editor/ProductVariationsPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function ProductEditorPage() {
  const { t } = useTranslation()
  const form = useProductEditorForm()
  const boot = useBootstrapQuery()
  const coffeeProfileActive = (boot.data?.activeModuleClients ?? []).some((c) => c.slug === 'coffee-profile-module')
  const coffeeSaveRef = useRef<(() => Promise<void>) | null>(null)
  const registerCoffeeSave = useCallback((fn: (() => Promise<void>) | null) => {
    coffeeSaveRef.current = fn
  }, [])
  useQueryErrorToast(form.productQ)
  useQueryErrorToast(form.lookupQ)

  const lookup = form.lookupQ.data
  const cats = lookup?.categories ?? []
  const brands = lookup?.brands ?? []
  const tags = lookup?.tags ?? []
  const permalinkBase = form.permalinkBase || lookup?.permalink_base || ''
  const rankMathAvailable =
    form.productQ.data?.rank_math_available ?? lookup?.rank_math_available ?? true

  async function handleSave() {
    if (form.id && coffeeSaveRef.current) {
      try {
        await coffeeSaveRef.current()
      } catch {
        return
      }
    }
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
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </>
  ) : (
    <>
      <ProductTitleSection
        name={form.name}
        englishName={form.ishop.english_name || ''}
        slug={form.slug}
        permalinkBase={permalinkBase}
        permalink={form.permalink}
        onNameChange={form.setName}
        onEnglishNameChange={(v) => form.setIshop({ ...form.ishop, english_name: v })}
        onSlugChange={form.setSlug}
        onSlugTouched={() => form.setSlugTouched(true)}
      />
      <ProductDescriptionsSection
        shortOnly
        shortDescription={form.shortDescription}
        description={form.description}
        disabled={form.save.isPending}
        onShortChange={form.setShortDescription}
        onDescriptionChange={form.setDescription}
      />

      <Tabs defaultValue="content" className="gap-3">
        <TabsList
          variant="line"
          className="mb-1 w-full justify-start overflow-x-auto text-start"
        >
          <TabsTrigger value="content">{t('products.editor.tabs.content')}</TabsTrigger>
          <TabsTrigger value="pricing">{t('products.editor.tabs.pricing')}</TabsTrigger>
          <TabsTrigger value="attributes">{t('products.editor.tabs.attributes')}</TabsTrigger>
          {coffeeProfileActive ? (
            <TabsTrigger value="coffee">{t('products.editor.tabs.coffee')}</TabsTrigger>
          ) : null}
          <TabsTrigger value="seo">{t('products.editor.tabs.seo')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('products.editor.tabs.advanced')}</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-3 outline-none">
          <ProductDescriptionsSection
            longOnly
            shortDescription={form.shortDescription}
            description={form.description}
            disabled={form.save.isPending}
            onShortChange={form.setShortDescription}
            onDescriptionChange={form.setDescription}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-3 outline-none">
          <ProductPricingPanel
            productId={form.id}
            productType={form.productType}
            purchase={form.purchase}
            lockPrice={form.lockPrice}
            wfcpPrices={form.wfcpPrices}
            regular={form.regular}
            sale={form.sale}
            savingWfcp={form.patchWfcp.isPending}
            platformLocks={form.platformLocks}
            platformPrices={form.platformPrices}
            wholesaleDiscount={form.wholesaleDiscount}
            wholesaleRule={form.wholesaleRule}
            productWeight={form.weight}
            referenceUrl={form.referenceUrl}
            referenceSource={form.referenceSource}
            referenceLastSync={form.referenceLastSync}
            fetchingReference={form.fetchReference.isPending}
            onPurchaseChange={form.setPurchase}
            onLockPriceChange={form.setLockPrice}
            onRegularChange={form.setRegular}
            onSaleChange={form.setSale}
            onPurchaseBlur={handlePurchaseBlur}
            onPlatformLockChange={(slug, locked) =>
              form.setPlatformLocks((prev) => ({ ...prev, [slug]: locked }))
            }
            onPlatformPriceChange={(slug, price) =>
              form.setPlatformPrices((prev) => ({ ...prev, [slug]: price }))
            }
            onWholesaleDiscountChange={form.setWholesaleDiscount}
            onWholesaleRuleChange={form.setWholesaleRule}
            onReferenceUrlChange={form.setReferenceUrl}
            onReferenceFetch={() => void form.fetchReference.mutateAsync()}
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
          {form.productType === 'variable' ? (
            form.id ? (
              <ProductVariationsPanel productId={form.id} />
            ) : (
              <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                {t('products.editor.saveBeforeVariations')}
              </p>
            )
          ) : null}
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
        </TabsContent>

        <TabsContent value="attributes" className="space-y-3 outline-none">
          <ProductAttributesPanel attributes={form.attributes} onChange={form.setAttributes} />
        </TabsContent>

        {coffeeProfileActive ? (
          <TabsContent value="coffee" forceMount className="space-y-3 outline-none data-[state=inactive]:hidden">
            <ModulePanel
              slug="coffee-profile-module"
              component="CoffeeProfileProductPanel"
              componentProps={{ productId: form.id || undefined, registerSave: registerCoffeeSave }}
            />
            {form.productType === 'variable' ? (
              <ModulePanel
                slug="coffee-profile-module"
                component="CoffeeWeightPricingPanel"
                componentProps={{ productId: form.id || undefined }}
              />
            ) : null}
          </TabsContent>
        ) : null}

        <TabsContent value="seo" className="space-y-3 outline-none">
          <ProductRankMathPanel
            seo={form.seo}
            onChange={form.setSeo}
            productName={form.name}
            slug={form.slug}
            descriptionHtml={form.description}
            shortDescription={form.shortDescription}
            permalinkBase={permalinkBase}
            siteName={lookup?.site_name}
            seoSep={lookup?.seo_sep}
            rankMathAvailable={rankMathAvailable}
            onSlugChange={form.setSlug}
            onSlugTouched={() => form.setSlugTouched(true)}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-3 outline-none">
          <ProductIshopPanel
            ishop={form.ishop}
            onChange={form.setIshop}
            labelOptions={lookup?.ishop_labels}
          />
          <ProductMarketplaceMapPanel productId={form.id} />
          <ProductRelatedPanel
            upsellIds={form.upsellIds}
            crossSellIds={form.crossSellIds}
            onUpsellChange={form.setUpsellIds}
            onCrossSellChange={form.setCrossSellIds}
          />
        </TabsContent>
      </Tabs>
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
        videoUrl={form.ishop.video_url || ''}
        videoCoverUrl={form.ishop.video_cover_url || ''}
        onCoverChange={form.setCover}
        onCoverRemove={form.clearCover}
        onGalleryChange={form.setGallery}
        onVideoUrlChange={(v) => form.setIshop({ ...form.ishop, video_url: v })}
        onVideoCoverUrlChange={(v) => form.setIshop({ ...form.ishop, video_cover_url: v })}
      />
      <ProductTaxonomyPanel
        titleKey="products.fieldCategories"
        emptyKey="products.noCategories"
        items={cats}
        loading={form.lookupQ.isLoading}
        selected={form.categoryIds}
        onChange={form.setCategoryIds}
        hierarchical
      />
      <ProductTaxonomyPanel
        titleKey="products.fieldBrands"
        emptyKey="products.noBrands"
        items={brands}
        loading={form.lookupQ.isLoading}
        selected={form.brandIds}
        onChange={form.setBrandIds}
        hierarchical
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
      headerActions={
        <>
          <ProductViewButton href={form.permalink || (form.slug ? `${permalinkBase}${form.slug}/` : undefined)} />
          {form.id ? (
            <AiGenerateButton
              type="product"
              id={form.id}
              onDone={() => {
                void form.productQ.refetch()
              }}
            />
          ) : null}
        </>
      }
      main={main}
      sidebar={sidebar}
    />
  )
}
