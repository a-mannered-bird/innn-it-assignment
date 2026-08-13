import { useState, type FormEvent } from "react";
import { Form } from "@/components/react-aria/Form";
import { TextArea, TextField } from "@/components/react-aria/TextField";
import { Switch } from "@/components/react-aria/Switch";
import { Button } from "@/components/react-aria/Button";
import {
  CONTENT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  buildDraft,
  formatCharacterCount,
  isBlank,
  saveDraft,
} from "./draft";
import { DEFAULT_AUTHOR } from "./mock";
import styles from "./petition-update.module.scss";

/** Under `validationBehavior="native"` an empty `isRequired` field never
 * reaches submit, but whitespace-only input does — this catches it. */
const requireVisibleText = (message: string) => (value: string) =>
  isBlank(value) ? message : null;

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
  }

  return (
    <Form onSubmit={handleSubmit}>
      <TextField
        name="title"
        label="Titel"
        value={title}
        onChange={(value) => edit(() => setTitle(value))}
        isRequired
        maxLength={TITLE_MAX_LENGTH}
        validate={requireVisibleText("Bitte gib einen Titel ein.")}
        errorMessage="Bitte gib einen Titel ein."
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
        validate={requireVisibleText(
          "Bitte schreibe einen Text für dein Update.",
        )}
        errorMessage="Bitte schreibe einen Text für dein Update."
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
        // The default sender is not editable; the switch swaps the field
        // between showing it read-only and editing the custom name, so a
        // half-typed name never poses as the locked default.
        value={useCustomAuthor ? customAuthor : DEFAULT_AUTHOR}
        onChange={(value) => edit(() => setCustomAuthor(value))}
        isReadOnly={!useCustomAuthor}
        isRequired={useCustomAuthor}
        validate={
          useCustomAuthor
            ? requireVisibleText("Bitte gib einen Absender an.")
            : undefined
        }
        errorMessage="Bitte gib einen Absender an."
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
