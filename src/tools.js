import { z } from "zod";
import { TOOLS } from "./protocol.js";
import { toolError, toolOk } from "./bridge.js";

const empty = z.object({});
const idField = z.object({ id: z.string().min(1) });
const offsetField = z.object({
  id: z.string().min(1),
  offset: z.number().int(),
});

const schemas = {
  get_course: empty,
  get_open_item: empty,
  update_course: z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    durationHours: z.number().optional(),
    prerequisitesText: z.string().optional(),
    requiredScoreToPass: z.number().nullable().optional(),
    certificateEnabled: z.boolean().optional(),
  }),
  publish_course: empty,
  archive_course: empty,
  add_chapter: z.object({ title: z.string().optional() }),
  rename_chapter: z.object({ id: z.string().min(1), title: z.string().min(1) }),
  move_chapter: offsetField,
  publish_chapter: idField,
  archive_chapter: idField,
  remove_chapter: idField,
  add_item: z.object({
    chapterId: z.string().min(1),
    itemType: z.enum(["lesson", "exercise", "quiz", "homework"]),
  }),
  open_item: idField,
  remove_item: idField,
  move_item: z.object({
    chapterId: z.string().min(1),
    id: z.string().min(1),
    offset: z.number().int(),
  }),
  set_title: z.object({ title: z.string().min(1) }),
  set_item_meta: z.object({
    id: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
    durationMinutes: z.number().int().nullable().optional(),
    unlockType: z.enum(["immediate", "sequential", "scheduled"]).optional(),
  }),
  publish_item: z.object({ id: z.string().optional() }),
  archive_item: z.object({ id: z.string().optional() }),
  replace_lesson_html: z.object({ html: z.string() }),
  replace_quiz: z.object({
    description: z.string().optional(),
    passingScore: z.number().optional(),
    timeLimitMinutes: z.number().nullable().optional(),
    maxRetakes: z.number().nullable().optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    questions: z.array(
      z.object({
        prompt: z.string(),
        explanation: z.string().optional(),
        choices: z.array(
          z.object({
            text: z.string(),
            isCorrect: z.boolean(),
          }),
        ),
      }),
    ),
  }),
  replace_exercise: z.object({
    type: z.enum([
      "multiple_choice",
      "fill_blank",
      "ordering",
      "match",
      "predict_output",
    ]),
    description: z.string().optional(),
    data: z.unknown(),
  }),
  replace_homework: z.object({
    description: z.string().optional(),
    submissionType: z.enum(["file_upload", "code", "text"]).optional(),
    requiredScoreToPass: z.number().nullable().optional(),
    allowedFileTypes: z.array(z.string()).optional(),
    maxFileSizeMB: z.number().nullable().optional(),
    codeLanguages: z
      .array(z.object({ language: z.string(), starterCode: z.string().optional() }))
      .optional(),
    isAutoGraded: z.boolean().optional(),
  }),
};

export function registerTools(server, bridge) {
  for (const tool of TOOLS) {
    const schema = schemas[tool.name] ?? empty;
    server.tool(tool.name, tool.description, schema.shape, async (params) => {
      try {
        const result = await bridge.call(tool.name, params);
        return toolOk(result);
      } catch (error) {
        return toolError(error);
      }
    });
  }
}
