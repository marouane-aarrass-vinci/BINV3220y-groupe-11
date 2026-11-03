import { useState, type FormEvent } from "react";
import { ApiError } from "../utils/api.ts";

interface ApplicationFormProps {
  offerId: number;
  offerTitle: string;
  onApply: (offerId: number, message?: string) => Promise<unknown>;
}

const ApplicationForm = ({ offerId, offerTitle, onApply }: ApplicationFormProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || hasApplied) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onApply(offerId, message.trim() || undefined);
      setHasApplied(true);
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 409
          ? "Vous avez déjà postulé à cette offre ou elle n'est plus disponible."
          : reason instanceof Error
            ? reason.message
            : "L'envoi de la candidature a échoué.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasApplied) {
    return <p className="application-success" role="status">Candidature envoyée.</p>;
  }

  return (
    <form className="application-form" onSubmit={handleSubmit}>
      <label>
        Message facultatif
        <textarea
          aria-label={`Message facultatif pour ${offerTitle}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={2}
          disabled={isSubmitting}
        />
      </label>
      <button className="button button-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Postuler"}
      </button>
      {error !== null && <p className="application-error" role="alert">{error}</p>}
    </form>
  );
};

export default ApplicationForm;
