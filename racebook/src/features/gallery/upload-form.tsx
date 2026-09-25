import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { GalleryMessages } from "@/i18n/messages/gallery.en";

const ACCEPTED_PHOTO_TYPES = "image/jpeg,image/png,image/webp";

export function UploadForm({
  eventId,
  messages,
}: {
  eventId: string;
  messages: GalleryMessages["eventGallery"];
}) {
  return (
    <form
      method="post"
      action="/api/photos"
      encType="multipart/form-data"
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="eventId" value={eventId} />
      <Field label={messages.uploadFieldLabel} htmlFor="photo-upload">
        <Input id="photo-upload" type="file" name="photo" accept={ACCEPTED_PHOTO_TYPES} required />
      </Field>
      <Button type="submit">{messages.uploadButton}</Button>
    </form>
  );
}
