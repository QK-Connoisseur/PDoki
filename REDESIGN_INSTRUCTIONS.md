# Developer Instructions: Pumdoki Profile Page Redesign & Feature Updates

This document provides specific, actionable instructions to implement the redesign and feature updates requested for the Pumdoki Profile Page. All modifications will primarily take place in `src/pages/ProfilePage.jsx`.

---

## Part 1: UI/UX & Design Overhaul (Contrast & Spacing)

### Task 1.1: Implement Card-Based Compartmentalization
**Target File:** `src/pages/ProfilePage.jsx`
*   **Background Update:** Locate the main wrapper or container for the Profile Page and change its background color to a soft off-white or light gray (e.g., add the Tailwind class `bg-gray-50` or `bg-[#F8F9FA]`).
*   **Container Wrapping:** Identify the three main structural areas (Left Menu/Services, Center Content, and Right Sidebar).
*   **Styling:** Wrap each of these areas in distinct white containers. Add classes like `bg-white`, `rounded-xl`, `shadow-sm` (or a light border like `border border-gray-100`), and `p-6` (to increase padding and eliminate the cramped feeling).

### Task 1.2: Improve Left-Hand Service Menu Contrast
**Target File:** `src/pages/ProfilePage.jsx`
*   **Active State:** Locate the mapping or rendering of the services list in the left-hand menu. Add a distinct "Active/Selected" state. When a service is active, apply a colored background fill (e.g., a light brand color) and bolder text (`font-bold` or `font-semibold`).
*   **Typography:** Increase the base font weight for all service titles to make them stand out more clearly.
*   **Pricing Badges:** Refactor the pricing display for each service (e.g., "$25 / 15 min"). Wrap the price in a badge or pill component by using classes like `bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium`.

### Task 1.3: Revamp Center Content Typography and Hierarchy
**Target File:** `src/pages/ProfilePage.jsx`
*   **Stats Highlighting:** Locate the Review Rating (e.g., ⭐ 4.8) and Served Count in the center content area. Wrap them in elements that use brand colors (like the existing pink `text-pink-600`) and larger font sizes (`text-lg` or `text-xl font-bold`).
*   **Description Readability:** Find the "About Me" or main description text and increase its line height (add the class `leading-relaxed` or `leading-loose`).
*   **Tags/Chips formatting:** Locate the "Styles" and "Platforms" sections which are currently comma-separated. Map over these strings/arrays and render each item as a visual tag. Use classes like `inline-block bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2`.

---

## Part 2: Functional & Navigation Updates

### Task 2.1: Simplify "Feed" Navigation Tab
**Target File:** `src/pages/ProfilePage.jsx`
*   **Locate Feed Tab Logic:** Around line 824 in `ProfilePage.jsx`, there is logic for a dropdown menu (`showFeedMenu`) specifically for the "feed" tab.
*   **Refactor to Direct Click:** 
    *   Remove the `showFeedMenu` state toggle and dropdown icon (`<svg ...>`).
    *   Change the `onClick` handler for the Feed tab to act as a single, direct-click navigation link (e.g., just set the active tab to "feed").
    *   Ensure clicking the "Feed" tab immediately loads the feed posts.

### Task 2.2: Remove Redundant "Media" Tab within Feed
**Target File:** `src/pages/ProfilePage.jsx`
*   **Remove Dropdown Options:** Remove the dropdown menu list entirely from the Feed tab (lines ~857-880). This eliminates the "Media" option under the Feed tab.
*   **Clean Up Sub-Views:** Remove the conditional rendering for the "Feed > Media Sub-View" (around line 1375).
*   **State Cleanup:** You can likely deprecate and remove the `feedSubView` state variable entirely, as the Feed tab will only have one view (posts).

### Task 2.3: Add "Free Content" Filter to Media Store
**Target File:** `src/pages/ProfilePage.jsx`
*   **State Management:** Add a new state variable at the top of the component (e.g., `const [showFreeOnly, setShowFreeOnly] = useState(false);`).
*   **UI Implementation:** Navigate to the "Media Store" tab rendering section (around line 1426). Add a filtering UI component (e.g., a toggle switch or a filter pill labeled "Free Content") at the top of this section.
*   **Filter Logic:** When mapping over the media store items, apply a filter based on the new state before mapping:
    ```javascript
    mediaStoreItems
      .filter(item => !showFreeOnly || item.price === 0 || item.price === "0.00")
      .map(item => ( ... ))
    ```
    (Ensure the exact property name matching your pricing structure is used).

---

## Acceptance Criteria Checklist
- [ ] Profile Page main background changed to off-white/gray, and main content areas are wrapped in distinct white cards with shadows/borders.
- [ ] Left service menu highlights the active service and displays pricing in contrasting pills/badges.
- [ ] Review Rating and Served Count are styled distinctly from body text.
- [ ] "About Me" text line-height is increased, and Styles/Platforms are rendered as visual chips.
- [ ] "Feed" tab dropdown icon and behavior are removed; it acts as a single click.
- [ ] Nested "Media" view inside the Feed is entirely removed.
- [ ] "Media Store" section includes a functional "Free Content" toggle that accurately filters `$0.00` items.
