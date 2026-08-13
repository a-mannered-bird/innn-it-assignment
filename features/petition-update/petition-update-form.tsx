import { useState } from "react";
import type { FormProps } from "react-aria-components/Form";
import { Form } from "@/components/react-aria/Form";
import { TextArea, TextField } from "@/components/react-aria/TextField";
import { Switch } from "@/components/react-aria/Switch";
import { Button } from "@/components/react-aria/Button";
import {
  CONTENT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  buildDraft,
  saveDraft,
} from "./draft";
import { formatCharacterCount } from "@/lib/string-utils";
import {
  AUTHOR_REQUIRED,
  CONTENT_REQUIRED,
  TITLE_REQUIRED,
  requireVisibleText,
} from "@/lib/validation";
import { DEFAULT_AUTHOR } from "./mock";
import styles from "./petition-update.module.scss";

export function PetitionUpdateForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [useCustomAuthor, setUseCustomAuthor] = useState(false);
  const [customAuthor, setCustomAuthor] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Any edit after a save invalidates "saved": the message is state, not a
  // toast, so it must never claim a stale draft is stored.
  function edit(action: () => void) {
    action();
    setIsSaved(false);
  }

  const handleSubmit: FormProps["onSubmit"] = (event) => {
    // React Aria only calls onSubmit once every constraint passes, so the
    // handler's jobs are stopping navigation and persisting the draft.
    event.preventDefault();
    saveDraft(
      buildDraft({
        title,
        content,
        useCustomAuthor,
        customAuthor,
        defaultAuthor: DEFAULT_AUTHOR,
      }),
      window.localStorage,
    );
    setIsSaved(true);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <TextField
        name="title"
        label="Titel"
        value={title}
        onChange={(value) => edit(() => setTitle(value))}
        isRequired
        maxLength={TITLE_MAX_LENGTH}
        validate={requireVisibleText(TITLE_REQUIRED)}
        errorMessage={TITLE_REQUIRED}
        className={styles.countedField}
        description={formatCharacterCount(title.length, TITLE_MAX_LENGTH)}
      />

      <TextArea
        name="content"
        label="Deine Neuigkeiten"
        placeholder="Bitte schreibe ein paar Worte zu deinem Update."
        value={content}
        onChange={(value) => edit(() => setContent(value))}
        isRequired
        maxLength={CONTENT_MAX_LENGTH}
        validate={requireVisibleText(CONTENT_REQUIRED)}
        errorMessage={CONTENT_REQUIRED}
        className={styles.countedField}
        description={formatCharacterCount(content.length, CONTENT_MAX_LENGTH)}
      />

      <div className={styles.authorHeader}>
        <h2 className={styles.authorHeading}>Absender</h2>
        <Switch
          isSelected={useCustomAuthor}
          onChange={(isSelected) => edit(() => setUseCustomAuthor(isSelected))}
        >
          Absender ändern
        </Switch>
      </div>
      <p className={styles.authorHint}>
        Hier hast du die Option, das Update unter einem anderen Namen zu
        veröffentlichen.
      </p>
      <TextField
        name="author"
        label="Absender"
        value={useCustomAuthor ? customAuthor : DEFAULT_AUTHOR}
        onChange={(value) => edit(() => setCustomAuthor(value))}
        // Read-only rather than disabled while the switch is off — the
        // brief's own wording, and the better a11y call: the field stays in
        // the tab order and its value (who the update publishes as) stays
        // perceivable to screen readers, while a disabled field drops out of
        // the tab order and is exempt from contrast requirements.
        isReadOnly={!useCustomAuthor}
        isRequired={useCustomAuthor}
        validate={
          useCustomAuthor ? requireVisibleText(AUTHOR_REQUIRED) : undefined
        }
        errorMessage={AUTHOR_REQUIRED}
      />

      <div className={styles.actions}>
        {/* Abbrechen and Update veröffentlichen deliberately do nothing, and
            must not close the modal — both per the brief. */}
        <Button type="button" variant="secondary">
          Abbrechen
        </Button>
        <Button type="submit">Entwurf speichern</Button>
        <Button type="button">Update veröffentlichen</Button>
      </div>

      {/* Always-rendered status region: text appearing inside it is announced
          politely, while focus stays on the button the user just pressed. */}
      <div role="status" className={styles.status}>
        {isSaved && <p>Dein Entwurf wurde gespeichert.</p>}
      </div>
    </Form>
  );
}
