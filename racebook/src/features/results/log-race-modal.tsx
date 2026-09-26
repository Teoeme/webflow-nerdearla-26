"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { NewEventForm } from "./new-event-form";
import type { ClientResultsMessages } from "./client-messages";

// Opens the "add an event" form in a modal. On success the form's action
// redirects to the new event's page with the result modal already open
// (`?logResult=1`), so this component never needs to know about success.
export function LogRaceModal({
  messages,
  closeLabel,
  trigger,
}: {
  messages: ClientResultsMessages;
  closeLabel: string;
  trigger?: ReactNode;
}) {
  return (
    <Modal
      trigger={trigger ?? <Button>{messages.medalBoard.logRace}</Button>}
      title={messages.newEventForm.title}
      closeLabel={closeLabel}
    >
      <NewEventForm messages={messages} />
    </Modal>
  );
}
