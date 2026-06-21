import { readBackOfficeStore } from "@/lib/adminBackOffice";
import {
  mergeAdminModelSetting,
  readAdminModelSettings,
} from "@/lib/adminModelSettings";
import { getLiveMarketplaceModels } from "@/lib/modelCatalog";

function numberOrZero(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

export async function buildAdminOverview(request: Request) {
  const [models, settingsFile, backOffice] = await Promise.all([
    getLiveMarketplaceModels(request, {
      includeHidden: true,
      preferCachedDashboard: true,
    }),
    readAdminModelSettings(),
    readBackOfficeStore(),
  ]);

  const enrichedModels = models.map((model) => {
    const settings = mergeAdminModelSetting(settingsFile.models[model.id]);
    const activity = backOffice.modelActivity[model.id] || null;
    const soldUnits = numberOrZero(settings.soldUnits);
    const views = numberOrZero(activity?.views);

    return {
      id: model.id,
      slug: model.slug,
      name: model.name,
      category: model.category,
      repo: model.repo,
      logsPath: model.logsPath,
      performance: model.performance,
      settings,
      configured: Boolean(settingsFile.models[model.id]?.updatedAt),
      activity,
      sales: {
        soldUnits,
        trialCount: numberOrZero(settings.trialCount),
        views,
        viewedNotPurchased: Math.max(views - soldUnits, 0),
      },
    };
  });

  const bestPerforming = [...enrichedModels].sort((a, b) => {
    const aSharpe = Number(
      a.performance.sharpeRatio ?? Number.NEGATIVE_INFINITY,
    );
    const bSharpe = Number(
      b.performance.sharpeRatio ?? Number.NEGATIVE_INFINITY,
    );
    if (bSharpe !== aSharpe) return bSharpe - aSharpe;
    return (
      Number(b.performance.annualizedReturn ?? 0) -
      Number(a.performance.annualizedReturn ?? 0)
    );
  });

  const metrics = {
    models: enrichedModels.length,
    configuredModels: enrichedModels.filter((model) => model.configured).length,
    activePublicModels: enrichedModels.filter(
      (model) =>
        model.settings.accessStatus === "active" &&
        model.settings.visibility === "public",
    ).length,
    soldModels: enrichedModels.reduce(
      (sum, model) => sum + model.sales.soldUnits,
      0,
    ),
    activeTrials: enrichedModels.reduce(
      (sum, model) => sum + model.sales.trialCount,
      0,
    ),
    modelViews: enrichedModels.reduce(
      (sum, model) => sum + model.sales.views,
      0,
    ),
    viewedNotPurchased: enrichedModels.reduce(
      (sum, model) => sum + model.sales.viewedNotPurchased,
      0,
    ),
    leads: backOffice.leads.length,
    qualifiedLeads: backOffice.leads.filter((lead) =>
      ["qualified", "demo", "proposal"].includes(lead.stage),
    ).length,
    wonLeads: backOffice.leads.filter((lead) => lead.stage === "won").length,
    openTickets: backOffice.tickets.filter(
      (ticket) => ticket.status !== "resolved",
    ).length,
    openRoles: backOffice.careerRoles.filter((role) => role.status === "open")
      .length,
    candidates: backOffice.applications.length,
    activeOffers: backOffice.offers.filter((offer) => offer.status === "active")
      .length,
    offerRedemptions: backOffice.offers.reduce(
      (sum, offer) => sum + offer.redemptions,
      0,
    ),
  };

  return {
    updatedAt: backOffice.updatedAt || settingsFile.updatedAt,
    metrics,
    models: enrichedModels,
    bestPerforming,
    leads: backOffice.leads,
    tickets: backOffice.tickets,
    careerRoles: backOffice.careerRoles,
    applications: backOffice.applications,
    offers: backOffice.offers,
  };
}
