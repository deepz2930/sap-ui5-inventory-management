# Northwind Product Catalog — SAPUI5 Learning Project

A freestyle SAPUI5 (not Fiori Elements) master-detail app that lists
products from the public Northwind OData v2 service, lets you search,
and shows full details when you click a product.

## How to run it (no install needed)

Because this app loads UI5 straight from a CDN in `index.html`, you
only need *any* local static file server. From the `webapp` folder:

**Option A — VS Code**
Install the "Live Server" extension, right-click `index.html` → "Open with Live Server".

**Option B — Node**
```bash
npx http-server webapp -p 8080
```
Then open `http://localhost:8080`.

> Why can't you just double-click index.html? Browsers block module/
> resource loading over the `file://` protocol for security reasons —
> UI5 needs a real HTTP server, even a local one.

## Project structure

```
webapp/
├── index.html                       # Entry point — loads UI5 + CSS, boots the Component
├── manifest.json                    # App "descriptor" — config, not code
├── Component.js                      # Loads Northwind data, exposes it as an editable model
├── model/
│   └── formatter.js                  # Stock badge colors/labels, KPI counts
├── view/
│   ├── App.view.xml                  # Root view — SplitApp shell
│   ├── Products.view.xml             # List page: hero header, KPIs, filters, table
│   ├── Detail.view.xml               # Detail page: view/edit form
│   └── fragment/
│       └── AddProduct.fragment.xml   # "Create" dialog
├── controller/
│   ├── Products.controller.js        # Create, Delete, search, filter, navigation
│   └── Detail.controller.js          # Read, Update (edit/save/cancel), Delete
├── css/
│   └── style.css                     # Custom color palette + layout polish
└── i18n/
    └── i18n.properties               # Translatable text strings
```

## Why CRUD is "local" here

The public Northwind service only supports reading data (no writes) — that's
true of every free public demo it's practical to point at from a portfolio
project. So `Component.js` reads the real data once via OData, then copies
it into an in-memory JSONModel called `"products"`. Every Create, Update,
and Delete operation in this app works against that copy — refresh the page
and it resets to the original Northwind data.

**This is a legitimate technique to know**, not a shortcut to be embarrassed
about: it's exactly the same pattern you'd use with a mock/stub backend
during frontend development before a real API exists. If asked about it in
an interview, you can explain precisely this — and that swapping in a real
write-enabled OData v2/v4 service just means replacing the JSONModel calls
(`setProperty`, `push`, `splice`) with the model's `create()`, `update()`,
and `remove()` methods, which follow the same request/response pattern.

## Core concepts this project teaches

**1. MVC pattern**
- **View** (`.view.xml`) — pure UI markup, no logic
- **Controller** (`.controller.js`) — event handlers, navigation
- **Model** — the data (here, the Northwind OData service)

Views never contain business logic; controllers never contain markup.
This separation is what makes large UI5 apps maintainable.

**2. Data binding**
`items="{/Products}"` in Products.view.xml doesn't fetch data with
`fetch()` or `axios` — you declare *what* data you want, and UI5's
OData model handles the HTTP call, caching, and re-rendering for you.
This is the single biggest mental shift coming from React/Vue.

**3. manifest.json (the "app descriptor")**
Almost all configuration — which OData service to use, routing rules,
UI5 library dependencies — lives in this JSON file instead of code.
SAP designed it this way so tools (like Fiori Launchpad) can read an
app's capabilities without executing any JavaScript.

**4. Routing**
Notice `Products.controller.js` never calls `new Detail.view.xml()`
directly. Instead it calls `router.navTo("detail", {productID: 5})`.
The router (configured in manifest.json) translates that into a URL
hash (`#/Products(5)`) and shows/hides the right views automatically.
This gives you working browser back/forward buttons for free.

**5. bindElement vs items binding**
- `items="{/Products}"` = bind a **list** of many entities
- `bindElement({path: "/Products(5)"})` = bind a **single** entity to
  the whole view, so every control inside can bind directly to its
  fields (`{ProductName}`, `{UnitPrice}`, etc.)

## Controls used (good talking points for interviews)

`SplitApp`, `Table`/`ColumnListItem`, `ObjectStatus`, `ObjectNumber`,
`Dialog` (via `Fragment.load`), `MessageBox.confirm`, `MessageToast`,
`SearchField` + `Filter`/`FilterOperator`, `Select`, `SimpleForm`,
two-way data binding, expression binding (`{= ... }`), named/local
models (`"products"`, `"ui"`, `"newProduct"`), and router-driven
navigation with URL parameters.

## Suggested next steps to extend this (great for your resume)

1. Add sorting (a `<Button>` that toggles `oBinding.sort(...)`)
2. Add input validation (`valueState="Error"`) on the Add Product dialog
3. Convert this to **Fiori Elements** (List Report + Object Page) using
   OData annotations instead of hand-written XML — this is what real
   SAP projects use for standard CRUD apps
4. Point it at a real writable backend (SAP CAP, or your own Node/Express
   + OData-ish REST API) and swap the local CRUD calls for real HTTP calls
5. Deploy it to SAP BTP Cloud Foundry and add the live link to your
   resume/GitHub README
