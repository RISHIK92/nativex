export interface FileAction {
  type: "file";
  filePath: string;
  content: string;
}

export interface ShellAction {
  type: "shell";
  command: string;
}

export type BoltAction = FileAction | ShellAction;

export interface ParsedArtifact {
  id: string;
  title: string;
  actions: BoltAction[];
}

export function parseArtifact(content: string): ParsedArtifact | null {
  // 1. Find the start and end of the artifact tag
  // This ignores any surrounding markdown text or code fences (```xml)
  const startIndex = content.indexOf("<boltArtifact");
  const endIndex = content.lastIndexOf("</boltArtifact>");

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }

  // Extract just the XML part
  const xmlContent = content.slice(
    startIndex,
    endIndex + "</boltArtifact>".length
  );

  // 2. Parse the Artifact Header (id and title)
  // We match attributes individually to allow any order, supporting both single and double quotes
  const idMatch = xmlContent.match(/id=["']([^"']*)["']/);
  const titleMatch = xmlContent.match(/title=["']([^"']*)["']/);

  if (!idMatch) {
    return null;
  }

  const title = titleMatch ? titleMatch[1] : "Artifact";

  const actions: BoltAction[] = [];

  // 3. Parse Actions using a 2-step regex to be robust against attribute order
  // Step A: Capture the opening tag attributes and the inner content
  const actionRegex = /<boltAction\s+([^>]*?)>([\s\S]*?)<\/boltAction>/g;

  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [_, attributesStr, innerContent] = match;

    // Step B: Extract specific attributes from the attributes string
    const typeMatch = attributesStr.match(/type="([^"]*)"/);
    const filePathMatch = attributesStr.match(/filePath="([^"]*)"/);

    const type = typeMatch ? typeMatch[1] : null;
    const filePath = filePathMatch ? filePathMatch[1] : undefined;
    const content = innerContent.trim(); // Trim whitespace from code content

    if (type === "file" && filePath) {
      actions.push({
        type: "file",
        filePath,
        content,
      });
    } else if (type === "shell") {
      actions.push({
        type: "shell",
        command: content,
      });
    }
  }

  return {
    id: idMatch[1],
    title,
    actions,
  };
}

export function containsArtifact(content: string): boolean {
  return content.includes("<boltArtifact");
}
