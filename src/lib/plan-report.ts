import jsPDF from "jspdf";
import logoAsset from "@/assets/arbejdsmiljoloven-logo.png.asset.json";

// The embedded fonts preserve Danish letters in reports across browsers and PDF readers.
async function fetchBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Rapportens skrifttype eller logo kunne ikke hentes.");
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

function validOfficialLink(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "retsinformation.dk" ||
      host.endsWith(".retsinformation.dk") ||
      host === "at.dk" ||
      host.endsWith(".at.dk")
    );
  } catch {
    return false;
  }
}

export async function downloadPlanReport(answers: string[]): Promise<void> {
  const [regular, bold, logo] = await Promise.all([
    fetchBase64("/fonts/DejaVuSans.ttf"),
    fetchBase64("/fonts/DejaVuSans-Bold.ttf"),
    fetchBase64(logoAsset.url),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.addFileToVFS("DejaVuSans.ttf", regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const textWidth = pageWidth - margin * 2;
  let y = 164;
  let page = 1;

  const band = (first: boolean) => {
    // A smooth green strip echoes the Handlingsplan page while the text remains on white.
    const bandHeight = first ? 132 : 60;
    const strips = 80;
    for (let i = 0; i < strips; i++) {
      const t = i / (strips - 1);
      doc.setFillColor(
        Math.round(12 + (140 - 12) * t),
        Math.round(107 + (198 - 107) * t),
        Math.round(59 + (62 - 59) * t),
      );
      doc.rect(0, (bandHeight * i) / strips, pageWidth, bandHeight / strips + 0.5, "F");
    }
    doc.addImage(
      `data:image/png;base64,${logo}`,
      "PNG",
      margin,
      first ? 21 : 8,
      first ? 80 : 44,
      first ? 80 : 44,
    );
    doc.setFont("DejaVu", "bold");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(first ? 22 : 13);
    doc.text("HANDLINGSPLAN", first ? 145 : 107, first ? 67 : 35);
    if (first) {
      doc.setFont("DejaVu", "normal");
      doc.setFontSize(11);
      doc.text("Tre løsninger inden for lovens rammer", 145, 88);
    }
    doc.setDrawColor(140, 198, 62);
    doc.setLineWidth(2);
    doc.line(margin, pageHeight - 37, pageWidth - margin, pageHeight - 37);
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 83, 76);
    doc.text("ARBEJDSMILJØLOVEN · ADWEYSE", margin, pageHeight - 22);
    doc.text(String(page), pageWidth - margin, pageHeight - 22, { align: "right" });
    doc.setTextColor(32, 49, 38);
  };

  const nextPage = () => {
    doc.addPage();
    page++;
    band(false);
    y = 85;
  };

  const write = (
    text: string,
    size = 10.5,
    weight: "normal" | "bold" = "normal",
    link?: string,
  ) => {
    doc.setFont("DejaVu", weight);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, textWidth) as string[];
    const height = size * 1.55;
    for (const line of lines) {
      if (y + height > pageHeight - 56) nextPage();
      doc.text(line, margin, y);
      if (link && validOfficialLink(link)) {
        doc.link(margin, y - size, Math.min(textWidth, doc.getTextWidth(line)), height, {
          url: link,
        });
      }
      y += height;
    }
  };

  band(true);
  doc.setFont("DejaVu", "normal");
  doc.setTextColor(75, 85, 75);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("da-DK"), margin, y);
  y += 32;
  doc.setTextColor(32, 49, 38);

  for (const [index, answer] of answers.entries()) {
    if (index > 0) {
      y += 18;
      write("OPFØLGNING", 12, "bold");
      y += 8;
    }
    for (const raw of answer.split("\n")) {
      const line = raw.trim();
      if (!line) {
        y += 7;
        continue;
      }
      const heading = /^#{1,3}\s+(.+)/.exec(line);
      if (heading) {
        y += 12;
        if (y + 42 > pageHeight - 56) nextPage();
        doc.setTextColor(12, 107, 59);
        write(heading[1], 15, "bold");
        doc.setTextColor(32, 49, 38);
        y += 4;
        continue;
      }
      const links = [...line.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)];
      const clean = line
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
        .replace(/\*\*/g, "")
        .replace(/^[-*]\s+/, "• ");
      const label = /^\*\*(.+?)\*\*/.exec(line);
      write(clean, 10.5, label ? "bold" : "normal");
      for (const [, title, url] of links) {
        if (!validOfficialLink(url)) continue;
        doc.setTextColor(12, 107, 59);
        write(`${title}: ${url}`, 8.5, "normal", url);
        doc.setTextColor(32, 49, 38);
      }
    }
  }
  doc.save("handlingsplan-loesninger.pdf");
}
