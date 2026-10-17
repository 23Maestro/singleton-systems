# LEMON access

Verified 15 October 2026 on the 2015 Chevrolet Malibu LT 2.5L VIN L manual.

The vehicle page returned HTTP 200 with Python's standard urllib request.
The same URL returned 404 with the short `Mozilla/5.0` User-Agent. The browser
reader reported a redirect loop. Firecrawl returned 200 and the vehicle's
repair links. This is a verified client-access workaround; no server repair
is claimed.

## Find real pages

1. Open the vehicle entry from the live year index. Match engine and VIN code.
2. Follow its `Repair and Diagnosis, all links on one page` link. Save the
   index and its hash. The index supplies exact links to the leaf procedures.
3. Read actual `a href` links. An `a name` entry marks a folder in that index;
   several folder URLs returned 404 while their Removal and Installation
   procedure links returned 200. Follow those child links from the index.
4. Resolve each illustration's `img src` against the retrieved page URL.
   Download and inspect the image before marking it as useful evidence.
5. Use the engine-specific procedure when LTG and LKW share a manual. A title
   in the index proves a lead; the retrieved diagram establishes visible form.

Use Firecrawl when the direct page still fails or needs rendered extraction.
Retain the successful local page and image copies so modeling can use stable
references. An offline ZIP link on the vehicle page is another source-provided
option; check its size and storage destination before downloading it.
