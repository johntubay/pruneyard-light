# Pruneyard Cabinets: light version (option B, John)

This is a second layout option for the client to compare with the dark v2.1 build. It has the same 10 pages, file names, content and brief limits as v2.1, with a different look and different scroll animations. To preview it, open `index.html` in a browser.

**Look:** warm off-white backgrounds, stone-coloured cards, olive buttons and oak accents. Headings are Cormorant Garamond and body text is DM Sans. The second line of each heading is set in a softer grey.

**Ideas taken from Oakwell and Nuvo ADU:**

- numbered section labels (01 / …) with a line that draws in
- pill labels with icons
- three numbered service cards with photos underneath
- a full-width slider with a counter, arrows and chips that cycles automatically
- an accordion that swaps the photo beside it
- process cards that stack as you scroll
- large project photos with captions below
- a closing section with a large photo
- a light footer with a large wordmark

**Scroll animations (different from v2.1):**

- Headings come into focus from a blur, word by word.
- The hero photo zooms in on load, then shrinks into a rounded frame as you scroll.
- Photos are uncovered from the bottom up.
- On desktop, the Selected work row pins in place and scrolls sideways with a progress bar.
- Process cards stack, and the earlier ones shrink back.
- The closing photo section grows as it comes into view.
- The footer wordmark rises up.
- Smooth scrolling is provided by Lenis.

The animations use GSAP 3.12.5 with ScrollTrigger and Lenis 1.1.13, loaded from CDNs. If those scripts don't load, the site still works, with simpler fade-ins.

## Open items (same as v2.1)
- **Logo:** the header uses a typographic wordmark only as a stand-in. The final logo is still pending from Anthony.
- **Photos:** all photos are free Unsplash stock, loaded from images.unsplash.com. Replace them with Rob's photos once he sends them.
- **Project pages:** project pages 1 and 2 use placeholder text.
- **Enquiry form:** the form works only in the browser and sends nothing yet. Connect it to Duda or the CRM.
- **Licence number:** the CSLB number isn't shown yet. Confirm it before adding it.
