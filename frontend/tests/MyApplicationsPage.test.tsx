import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MyApplicationsPage from "../src/pages/MyApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offer: {
      id: 5,
      title: "Tableau de bord de qualité des données",
      companyShortName: "Lumen Data",
      academicYear: "2026-2027",
      period: "P2",
    },
    message: "Je souhaite approfondir le sujet.",
    status: "IN_PROGRESS",
    appliedAt: "2026-10-04 14:50:00",
  },
  {
    id: 2,
    offer: {
      id: 6,
      title: "Migration d'une application vers le cloud",
      companyShortName: "Datavia",
      academicYear: "2026-2027",
      period: "P2",
    },
    message: null,
    status: "SELECTED",
    appliedAt: "2026-09-22 12:00:00",
  },
  {
    id: 3,
    offer: {
      id: 7,
      title: "Assistant conversationnel interne",
      companyShortName: "Nexalis",
      academicYear: "2026-2027",
      period: "OTHER",
    },
    message: null,
    status: "REJECTED",
    appliedAt: "2026-09-20 09:00:00",
  },
  {
    id: 4,
    offer: {
      id: 3,
      title: "API REST de facturation",
      companyShortName: "Orbis",
      academicYear: "2026-2027",
      period: "P2",
    },
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2026-09-18 09:00:00",
  },
];

describe("MyApplicationsPage", () => {
  it("affiche les informations de chaque candidature et les quatre statuts en français", async () => {
    const fetchMock = stubFetch({ "/api/applications": () => Response.json(applications) });

    render(<MyApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("heading", { name: "Mes candidatures" })).toBeInTheDocument();
    expect(screen.getByText("Tableau de bord de qualité des données")).toBeInTheDocument();
    expect(screen.getByText("Lumen Data")).toBeInTheDocument();
    expect(screen.getAllByText("2026-2027")).toHaveLength(4);
    expect(screen.getByRole("cell", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("Je souhaite approfondir le sujet.")).toBeInTheDocument();
    expect(screen.getByText("04/10/2026")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);
    expect(screen.getByText("4 candidatures")).toBeInTheDocument();
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/applications");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { Authorization: "jeton" },
    });
  });

  it("affiche un état vide sans candidatures", async () => {
    stubFetch({ "/api/applications": () => Response.json([]) });

    render(<MyApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Vous n'avez pas encore de candidature.")).toBeInTheDocument();
  });

  it("signale les erreurs renvoyées par le backend", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 500 }) });

    render(<MyApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Chargement de vos candidatures impossible (statut 500)",
    );
  });

  it("déconnecte l'étudiant quand sa session a expiré", async () => {
    const onUnauthorized = vi.fn();
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });

    render(<MyApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
