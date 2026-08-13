import { useState, useSyncExternalStore } from "react";
import type { FormProps } from "react-aria-components/Form";
import { Form } from "@/components/react-aria/Form";
import { TextArea, TextField } from "@/components/react-aria/TextField";
import { Switch } from "@/components/react-aria/Switch";
import { Button } from "@/components/react-aria/Button";
import {
  CONTENT_MAX_LENGTH,
  DRAFT_STORAGE_KEY,
  TITLE_MAX_LENGTH,
  buildDraft,
  parseDraft,
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

// Never notifies: the stored draft only needs to be read once, right after
// hydration, not watched for the rest of the session.
function subscribeToNothing() {
  return () => {};
}

function getStoredDraftJson() {
  return window.localStorage.getItem(DRAFT_STORAGE_KEY);
}

function getServerDraftJson() {
  return null;
}

export function PetitionUpdateForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [useCustomAuthor, setUseCustomAuthor] = useState(false);
  const [customAuthor, setCustomAuthor] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // localStorage doesn't exist during SSR. useSyncExternalStore returns
  // getServerDraftJson (null) for the server-rendered markup and the first
  // client render, matching it exactly, then re-reads after hydration — the
  // supported way to pull in a browser-only value without a mismatch.
  const storedDraftJson = useSyncExternalStore(
    subscribeToNothing,
    getStoredDraftJson,
    getServerDraftJson,
  );

  // Seeds the fields once when a stored draft first appears post-hydration.
  // This runs during render (React's sanctioned way to adjust state from an
  // external value, guarded against re-running), not in an effect, so it
  // never re-fires and clobber the fields once the user starts typing.
  // isSaved deliberately stays false: that message means "just saved", not
  // "matches what's stored".
  const [appliedDraftJson, setAppliedDraftJson] = useState<string | null>(null);
  if (storedDraftJson !== null && storedDraftJson !== appliedDraftJson) {
    setAppliedDraftJson(storedDraftJson);
    const draft = parseDraft(storedDraftJson);
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      if (draft.author !== DEFAULT_AUTHOR) {
        setUseCustomAuthor(true);
        setCustomAuthor(draft.author);
      }
    }
  }

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
        <Button type="button" variant="secondary" className="pill-button">
          Abbrechen
        </Button>
        <Button type="submit" className="pill-button">
          Entwurf speichern
        </Button>
        <Button type="button" className="pill-button cta-button">
          Update veröffentlichen
        </Button>
      </div>

      {/* Always-rendered status region: text appearing inside it is announced
          politely, while focus stays on the button the user just pressed. */}
      <div role="status" className={styles.status}>
        {isSaved && <p>Dein Entwurf wurde gespeichert.</p>}
      </div>
    </Form>
  );
}
