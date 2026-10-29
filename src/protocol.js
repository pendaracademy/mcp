export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 7420;
export const TOKEN_BYTES = 16;
export const CALL_TIMEOUT_MS = 20_000;

export const TOOLS = [
  {
    name: "get_course",
    description: "Read the open course title, settings, and chapter outline.",
  },
  {
    name: "get_open_item",
    description: "Read the chapter item currently open in the builder tab.",
  },
  {
    name: "update_course",
    description:
      "Patch course settings: title, slug, description, level, durationHours, prerequisitesText, requiredScoreToPass, certificateEnabled.",
  },
  { name: "publish_course", description: "Publish the open course." },
  { name: "archive_course", description: "Archive the open course." },
  { name: "add_chapter", description: "Add a chapter. Optional title." },
  { name: "rename_chapter", description: "Rename a chapter by id." },
  { name: "move_chapter", description: "Move a chapter by offset (-1 or 1)." },
  { name: "publish_chapter", description: "Publish a chapter by id." },
  { name: "archive_chapter", description: "Archive a chapter by id." },
  { name: "remove_chapter", description: "Delete a chapter by id." },
  {
    name: "add_item",
    description: "Add a lesson, exercise, quiz, or homework to a chapter.",
  },
  { name: "open_item", description: "Open a chapter item in the builder." },
  { name: "remove_item", description: "Delete a chapter item by id." },
  { name: "move_item", description: "Move an item inside its chapter by offset." },
  { name: "set_title", description: "Set the title of the open item." },
  { name: "set_item_meta", description: "Set difficulty, durationMinutes, or unlockType." },
  { name: "publish_item", description: "Publish the open item or an item id." },
  { name: "archive_item", description: "Archive the open item or an item id." },
  {
    name: "replace_lesson_html",
    description: "Replace the open lesson body. HTML or plain text.",
  },
  {
    name: "replace_quiz",
    description: "Replace the open quiz questions and meta.",
  },
  {
    name: "replace_exercise",
    description: "Replace the open exercise type, data, and description.",
  },
  {
    name: "replace_homework",
    description: "Replace the open homework fields. No sample file upload.",
  },
];
