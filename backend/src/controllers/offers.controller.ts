import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { toOfferDto } from "../mappers/offer.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import type { OffersService } from "../services/offers.service.ts";
import { canApplyToOffer, canListOffers } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPeriodCode = (value: string): value is PeriodCode =>
  PERIOD_CODES.some((period) => period === value);

const parseOfferId = (value: unknown): number => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "INVALID_PARAM", "offerId doit être un entier positif");
  }
  const offerId = Number(value);
  if (!Number.isSafeInteger(offerId)) {
    throw new HttpError(400, "INVALID_PARAM", "offerId doit être un entier positif");
  }
  return offerId;
};

const parseApplicationMessage = (body: unknown): string | null => {
  if (body === undefined) return null;
  if (!isRecord(body) || Object.keys(body).some((key) => key !== "message")) {
    throw new HttpError(
      400,
      "INVALID_BODY",
      "Le corps doit contenir uniquement un message facultatif",
    );
  }
  if (body.message === undefined || body.message === null) return null;
  if (typeof body.message !== "string") {
    throw new HttpError(400, "INVALID_BODY", "Le message doit être une chaîne de caractères");
  }
  const message = body.message.trim();
  return message === "" ? null : message;
};

const parsePeriod = (value: unknown): PeriodCode | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !isPeriodCode(value)) {
    throw new HttpError(400, "INVALID_QUERY", "Le paramètre period doit être P1, P2 ou OTHER");
  }
  return value;
};

export const createOffersRouter = (
  offersService: OffersService,
  applicationsService: ApplicationsService,
) => {
  const router = Router();

  router.get("/", authorize(canListOffers), (req, res) => {
    const period = parsePeriod(req.query.period);
    res.json(offersService.listOffers(getCurrentUser(req), period).map(toOfferDto));
  });

  router.post("/:offerId/applications", authorize(canApplyToOffer), (req, res) => {
    const offerId = parseOfferId(req.params.offerId);
    const message = parseApplicationMessage(req.body);
    const application = applicationsService.applyToOffer(getCurrentUser(req), offerId, message);
    res.status(201).json(toApplicationDto(application));
  });

  return router;
};
