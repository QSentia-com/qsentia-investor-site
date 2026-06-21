import { NextResponse, type NextRequest } from 'next/server';
import { unauthorizedAdminResponse } from '@/lib/adminAuth';
import {
  mergeAdminModelSetting,
  readAdminModelSettings,
  sanitizeAdminModelSetting,
  writeAdminModelSettings,
} from '@/lib/adminModelSettings';
import { getLiveMarketplaceModels } from '@/lib/modelCatalog';

export async function GET(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;

  try {
    const [models, settingsFile] = await Promise.all([
      getLiveMarketplaceModels(request, { includeHidden: true, preferCachedDashboard: true }),
      readAdminModelSettings(),
    ]);

    return NextResponse.json(
      {
        updatedAt: settingsFile.updatedAt,
        models: models.map((model) => {
          const setting = settingsFile.models[model.id];
          return {
            id: model.id,
            slug: model.slug,
            name: model.name,
            category: model.category,
            repo: model.repo,
            logsPath: model.logsPath,
            performance: model.performance,
            settings: mergeAdminModelSetting(setting),
            configured: Boolean(setting?.updatedAt),
          };
        }),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error loading admin model settings:', error);
    return NextResponse.json(
      { error: 'Failed to load model settings' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await unauthorizedAdminResponse(request);
  if (authError) return authError;

  try {
    const body = (await request.json()) as { modelId?: unknown; settings?: unknown };
    const modelId = typeof body.modelId === 'string' ? body.modelId.trim() : '';

    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const models = await getLiveMarketplaceModels(request, { includeHidden: true, preferCachedDashboard: true });
    const modelExists = models.some((model) => model.id === modelId);

    if (!modelExists) {
      return NextResponse.json(
        { error: 'Model is not present in the live registry' },
        { status: 404, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const now = new Date().toISOString();
    const settingsFile = await readAdminModelSettings();
    const sanitized = sanitizeAdminModelSetting(body.settings);
    const nextSetting = {
      ...sanitized,
      updatedAt: now,
    };

    const nextFile = await writeAdminModelSettings({
      version: 1,
      updatedAt: now,
      models: {
        ...settingsFile.models,
        [modelId]: nextSetting,
      },
    });

    return NextResponse.json(
      {
        modelId,
        settings: mergeAdminModelSetting(nextFile.models[modelId]),
        updatedAt: nextFile.updatedAt,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error saving admin model settings:', error);
    return NextResponse.json(
      { error: 'Failed to save model settings' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
