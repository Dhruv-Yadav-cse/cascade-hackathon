import { Router, type IRouter } from "express";
import {
  CreateAnalysisBody,
  CreateAnalysisResponse,
  GetAnalysisParams,
  GetAnalysisResponse,
  ListAnalysesResponse,
  UpdateAnalysisBody,
  UpdateAnalysisParams,
  UpdateAnalysisResponse,
} from "@workspace/api-zod";
import {
  createAnalysis,
  getAnalysis,
  listAnalyses,
  updateAnalysis,
} from "../repositories/analyses";

const router: IRouter = Router();

function responseModel(analysis: Awaited<ReturnType<typeof getAnalysis>>) {
  if (!analysis) {
    return undefined;
  }

  return {
    ...analysis,
    riskScore: null,
  };
}

function hasMeaningfulText(value: string): boolean {
  return value.trim().length > 0;
}

router.get("/analyses", async (req, res): Promise<void> => {
  const analyses = await listAnalyses();
  res.json(
    ListAnalysesResponse.parse(
      analyses.map((analysis) => responseModel(analysis)),
    ),
  );
});

router.post("/analyses", async (req, res): Promise<void> => {
  const parsed = CreateAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid analysis input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (
    !hasMeaningfulText(parsed.data.title) ||
    !hasMeaningfulText(parsed.data.decision)
  ) {
    res.status(400).json({ error: "Title and decision are required" });
    return;
  }

  const analysis = await createAnalysis({
    title: parsed.data.title.trim(),
    decision: parsed.data.decision.trim(),
    objective: parsed.data.objective?.trim() || undefined,
    horizon: parsed.data.horizon?.trim() || undefined,
  });

  res.status(201).json(CreateAnalysisResponse.parse(responseModel(analysis)));
});

router.get("/analyses/:analysisId", async (req, res): Promise<void> => {
  const parsedParams = GetAnalysisParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const analysis = await getAnalysis(parsedParams.data.analysisId);
  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json(GetAnalysisResponse.parse(responseModel(analysis)));
});

router.patch("/analyses/:analysisId", async (req, res): Promise<void> => {
  const parsedParams = UpdateAnalysisParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const parsedBody = UpdateAnalysisBody.safeParse(req.body);
  if (!parsedBody.success) {
    req.log.warn(
      { errors: parsedBody.error.flatten() },
      "Invalid analysis update",
    );
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  if (Object.keys(parsedBody.data).length === 0) {
    res.status(400).json({ error: "At least one field is required" });
    return;
  }

  if (
    (parsedBody.data.title !== undefined &&
      !hasMeaningfulText(parsedBody.data.title)) ||
    (parsedBody.data.decision !== undefined &&
      !hasMeaningfulText(parsedBody.data.decision))
  ) {
    res.status(400).json({ error: "Title and decision cannot be blank" });
    return;
  }

  const analysis = await updateAnalysis(parsedParams.data.analysisId, {
    ...parsedBody.data,
    title: parsedBody.data.title?.trim(),
    decision: parsedBody.data.decision?.trim(),
    objective: parsedBody.data.objective?.trim(),
    horizon: parsedBody.data.horizon?.trim(),
  });

  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json(UpdateAnalysisResponse.parse(responseModel(analysis)));
});

export default router;