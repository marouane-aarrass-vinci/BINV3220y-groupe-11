import { expect, test, type Page } from "@playwright/test";

const signInAsLucasAndOpenOffers = async (page: Page) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Lucas Dupont/ }).click();
  await expect(page.getByRole("link", { name: "Offres" })).toBeVisible();
  await page.getByRole("link", { name: "Offres" }).click();
  await expect(page.getByRole("heading", { name: "Offres de stage" })).toBeVisible();
};

test("Scénario 1 — recherche avec résultat", async ({ page }) => {
  await signInAsLucasAndOpenOffers(page);

  await page.getByRole("searchbox", { name: "Recherche par titre" }).fill("tableau");

  await expect(
    page.getByRole("cell", { name: "Tableau de bord de qualité des données", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1 offre", { exact: true })).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(
    page.getByRole("cell", { name: "Application React de gestion de flotte", exact: true }),
  ).toHaveCount(0);
});

test("Scénario 2 — recherche sans résultat", async ({ page }) => {
  await signInAsLucasAndOpenOffers(page);

  await page.getByRole("searchbox", { name: "Recherche par titre" }).fill("introuvable");

  await expect(page.getByText("Aucune offre ne correspond à votre recherche.", { exact: true })).toBeVisible();
  await expect(page.locator("table")).toHaveCount(0);
});
