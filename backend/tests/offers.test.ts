import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, CONTACT, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import type { UserKind } from "../src/models/user.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const listOffersAs = (kind: UserKind, id: number) =>
  request(app).get("/offers").set("Authorization", tokenFor(kind, id));

const offerIds = (body: { id: number }[]): number[] => body.map((offer) => offer.id);

describe("GET /offers : accès", () => {
  it("refuse une requête sans session (401)", async () => {
    const response = await request(app).get("/offers");

    expect(response.status).toBe(401);
  });

  it.each([
    ["promoteur et signataire", CONTACT.NADIA_CHERIF],
    ["signataire uniquement", CONTACT.NATHALIE_RENARD],
    ["promoteur uniquement", CONTACT.LAURA_SIMON],
  ])("refuse un contact %s (403)", async (_profile, id) => {
    const response = await listOffersAs("CONTACT", id);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("GET /offers : visibilité selon le profil", () => {
  it("montre toutes les offres à un administrateur, de la plus récente année à la plus ancienne", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(10);
    expect(response.body.at(-1)).toEqual({
      id: OFFER.PDF_REPORTS,
      title: "Module de rapports PDF",
      companyShortName: "Orbis",
      academicYear: "2025-2026",
      period: "P1",
      status: "ARCHIVED",
    });
  });

  describe("GET /offers : filtre par période", () => {
    it.each([
      ["P1", [OFFER.PDF_REPORTS]],
      ["P2", [
        OFFER.CLIENT_PORTAL,
        OFFER.INTERNAL_CHATBOT,
        OFFER.DATA_QUALITY,
        OFFER.FLEET_APP,
        OFFER.BILLING_API,
        OFFER.CLOUD_MIGRATION,
        OFFER.ARCHIVE_DIGITIZATION,
      ]],
      ["OTHER", [OFFER.CONSULTANT_PLANNING, OFFER.E2E_TESTS]],
    ] as const)("filtre les offres de l'administrateur sur %s", async (period, expectedIds) => {
      const response = await request(app)
        .get(`/offers?period=${period}`)
        .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

      expect(response.status).toBe(200);
      expect(offerIds(response.body)).toEqual(expectedIds);
      expect(response.body.every((offer: { period: string }) => offer.period === period)).toBe(true);
    });

    it("combine le filtre avec la visibilité de l'étudiant et du déposant", async () => {
      const studentResponse = await request(app)
        .get("/offers?period=OTHER")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));
      const depositorResponse = await request(app)
        .get("/offers?period=OTHER")
        .set("Authorization", tokenFor("CONTACT", CONTACT.MARC_LEJEUNE));

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body).toEqual([]);
      expect(depositorResponse.status).toBe(200);
      expect(offerIds(depositorResponse.body)).toEqual([OFFER.E2E_TESTS]);
    });

    it.each(["INVALID", "P1&period=P2"])("rejette un paramètre period invalide ou répété (%s)", async (query) => {
      const response = await request(app)
        .get(`/offers?period=${query}`)
        .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_QUERY");
    });
  });

  it("ne montre que les offres publiées à un étudiant", async () => {
    const response = await listOffersAs("STUDENT", STUDENT.LUCAS_DUPONT);

    expect(offerIds(response.body)).toEqual([
      OFFER.INTERNAL_CHATBOT,
      OFFER.DATA_QUALITY,
      OFFER.FLEET_APP,
      OFFER.BILLING_API,
    ]);
    expect(response.body.every((o: { status: string }) => o.status === "PUBLISHED")).toBe(true);
  });

  describe("GET /offers : recherche par titre", () => {
    it("recherche une expression partielle sans tenir compte de la casse et des espaces externes", async () => {
      const response = await request(app)
        .get("/offers?search=%20%20TABLEAU%20DE%20BORD%20%20")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

      expect(response.status).toBe(200);
      expect(offerIds(response.body)).toEqual([OFFER.DATA_QUALITY]);
    });

    it("ignore la casse des lettres accentuées", async () => {
      const response = await request(app)
        .get("/offers?search=QUALIT%C3%89")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

      expect(response.status).toBe(200);
      expect(offerIds(response.body)).toEqual([OFFER.DATA_QUALITY]);
    });

    it("traite plusieurs mots comme une expression continue", async () => {
      const matching = await request(app)
        .get("/offers?search=TABLEAU%20DE%20BORD")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));
      const nonMatching = await request(app)
        .get("/offers?search=BORD%20TABLEAU")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

      expect(matching.status).toBe(200);
      expect(offerIds(matching.body)).toEqual([OFFER.DATA_QUALITY]);
      expect(nonMatching.status).toBe(200);
      expect(nonMatching.body).toEqual([]);
    });

    it("renvoie une liste vide sans correspondance et les offres normales pour une recherche vide", async () => {
      const unmatched = await request(app)
        .get("/offers?search=aucune-correspondance")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));
      const blank = await request(app)
        .get("/offers?search=%20%20")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

      expect(unmatched.status).toBe(200);
      expect(unmatched.body).toEqual([]);
      expect(blank.status).toBe(200);
      expect(offerIds(blank.body)).toEqual([
        OFFER.INTERNAL_CHATBOT,
        OFFER.DATA_QUALITY,
        OFFER.FLEET_APP,
        OFFER.BILLING_API,
      ]);
    });

    it("combine la période et conserve la visibilité des offres", async () => {
      const matchingPeriod = await request(app)
        .get("/offers?period=P2&search=API")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));
      const otherPeriod = await request(app)
        .get("/offers?period=P1&search=API")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));
      const unpublished = await request(app)
        .get("/offers?search=Migration")
        .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));
      const admin = await request(app)
        .get("/offers?search=Migration")
        .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));

      expect(matchingPeriod.status).toBe(200);
      expect(offerIds(matchingPeriod.body)).toEqual([OFFER.BILLING_API]);
      expect(otherPeriod.status).toBe(200);
      expect(otherPeriod.body).toEqual([]);
      expect(unpublished.status).toBe(200);
      expect(unpublished.body).toEqual([]);
      expect(admin.status).toBe(200);
      expect(offerIds(admin.body)).toEqual([OFFER.CLOUD_MIGRATION]);
    });
  });

  it("montre à un déposant toutes ses offres, quel que soit leur statut", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.MARC_LEJEUNE);

    expect(offerIds(response.body)).toEqual([
      OFFER.E2E_TESTS,
      OFFER.BILLING_API,
      OFFER.PDF_REPORTS,
    ]);
  });

  it("ne montre pas à un déposant l'offre d'un collègue de la même entreprise", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.CLAIRE_DUMONT);

    expect(offerIds(response.body)).toEqual([OFFER.FLEET_APP]);
    expect(offerIds(response.body)).not.toContain(OFFER.CLIENT_PORTAL);
  });

  it("montre à un contact multi-entreprises ses offres dans ses deux entreprises", async () => {
    const response = await listOffersAs("CONTACT", CONTACT.JULIEN_LAMBERT);

    expect(response.body.map((o: { companyShortName: string }) => o.companyShortName)).toEqual([
      "Lumen Digital",
      "Lumen Data",
    ]);
    expect(offerIds(response.body)).toEqual([OFFER.CLIENT_PORTAL, OFFER.DATA_QUALITY]);
  });

  it("n'expose que les champs du DTO", async () => {
    const response = await listOffersAs("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ);

    expect(Object.keys(response.body[0]).sort()).toEqual(
      ["academicYear", "companyShortName", "id", "period", "status", "title"],
    );
  });
});
