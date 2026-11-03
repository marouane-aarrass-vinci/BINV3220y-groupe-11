import { toApplication, toApplicationListItem } from "../mappers/application.mapper.ts";
import type { Application, ApplicationListItem } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listMyApplications: (viewer: User): ApplicationListItem[] => {
    if (!isStudent(viewer)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut consulter ses candidatures");
    }
    return repository.findByStudentId(viewer.id).map(toApplicationListItem);
  },

  applyToOffer: (student: User, offerId: number, message: string | null): Application => {
    if (!isStudent(student)) {
      throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut postuler à une offre");
    }

    const offerStatus = repository.findOfferStatus(offerId);
    if (offerStatus === undefined) {
      throw new HttpError(404, "OFFER_NOT_FOUND", "Cette offre n'existe pas");
    }
    if (offerStatus !== "PUBLISHED") {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "Cette offre n'est pas publiée");
    }

    const application = repository.create(offerId, student.id, message);
    if (application === undefined) {
      throw new HttpError(
        409,
        "APPLICATION_ALREADY_EXISTS",
        "Vous avez déjà postulé à cette offre",
      );
    }
    return toApplication(application);
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
