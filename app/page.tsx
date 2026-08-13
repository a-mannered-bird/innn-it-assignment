import { PetitionUpdateModal } from "@/features/petition-update/petition-update-modal";

// No page content besides the modal: everything behind the permanently open
// overlay would be inert and hidden from assistive technology anyway, so
// there is nothing honest to render there. The dialog title is the page h1.
export default function Home() {
  return <PetitionUpdateModal />;
}
