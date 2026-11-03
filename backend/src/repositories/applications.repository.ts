import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";
import type { OfferStatus } from "../models/offer.ts";

interface OfferStatusDbo {
  status: OfferStatus;
}

interface ApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

export const createApplicationsRepository = (db: Db) => {
  const findOfferStatus = db.prepare<[number], OfferStatusDbo>(
    "SELECT status FROM offers WHERE id = ?",
  );
  const insertApplication = db.prepare<ApplicationParams, ApplicationDbo>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
    ON CONFLICT (offer_id, student_id) DO NOTHING
    RETURNING id, offer_id, student_id, message, status, applied_at
  `);

  return {
    findOfferStatus: (offerId: number): OfferStatus | undefined =>
      findOfferStatus.get(offerId)?.status,

    create: (offerId: number, studentId: number, message: string | null): ApplicationDbo | undefined =>
      insertApplication.get({ offerId, studentId, message }),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
