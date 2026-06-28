# Dev fixtures

Mock/sample data used by the prototype UI and by tests, kept out of component
bodies so it can be swapped for real API responses during integration.

Pattern (applied per-page as each screen is wired to `/api/v1`):

1. Move a page's inline mock array into a `*.js` file here.
2. Import it where the page currently hardcodes the data.
3. When the matching API endpoint exists, replace the import with an API call
   and keep the fixture only for tests/Storybook.

Current fixtures:

- `moments.js` — sample moment-rail data for `sortMomentRail`'s tests.
- `chatContacts.js`, `notifications.js` — shared header/chat-rail data used by
  the `MemberLayout` shell (previously duplicated across five pages).
- `homeFeed.js` — Home moments rail + following/For-You feeds.
- `storeContent.js` — Store catalogue items.
- `connectCreators.js` — Connect creators + spotlight slides.
- `promotions.js` — promotional offers.
- `profile.js` — creator profile header, services, reviews, posts, and media.

Page-local UI config (filter tab definitions, colour constants) intentionally
stays in the component; only content/mock *data* moves here. Only
sample/non-production data belongs here — never real user data, secrets, or
identity documents.
