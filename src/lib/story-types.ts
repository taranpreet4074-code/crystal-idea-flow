export type StoryScene = {
  index: number;
  title: string;
  narration: string;
  visual_description: string;
  image_prompt: string;
  video_prompt: string;
};

export type StoryResult = {
  title: string;
  hook: string;
  logline: string;
  script: string;
  scenes: StoryScene[];
  youtube_titles: string[];
  youtube_description: string;
  tags: string[];
  thumbnail_concepts: string[];
};

export function storyToPlainText(story: StoryResult): string {
  const lines: string[] = [];
  lines.push(story.title, "", `Hook: ${story.hook}`, "", `Logline: ${story.logline}`, "", "SCRIPT", story.script, "", "SCENES");
  story.scenes.forEach((scene) => {
    lines.push(
      "",
      `Scene ${scene.index}: ${scene.title}`,
      `Narration: ${scene.narration}`,
      `Visual: ${scene.visual_description}`,
      `Image prompt: ${scene.image_prompt}`,
      `Video prompt: ${scene.video_prompt}`,
    );
  });
  lines.push("", "TITLE OPTIONS", ...story.youtube_titles.map((t) => `- ${t}`));
  lines.push("", "DESCRIPTION", story.youtube_description);
  lines.push("", "TAGS", story.tags.join(", "));
  lines.push("", "THUMBNAIL CONCEPTS", ...story.thumbnail_concepts.map((t) => `- ${t}`));
  return lines.join("\n");
}
