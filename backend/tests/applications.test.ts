import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../src/db/database.ts";
import { OFFER, STUDENT, ADMINISTRATOR, CONTACT } from "../src/db/seed/seedIds.ts";
import type { UserKind } from "../src/models/user.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";

let db: Db;
let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  db = createTestDatabase();
  app = createTestApp(db);
});

const applyAs = (kind: UserKind, id: number, offerId: number | string) =>
  request(app)
    .post(`/offers/${offerId}/applications`)
    .set("Authorization", tokenFor(kind, id));

describe("POST /offers/:offerId/applications : accès", () => {
  it("refuse une requête sans session (401)", async () => {
    const response = await request(app).post(`/offers/${OFFER.DATA_QUALITY}/applications`);

    expect(response.status).toBe(401);
  });

  it.each([
    ["administrateur", "ADMIN", ADMINISTRATOR.ANNE_LECLERCQ],
    ["contact déposant", "CONTACT", CONTACT.MARC_LEJEUNE],
  ] as const)("refuse un %s (403)", async (_profile, kind, id) => {
    const response = await applyAs(kind, id, OFFER.DATA_QUALITY).send({});

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});

describe("POST /offers/:offerId/applications : création", () => {
  it("crée une candidature pour l'étudiant connecté avec son message facultatif", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, OFFER.DATA_QUALITY).send({
      message: "  Le sujet correspond à mon projet professionnel.  ",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.DATA_QUALITY,
      message: "Le sujet correspond à mon projet professionnel.",
      status: "IN_PROGRESS",
    });
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.appliedAt).toEqual(expect.any(String));
    expect(response.body.studentId).toBeUndefined();
    expect(
      db
        .prepare("SELECT student_id, message, status FROM applications WHERE offer_id = ? AND student_id = ?")
        .get(OFFER.DATA_QUALITY, STUDENT.LUCAS_DUPONT),
    ).toEqual({
      student_id: STUDENT.LUCAS_DUPONT,
      message: "Le sujet correspond à mon projet professionnel.",
      status: "IN_PROGRESS",
    });
  });

  it("accepte un message omis ou vide", async () => {
    const withoutMessage = await applyAs(
      "STUDENT",
      STUDENT.LUCAS_DUPONT,
      OFFER.DATA_QUALITY,
    ).send({});

    expect(withoutMessage.status).toBe(201);
    expect(withoutMessage.body.message).toBeNull();
  });

  it("refuse une offre inexistante", async () => {
    const response = await applyAs("STUDENT", STUDENT.LUCAS_DUPONT, 9999).send({});

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("OFFER_NOT_FOUND");
  });

  it.each(["SUBMITTED", "PENDING", "ASSIGNED", "ARCHIVED"])(
    "refuse une offre au statut %s",
    async (status) => {
      db.prepare("UPDATE offers SET status = ? WHERE id = ?").run(status, OFFER.DATA_QUALITY);

      const response = await applyAs(
        "STUDENT",
        STUDENT.LUCAS_DUPONT,
        OFFER.DATA_QUALITY,
      ).send({});

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("OFFER_NOT_PUBLISHED");
    },
  );
});

describe("POST /offers/:offerId/applications : validation et unicité", () => {
  it.each(["0", "-1", "abc", "1.5", "9007199254740992"])(
    "rejette un identifiant invalide (%s)",
    async (offerId) => {
      const response = await applyAs(
        "STUDENT",
        STUDENT.LUCAS_DUPONT,
        offerId,
      ).send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_PARAM");
    },
  );

  it.each([
    ["message non textuel", { message: 42 }],
    ["champ studentId fourni par le client", { message: "Bonjour", studentId: STUDENT.INES_HADDAD }],
  ])("rejette un corps invalide (%s)", async (_label, body) => {
    const response = await applyAs(
      "STUDENT",
      STUDENT.LUCAS_DUPONT,
      OFFER.DATA_QUALITY,
    ).send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });

  it.each([
    ["déjà en cours", OFFER.FLEET_APP, STUDENT.LUCAS_DUPONT],
    ["déjà retirée", OFFER.BILLING_API, STUDENT.INES_HADDAD],
  ])("empêche une candidature %s pour le même étudiant et la même offre", async (_case, offerId, studentId) => {
    const response = await applyAs("STUDENT", studentId, offerId).send({});

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_ALREADY_EXISTS");
    const count = db
      .prepare("SELECT COUNT(*) AS count FROM applications WHERE offer_id = ? AND student_id = ?")
      .get(offerId, studentId) as { count: number };
    expect(count.count).toBe(1);
  });
});
