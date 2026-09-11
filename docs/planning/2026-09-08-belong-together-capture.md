# belong together capture

## outcome

`We Belong Together` is a shared Notion page inside `23 Space`. One iOS Shortcut saves links, images, or text into its `Together List` database.

The live page is [We Belong Together](https://app.notion.com/p/3d74c8bd6c26816c8999e616876ca71a?pvs=204).

## data model

Each capture becomes one database page.

| field | purpose |
| --- | --- |
| Name | visible title |
| Category | Amazon, Date Night, Weekend Plans, or Media Zone |
| URL | original shared link |
| Preview | uploaded image |
| Plan Date | day for a Weekend Plans entry |
| Done | completed, watched, visited, or purchased |
| Added | automatic creation time |

Amazon, Date Night, and Media Zone use gallery views. URL entries contain a native Notion bookmark block so TikTok, YouTube, Amazon, and other supported links can render previews. Image entries use Notion file uploads and display the image in the page.

Weekend Plans uses a calendar based on `Plan Date`. The Shortcut asks “What day is this plan for?” after that category is chosen. Completed plans leave the active calendar and appear in `Weekend Archive`.

## capture flow

1. Receive a URL, image, or text from the Share Sheet. A widget, home screen, or Siri run asks “Add to We Belong Together”.
2. Choose Amazon, Date Night, Weekend Plans, or Media Zone.
3. Ask for a date only for Weekend Plans.
4. Create the database page through Notion’s API.
5. Confirm the returned page URL, play a success haptic, and show “Added to {category}”.
6. Show a clear error when Notion does not return a created page.

The Shortcut uses Apple actions and Notion’s API. Its import question asks for one internal integration secret. The secret is kept out of the source file and repo.

## acceptance check

On both phones, save one item into each category. Use a TikTok or YouTube link for Media Zone, an Amazon link, one photo, and one typed Weekend Plans note with a future date. Confirm both accounts see the same entries, calendar day, previews, and Done changes.

Calendar app setup remains a separate task.
