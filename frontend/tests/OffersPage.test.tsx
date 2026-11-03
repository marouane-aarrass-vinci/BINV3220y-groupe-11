import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

const publishedOffer = {
  id: 5,
  title: "Tableau de bord de qualité des données",
  companyShortName: "Lumen Data",
  academicYear: "2026-2027",
  period: "P2",
  status: "PUBLISHED",
};

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("transmet la période choisie à l'API et permet de revenir à toutes les périodes", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    const periodSelect = screen.getByRole("combobox", { name: "Période" });
    expect(periodSelect).toHaveValue("");
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/offers");
    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();

    fireEvent.change(periodSelect, { target: { value: "P1" } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/offers?period=P1");

    fireEvent.change(periodSelect, { target: { value: "" } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[2]?.[0]).toBe("/api/offers");
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });

  it("permet à un étudiant de postuler avec un message facultatif", async () => {
    const fetchMock = stubFetch({
      "/api/offers": () => Response.json([publishedOffer]),
      "/api/offers/5/applications": () =>
        Response.json(
          {
            id: 10,
            offerId: 5,
            message: "Le sujet m'intéresse.",
            status: "IN_PROGRESS",
            appliedAt: "2026-11-03 14:00:00",
          },
          { status: 201 },
        ),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("button", { name: "Postuler" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Message facultatif pour Tableau de bord de qualité des données" }), {
      target: { value: "  Le sujet m'intéresse.  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Postuler" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Candidature envoyée.");
    const [url, init] = fetchMock.mock.calls[1] ?? [];
    expect(url).toBe("/api/offers/5/applications");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      Authorization: "jeton",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(init?.body))).toEqual({ message: "Le sujet m'intéresse." });
  });

  it("envoie un corps sans message quand le champ facultatif est vide", async () => {
    const fetchMock = stubFetch({
      "/api/offers": () => Response.json([publishedOffer]),
      "/api/offers/5/applications": () =>
        Response.json({
          id: 10,
          offerId: 5,
          message: null,
          status: "IN_PROGRESS",
          appliedAt: "2026-11-03 14:00:00",
        }),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Postuler" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Candidature envoyée.");
    const init = fetchMock.mock.calls[1]?.[1];
    expect(JSON.parse(String(init?.body))).toEqual({});
  });

  it("ne propose pas de candidature aux autres profils", async () => {
    stubFetch({ "/api/offers": () => Response.json([publishedOffer]) });

    const { unmount } = render(
      <OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    await screen.findByText(publishedOffer.title);
    expect(screen.queryByRole("button", { name: "Postuler" })).not.toBeInTheDocument();
    unmount();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText(publishedOffer.title);
    expect(screen.queryByRole("button", { name: "Postuler" })).not.toBeInTheDocument();
  });

  it("affiche un message clair si l'offre n'est plus disponible ou déjà postulée", async () => {
    stubFetch({
      "/api/offers": () => Response.json([publishedOffer]),
      "/api/offers/5/applications": () => new Response(null, { status: 409 }),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Postuler" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Vous avez déjà postulé à cette offre ou elle n'est plus disponible.",
    );
  });

  it("déconnecte l'étudiant si la session expire pendant la candidature", async () => {
    const onUnauthorized = vi.fn();
    stubFetch({
      "/api/offers": () => Response.json([publishedOffer]),
      "/api/offers/5/applications": () => new Response(null, { status: 401 }),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={onUnauthorized} />);
    fireEvent.click(await screen.findByRole("button", { name: "Postuler" }));

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
