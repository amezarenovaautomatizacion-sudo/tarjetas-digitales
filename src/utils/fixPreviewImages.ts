const BASE64_IMAGE_REGEX =
  /(?<!['"=])(data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]{100,})/g;
 
export function fixPreviewImages(html: string): string {
  if (!html) return html;
 
  return html.replace(BASE64_IMAGE_REGEX, (match) => {
    return `<img src="${match}" style="max-width:100%;height:auto;display:block;" />`;
  });
}
 