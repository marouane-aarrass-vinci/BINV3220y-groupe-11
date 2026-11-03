import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationListItemDbo } from "../models/application.ts";
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
  const findByStudentId = db.prepare<[number], ApplicationListItemDbo>(`
    SELECT a.id, a.offer_id, a.student_id, a.message, a.status, a.applied_at,
           o.title AS offer_title, c.short_name AS company_short_name,
           ay.label AS academic_year_label, p.code AS period_code
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE a.student_id = ?
    ORDER BY a.applied_at DESC, a.id DESC
  `);

  return {
    findOfferStatus: (offerId: number): OfferStatus | undefined =>
      findOfferStatus.get(offerId)?.status,

    create: (offerId: number, studentId: number, message: string | null): ApplicationDbo | undefined =>
      insertApplication.get({ offerId, studentId, message }),

    findByStudentId: (studentId: number): ApplicationListItemDbo[] =>
      findByStudentId.all(studentId),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
