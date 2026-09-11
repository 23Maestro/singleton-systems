# belong together setup

The Notion side is already built inside `23 Space`:

- [We Belong Together](https://app.notion.com/p/3d74c8bd6c26816c8999e616876ca71a?pvs=204)
- `Together List` database
- Gallery views for Amazon, Date Night, and Media Zone
- A `Weekend Plans` calendar based on `Plan Date`
- `Weekend Archive` and `Done` views

## share the page

1. Open `We Belong Together` in Notion.
2. Select **Share**, enter your partner’s Notion email, and choose **Can edit**.
3. Have your partner accept the invite.
4. On both phones, open Notion and confirm that `We Belong Together` appears under shared pages.
5. From each account, add a temporary item and mark it Done. Confirm the other account sees both changes before installing the Shortcut.

This keeps the shared system under `23 Space`. You do not need to rebuild the database on either phone.

## connect the shortcut

1. Go to [My integrations](https://www.notion.so/profile/integrations) and create an internal integration named `Belong Together Capture`.
2. Copy its internal integration secret.
3. Open `We Belong Together`, select the page menu, open **Connections**, and add `Belong Together Capture`.
4. Install `belong-together-capture.shortcut`. During import, paste the integration secret when asked.
5. Repeat the import on your partner’s phone. Paste the secret directly on that phone and do not send it in a shared note or message.

## pin the shortcut

For the Share Sheet, open the Shortcut’s details and keep **Show in Share Sheet** enabled. It accepts URLs, images, and text. In an app such as Safari, TikTok, YouTube, Amazon, or Photos, select **Share**, then **Edit Actions** if needed, and add `belong-together-capture` to Favorites.

For a widget, add the Shortcuts widget to the Home Screen, edit the widget, and choose `belong-together-capture`. You can also add the Shortcut itself to the Home Screen from its details.

For Siri, say “Siri, belong together capture.” A run with no shared item asks “Add to We Belong Together”.

## first run

Test an Amazon link, a video link, one photo, and a Weekend Plans note. The Weekend Plans branch asks for a day and places the item on that date. Confirm each success notification and check the result on both phones.
