import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import { useApplications } from "../hooks/useApplications.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  PERIOD_LABELS,
} from "../utils/labels.ts";

interface MyApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const formatDate = (dateTime: string): string => {
  const [year, month, day] = dateTime.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

const MyApplicationsPage = ({ token, onUnauthorized }: MyApplicationsPageProps) => {
  const { applications, isLoading, error } = useApplications(token, onUnauthorized);

  if (error) return <ErrorState message={error} />;
  if (isLoading) return <LoadingState />;
  if (applications.length === 0) {
    return (
      <section>
        <h1>Mes candidatures</h1>
        <EmptyState message="Vous n'avez pas encore de candidature." />
      </section>
    );
  }

  return (
    <section>
      <h1>Mes candidatures</h1>
      <p className="result-count">
        {applications.length} candidature{applications.length > 1 ? "s" : ""}
      </p>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Offre</th>
              <th scope="col">Entreprise</th>
              <th scope="col">Année</th>
              <th scope="col">Période</th>
              <th scope="col">Message</th>
              <th scope="col">Date de candidature</th>
              <th scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{application.offer.title}</td>
                <td>{application.offer.companyShortName}</td>
                <td>{application.offer.academicYear}</td>
                <td>{PERIOD_LABELS[application.offer.period]}</td>
                <td>{application.message ?? "—"}</td>
                <td>
                  <time dateTime={application.appliedAt.replace(" ", "T")}>
                    {formatDate(application.appliedAt)}
                  </time>
                </td>
                <td>
                  <StatusBadge
                    label={APPLICATION_STATUS_LABELS[application.status]}
                    tone={APPLICATION_STATUS_TONES[application.status]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MyApplicationsPage;
