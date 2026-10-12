"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const CANVAS_SCALE = 2; // 2x for retina-quality output

async function renderCanvas(node: HTMLElement, background: string) {
  return html2canvas(node, {
    scale: CANVAS_SCALE,
    backgroundColor: background,
    useCORS: true,
    logging: false,
  });
}

/** Trigger a browser download for a canvas. */
function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type: string, quality = 0.92) {
  const url = canvas.toDataURL(type, quality);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

/**
 * Export the preview node to a multi-page A4 PDF.
 * The full-height canvas is sliced into page-sized strips so long
 * documents paginate cleanly instead of being squashed onto one page.
 */
export async function exportPdf(node: HTMLElement, filename: string, background: string) {
  const canvas = await renderCanvas(node, background);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // Canvas height corresponding to one A4 content page.
  const pxPermm = canvas.width / contentWidth;
  const pageCanvasHeight = Math.floor(contentHeight * pxPermm);

  let rendered = 0;
  let pageIndex = 0;
  while (rendered < canvas.height) {
    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - rendered);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeight;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, rendered, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    const img = slice.toDataURL("image/jpeg", 0.95);
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", margin, margin, contentWidth, (sliceHeight / pxPermm));
    rendered += sliceHeight;
    pageIndex += 1;
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

/** Export the preview node as a PNG or JPEG image. */
export async function exportImage(
  node: HTMLElement,
  filename: string,
  background: string,
  format: "png" | "jpeg" = "png"
) {
  const canvas = await renderCanvas(node, background);
  downloadCanvas(
    canvas,
    `${filename}.${format === "png" ? "png" : "jpg"}`,
    `image/${format}`,
    format === "png" ? undefined : 0.92
  );
}

/** Copy plain text to the clipboard (used for the Copy-HTML button). */
export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}
