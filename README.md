# Alutrends homepage

Open `alutrends-homepage.html` after extracting the ZIP. It contains its photos,
fonts, styles, product carousel, shared cart modules and PNG slip generator.
There are no runtime asset downloads. Customer reviews are labelled demos.

The supplied SEO copy is native HTML: a hero with one H1, the two illustrated
collection panels, hardware categories, sliding/casement information, five real
finish photo previews, trade enquiries, a product-detail gallery, locations,
nine keyboard-accessible FAQs, About ALUTRENDS and a project enquiry form.
Animated demo reviews remain alongside the new detail section at the user's
request. Category controls filter the real carousel without changing the cart's
complete catalogue. Product photos link to verified individual product pages.

The general project form opens a WhatsApp draft with the entered details; the
customer must review it and press Send. Company, email, quantity/opening sizes
and message are optional. Form details are not stored. This form is separate
from the existing cart checkout and does not generate or send a cart slip.

SEO title, description, canonical and social metadata are set for
`https://www.alutrends.com`. Organization structured data uses the supplied
brand and contact number, with no invented ratings, offices or offer prices.
Core text, FAQs and individual product fallback links remain available without
JavaScript. If embedding this file in Wix, configure the parent page's SEO
settings and native content too; an embedded document's metadata does not
replace its parent page's settings.

The header cart, search and menu open glass dialogs. Each section has an animated
action button; reduced motion preferences disable decorative animation. Product
finishes and packs must be selected before adding configured products. Quantities
are whole numbers from 1 to 100.

## Cart on other pages

Load these scripts in order on **every page of the same origin**:

```html
<script defer src="/alutrends-cart.js"></script>
<script defer src="/alutrends-catalogue.js"></script>
<script defer src="/alutrends-receipt.js"></script>
<script defer src="/alutrends-cart-widget.js"></script>
<button type="button" data-open-cart>Open cart</button>
```

Use `data-select-product="PRODUCT_ID"` on an Add to cart button to open the
required option selector. Product IDs are in `AlutrendsCatalogue.products`.
For a known, fully selected variant, `AlutrendsCart.add(VARIANT_ID, quantity)`
adds it directly. The catalogue script configures the cart when loaded after
the engine. Pages must supply the complete trusted catalogue.

Only selected IDs and quantities are stored in `alutrends.cart.v1`. Prices are
read from the catalogue. Tabs and pages on the same scheme, host and port sync
their cart. Separate downloaded files, different origins, unavailable storage,
and the existing Wix cart do not automatically share this cart. Include the
modules in the other site's pages to enable it there.

## Customer details and WhatsApp

Name, Indian mobile number, email, address, city and PIN code are required.
Customer details stay in memory while the dialog is open; they are not written
to browser storage. Closing the dialog clears the form and receipt preview.
The generated PNG includes the details, configurations, quantities and total.
Cart changes invalidate an existing slip so its totals cannot silently go stale.

`Share PNG` uses the device's file sharing menu where supported. Choose WhatsApp
and contact **9306566096**. Otherwise download the PNG, open the Alutrends chat,
attach the image and send it. `Open WhatsApp` opens **+91 9306566096** with enquiry
text; it cannot attach an image or send a message automatically.

Automatic PNG delivery is **not connected**. It needs a deployed backend and
an authorized WhatsApp Business provider. The backend must validate product
IDs, selected configurations, quantities and current prices, generate its own
slip, upload the image and send it through the provider. Keep provider
credentials server-side. Sender/recipient setup and provider messaging rules
must be confirmed before enabling delivery. This HTML takes no payment and
does not report an enquiry as delivered or confirmed.

## Catalogue and development

The snapshot contains all 30 products from Alutrends' public catalogue, captured
7 October 2026, with 119 finish/pack configurations. Unavailable configurations
cannot be added. Prices and availability are snapshots, not a live inventory
feed. Some shop pack labels do not establish whether billing is per piece or
per pack, so totals are labelled estimates and need Alutrends' confirmation.

After editing the shared JavaScript modules or homepage content interactions,
refresh their inline copies:

```sh
python3 scripts/build-homepage.py
```

For local development and same-origin cart checks:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /workspace/Alutrends_website
```

No build dependencies or server are needed to open the standalone HTML. HTTPS
and a supporting browser are needed for device file sharing. Manual PNG
download remains available when sharing is unsupported. Very large slips are
limited to 15,000 pixels high; the dialog gives a readable message if a long
enquiry needs shorter notes or separate slips.
