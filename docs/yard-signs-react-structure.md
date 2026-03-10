# Yard Signs React Page Structure

This is the exact page/module structure for the first Signscous end-to-end flow:

1. Quote configuration
2. Artwork upload + preflight
3. Cart review
4. Checkout
5. Order confirmation
6. Order tracking

## Route map

- `/yard-signs` -> Quote configurator page
- `/yard-signs/artwork/:quoteId` -> Artwork upload and preflight status
- `/cart/:cartId` -> Cart review
- `/checkout/:cartId` -> Shipping, billing, payment, place order
- `/order-confirmation/:orderNumber` -> Confirmation and summary
- `/orders/:orderNumber` -> Tracking and timeline

## Frontend folder tree

```text
src/
  app/
    router.jsx
  features/
    yardSigns/
      api/
        yardSignsApi.js
      pages/
        YardSignsQuotePage.jsx
        YardSignsArtworkPage.jsx
      components/
        QuoteConfigurator.jsx
        PriceSummaryCard.jsx
        ArtworkUploader.jsx
        PreflightStatusBadge.jsx
      model/
        yardSignsDefaults.js
        yardSignsValidation.js
    cart/
      api/
        cartApi.js
      pages/
        CartPage.jsx
      components/
        CartLineItems.jsx
        CartTotals.jsx
    checkout/
      api/
        checkoutApi.js
      pages/
        CheckoutPage.jsx
      components/
        AddressForm.jsx
        ShippingMethodPicker.jsx
        PaymentForm.jsx
        CheckoutTotals.jsx
    orders/
      api/
        ordersApi.js
      pages/
        OrderConfirmationPage.jsx
        OrderTrackingPage.jsx
      components/
        OrderSummary.jsx
        OrderTimeline.jsx
  shared/
    api/
      httpClient.js
    utils/
      currency.js
      sku.js
```

## State contract by step

### 1) Yard Signs quote page (`/yard-signs`)

Required local state:

- `size` (`18x24 | 24x18 | 24x36`)
- `material` (`coroplast_4mm | coroplast_10mm`)
- `sides` (`single_sided | double_sided`)
- `quantity` (integer)
- `turnaround` (`standard_48h | rush_24h`)
- `finishing` (`none | h_stake_included | drill_holes`)

Submit action:

- `POST /v1/quotes/yard-signs`
- Persist `quoteId`, `quoteNumber`, `quoteItemId`, and totals in route state or store.
- Continue button routes to `/yard-signs/artwork/:quoteId`.

### 2) Artwork upload page (`/yard-signs/artwork/:quoteId`)

Actions:

- `POST /v1/artwork/uploads/presign`
- Upload directly to storage URL
- `POST /v1/artwork/uploads/complete`

UI states:

- Uploading
- Uploaded
- Preflight pending
- Preflight failed (show notes)
- Preflight passed

Continue action:

- `POST /v1/carts` with `quoteId`
- `POST /v1/carts/{cartId}/items` with `quoteItemId`
- Route to `/cart/:cartId`

### 3) Cart page (`/cart/:cartId`)

Actions:

- Render all quote-derived line items
- Update quantity (re-price through cart endpoint)
- Continue to checkout button -> `/checkout/:cartId`

### 4) Checkout page (`/checkout/:cartId`)

Sections:

- Shipping address
- Billing address
- Shipping method
- Payment form
- Final totals

Actions:

- `POST /v1/checkout/price`
- `POST /v1/orders`
- On success route to `/order-confirmation/:orderNumber`

### 5) Order confirmation page (`/order-confirmation/:orderNumber`)

Actions:

- `GET /v1/orders/{orderNumber}`
- Show order number, total, items, estimated production and shipping

### 6) Order tracking page (`/orders/:orderNumber`)

Actions:

- `GET /v1/orders/{orderNumber}`
- `GET /v1/orders/{orderNumber}/timeline`

## API modules mapping

- `yardSignsApi.js`
  - `getYardSignsConfig()`
  - `createYardSignsQuote(payload)`
  - `presignArtwork(payload)`
  - `completeArtworkUpload(payload)`

- `cartApi.js`
  - `createCartFromQuote(quoteId)`
  - `addQuoteItemToCart(cartId, quoteItemId, quantity)`
  - `getCart(cartId)`

- `checkoutApi.js`
  - `calculateCheckoutPrice(payload)`
  - `placeOrder(payload)`

- `ordersApi.js`
  - `getOrderSummary(orderNumber)`
  - `getOrderTimeline(orderNumber)`

## Validation rules (Yard Signs)

- Quantity minimum: 1
- Quantity maximum: 50000
- Supported file types: `.pdf`, `.ai`, `.eps`, `.psd`, `.tif`
- Max file size: 500 MB
- Required artwork per line item before place-order
- Rush turnaround cannot be selected if quantity exceeds pricing threshold without rule match

## MVP implementation order

1. Build `YardSignsQuotePage.jsx` with live quote API.
2. Build `YardSignsArtworkPage.jsx` with upload flow.
3. Build `CartPage.jsx` and `CheckoutPage.jsx`.
4. Build confirmation and tracking pages.
5. Wire route guards so checkout requires cart, and order pages require valid order number.
