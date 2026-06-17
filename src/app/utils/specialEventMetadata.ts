export interface SpecialEventMetadata {
  whatWhom?: string;
  date?: string;
}

export const serializeDescription = (description: string, metadata: SpecialEventMetadata): string => {
  const parts: string[] = [];
  if (metadata.whatWhom) parts.push(`What/Whom: ${metadata.whatWhom}`);
  if (metadata.date) parts.push(`Date: ${metadata.date}`);
  
  const metadataPrefix = parts.length > 0 ? parts.join(" | ") : "";
  
  if (!metadataPrefix) return description;
  return description ? `${metadataPrefix}\n${description}` : metadataPrefix;
};

export const deserializeDescription = (fullDescription: string | undefined): { description: string; metadata: SpecialEventMetadata } => {
  if (!fullDescription) return { description: "", metadata: {} };
  
  const metadata: SpecialEventMetadata = {};
  let cleanDescription = fullDescription;

  // Split by newline to check first line for metadata
  const lines = fullDescription.split("\n");
  const firstLine = lines[0];

  if (firstLine.includes("What/Whom:") || firstLine.includes("Date:")) {
    const parts = firstLine.split(" | ");
    parts.forEach(part => {
      if (part.startsWith("What/Whom: ")) {
        metadata.whatWhom = part.replace("What/Whom: ", "").trim();
      } else if (part.startsWith("Date: ")) {
        metadata.date = part.replace("Date: ", "").trim();
      }
    });
    cleanDescription = lines.slice(1).join("\n");
  }

  return { description: cleanDescription, metadata };
};
