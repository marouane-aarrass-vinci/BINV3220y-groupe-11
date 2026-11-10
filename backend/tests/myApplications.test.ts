import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import {
  ADMINISTRATOR,
  APPLICATION,
  CONTACT,
  OFFER,
  STUDENT,
} from "../src/db/seed/seedIds.ts";
import type { UserKind } from "../src/models/user.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const listApplicationsAs = (kind: UserKind, id: number) =>
  request(app).get("/applications").set("Authorization", tokenFor(kind, id));

describe("GET /applications : accès", () => {
  it("refuse une requête sans session (401)", async () => {
    const response = await request(app).get("/applications");

    expect(response.status).toBe(401);
  });

  it.each([
    ["administrateur", "ADMIN", ADMINISTRATOR.ANNE_LECLERCQ],
    ["contact déposant", "CONTACT", CONTACT.MARC_LEJEUNE],
    ["contact promoteur", "CONTACT", CONTACT.NADIA_CHERIF],
  ] as const)("refuse un %s (403)", async (_profile, kind, id) => {
    const response = await listApplicationsAs(kind, id);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("GET /applications : candidatures propres à l'étudiant", () => {
  it("retourne uniquement les candidatures de l'étudiant authentifié et les informations utiles", async () => {
    const response = await listApplicationsAs("STUDENT", STUDENT.LUCAS_DUPONT);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: APPLICATION.LUCAS_FLEET_APP,
        offer: {
          id: OFFER.FLEET_APP,
          title: "Application React de gestion de flotte",
          companyShortName: "Lumen Digital",
          academicYear: "2026-2027",
          period: "P2",
        },
        message: "Le développement React m'intéresse particulièrement.",
        status: "IN_PROGRESS",
        appliedAt: "2026-10-02 18:10:00",
      },
    ]);
    expect(response.body[0].studentId).toBeUndefined();
  });

  it("ignore un studentId fourni par le client et filtre selon la session", async () => {
    const response = await request(app)
      .get(`/applications?studentId=${STUDENT.INES_HADDAD}`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body.map((application: { id: number }) => application.id)).toEqual([
      APPLICATION.LUCAS_FLEET_APP,
    ]);
    expect(
      response.body.some(
        (application: { id: number }) => application.id === APPLICATION.INES_FLEET_APP,
      ),
    ).toBe(false);
  });

  it("inclut les statuts en cours et retiré sans permettre de modifier une candidature", async () => {
    const response = await listApplicationsAs("STUDENT", STUDENT.INES_HADDAD);

    expect(response.status).toBe(200);
    expect(response.body.map((application: { status: string }) => application.status)).toEqual([
      "IN_PROGRESS",
      "WITHDRAWN",
    ]);
    expect(
      response.body.every((application: { offer: { title: string } }) =>
        typeof application.offer.title === "string",
      ),
    ).toBe(true);
  });

  it("expose les quatre statuts du domaine dans la liste des étudiants concernés", async () => {
    const [selected, rejected, inProgress, withdrawn] = await Promise.all([
      listApplicationsAs("STUDENT", STUDENT.MATEUSZ_KOWALSKI),
      listApplicationsAs("STUDENT", STUDENT.LEA_MERTENS),
      listApplicationsAs("STUDENT", STUDENT.YOUSSEF_EL_AMRANI),
      listApplicationsAs("STUDENT", STUDENT.INES_HADDAD),
    ]);

    expect([
      selected.body[0].status,
      rejected.body[0].status,
      inProgress.body[0].status,
      withdrawn.body.find((application: { status: string }) => application.status === "WITHDRAWN")
        ?.status,
    ]).toEqual(["SELECTED", "REJECTED", "IN_PROGRESS", "WITHDRAWN"]);
  });

  it("retourne une liste vide pour un étudiant sans candidature", async () => {
    const response = await listApplicationsAs("STUDENT", STUDENT.LOUIS_CLAES);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
