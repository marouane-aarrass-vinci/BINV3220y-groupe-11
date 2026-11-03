import { Router } from "express";
import { toApplicationListItemDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { canListOwnApplications } from "../services/permissions.ts";

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.get("/", authorize(canListOwnApplications), (req, res) => {
    const applications = applicationsService.listMyApplications(getCurrentUser(req));
    res.json(applications.map(toApplicationListItemDto));
  });

  return router;
};
