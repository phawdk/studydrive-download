import { Color, PDFDocument, PDFFont, PDFImage, PDFPage, rgb, StandardFonts } from "pdf-lib";
import { Markings, Post, Document as sdDocument } from "./sdtypes";

// import chatIcon from "./assets/chat.png";
import replyIcon from "./assets/reply.png";
import messageIcon from "./assets/message.png";

const EXTRA_WIDTH = 300;
const LINE_HEIGHT = 14;
const FONT_SIZE = 10;
const SMAL_FONT_SIZE = 8;
const SMAL_INDENT = 5;
const ICON_SIZE = 13;
const MAX_LINE_WIDTH = EXTRA_WIDTH - SMAL_INDENT * 2;

export const modifyPDFWithComments = async (
  pdfBytes: ArrayBuffer,
  postsMap: Map<number, Array<Post>>,
  document: sdDocument
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const replyImage = await pdfDoc.embedPng(replyIcon);
  const messageImage = await pdfDoc.embedPng(messageIcon);

  // Embed fonts
  // const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  addTitlePage(pdfDoc, document, regularFont);

  for (let pageNum = 0; pageNum < pdfDoc.getPageCount(); pageNum++) {
    const page = pdfDoc.getPage(pageNum);

    const posts = postsMap.get(pageNum /* + 1*/) || []; // We dont need the +1 as we added the TitlePage, it will get all comments with no Page, aka "0" as the index.

    if (posts.length === 0) continue;

    let { width, height } = page.getSize();
    let [oWidth, oHeight] = [width, height];

    let xPosition = width + SMAL_INDENT;
    width += EXTRA_WIDTH;
    page.setSize(width, height);

    let yPosition = height - 50;

    const drawComment = (
      page: PDFPage,
      author: string,
      content: string,
      indent: number,
      postId: number | undefined,
      icon: PDFImage,
      icon_size: number = ICON_SIZE
    ) => {
      let LineIndent = 0;
      page.drawImage(icon, {
        x: xPosition + indent,
        y: yPosition - icon_size * 0.3,
        width: icon_size,
        height: icon_size,
      });
      if (postId !== undefined) {
        let text = sanitizeTextAndUnescape(`${postId}`, regularFont);
        let offset = (icon_size - regularFont.widthOfTextAtSize(text, FONT_SIZE)) / 2;
        page.drawText(text, {
          x: xPosition + indent + LineIndent + offset,
          y: yPosition,
          size: FONT_SIZE,
          color: rgb(0, 0, 0),
          font: regularFont,
        });
      }
      LineIndent += icon_size + 2;

      const authorText = sanitizeTextAndUnescape(`${author.trim()}:`, regularFont);
      page.drawText(authorText, {
        x: xPosition + indent + LineIndent,
        y: yPosition,
        size: SMAL_FONT_SIZE,
        color: rgb(117 / 255, 117 / 255, 117 / 255),
        font: regularFont,
      });
      LineIndent += 3 + regularFont.widthOfTextAtSize(authorText, SMAL_FONT_SIZE);

      // Wrap content text
      const wrappedLines = wrapText(
        sanitizeTextAndUnescape(content, regularFont),
        MAX_LINE_WIDTH - SMAL_INDENT * 2 - indent,
        regularFont,
        FONT_SIZE,
        LineIndent + indent
      );

      for (const wrappedLine of wrappedLines) {
        page.drawText(wrappedLine, {
          x: xPosition + LineIndent + indent,
          y: yPosition,
          size: FONT_SIZE,
          color: rgb(0, 0, 0),
          font: regularFont,
        });
        LineIndent = SMAL_INDENT;
        yPosition -= LINE_HEIGHT;

        // Adjust page width if running out of space
        if (yPosition < 50) {
          yPosition = height - 50;
          xPosition = width + SMAL_INDENT;
          width += EXTRA_WIDTH;
          page.setSize(width, height);
        }
      }
    };
    const drawMarking = (mk: Markings, id: number) => {
      const widthScale = oWidth / mk.page_width;
      const heightScale = oHeight / mk.page_height;

      const scaledXStart = mk.xstart * widthScale;
      const scaledYStart = mk.ystart * heightScale;
      const scaledWidth = mk.width * widthScale;
      const scaledHeight = mk.height * heightScale;

      page.drawRectangle({
        x: scaledXStart,
        y: oHeight - scaledYStart,
        width: scaledWidth,
        height: -scaledHeight,
        color: rgb(0, 170 / 255, 170 / 255),
        opacity: 0.04,
        borderColor: rgb(0, 170 / 255, 170 / 255),
        borderWidth: 2,
        borderOpacity: 0.2,
      });
      let smalSize = 6;

      let text = sanitizeTextAndUnescape(`${id}`, regularFont);
      let textWidth = regularFont.widthOfTextAtSize(text, smalSize);
      page.drawRectangle({
        x: scaledXStart + 1,
        y: oHeight - scaledYStart - smalSize - 1,
        width: textWidth,
        height: smalSize,
        color: rgb(1, 1, 1),
      });
      page.drawText(text, {
        x: scaledXStart + 1,
        y: oHeight - scaledYStart - smalSize,
        size: smalSize,
        color: rgb(0, 0, 0),
        font: regularFont,
      });
    };

    for (let index = 0; index < posts.length; index++) {
      const post = posts[index];
      const id = index + 1;
      let markings = post.postDetails.markings;
      let postId = undefined;
      if (markings) {
        drawMarking(markings, id);
        postId = id; // So page 0 has no numbers...
      }
      drawComment(
        page,
        post.postDetails.user?.name || post.postDetails.anonymousUser?.name || "Anon",
        post.postDetails.content,
        0,
        postId,
        messageImage
      );

      const comments = post.comments;
      if (comments) {
        for (const comment of comments) {
          drawComment(
            page,
            comment.user?.name || comment.anonymousUser?.name || "Anon",
            comment.content,
            SMAL_INDENT,
            undefined,
            replyImage,
            ICON_SIZE - 4
          );
        }
      }
      if (yPosition !== height - 50) {
        // Dirty fix, when post is first in new column.
        yPosition -= 10;
      }
    }
  }

  return await pdfDoc.save();
};

async function addTitlePage(pdfDoc: PDFDocument, document: sdDocument, font: PDFFont) {
  const titlePage = pdfDoc.addPage();
  const { width, height } = titlePage.getSize();
  const fontSize = 16;
  const margin = 50;

  const titleFontSize = 24;
  const descFontSize = 14;
  const lineHeight = 20;

  const drawLine = (y: number) => {
    titlePage.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
  };
  const drawText = (label: string, value: string, y: number) => {
    titlePage.drawText(label, {
      x: margin,
      y,
      size: fontSize,
      font: font,
      color: rgb(130 / 255, 130 / 255, 130 / 255),
    });

    const maxLabelWidth = 150;
    const maxValueWidth = width - margin - (margin + maxLabelWidth);
    let fittedFontSize = fontSize;

    while (font.widthOfTextAtSize(value, fittedFontSize) > maxValueWidth && fittedFontSize > 8) {
      fittedFontSize -= 1;
    }

    titlePage.drawText(value, {
      x: margin + maxLabelWidth,
      y,
      size: fittedFontSize,
      font: font,
      color: rgb(0.1, 0.1, 0.1),
    });
  };
  function drawWrappedSection(
    page: PDFPage,
    label: string,
    content: string,
    y: number,
    options: {
      margin: number;
      width: number;
      font: PDFFont;
      labelFont: PDFFont;
      fontSize: number;
      lineHeight: number;
      labelColor?: Color;
      textColor?: Color;
    }
  ): number {
    const {
      margin,
      width,
      font,
      labelFont,
      fontSize,
      lineHeight,
      labelColor = rgb(130 / 255, 130 / 255, 130 / 255),
      textColor = rgb(0.1, 0.1, 0.1),
    } = options;

    page.drawText(label + ":", {
      x: margin,
      y,
      size: fontSize,
      font: labelFont,
      color: labelColor,
    });

    y -= 25;

    const wrappedLines = wrapText(content || "No content.", width - 2 * margin, font, fontSize, 0);

    for (const line of wrappedLines) {
      if (y < margin + lineHeight) break;
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: textColor,
      });
      y -= lineHeight;
    }

    return y - 30; // Add padding below section
  }
  let y = height - margin;

  titlePage.drawText("Document Summary", {
    x: margin,
    y,
    size: titleFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  y -= 40;
  drawLine(y);
  y -= 30;

  drawText("Author:", document.user_data?.name || "Anonymous", y);
  y -= lineHeight;
  drawText("Course Name:", document.course_name, y);
  y -= lineHeight;
  drawText("Uploaded At:", new Date(document.created_at).toLocaleDateString(), y);
  y -= lineHeight;
  drawText(
    "Downloaded At:",
    new Date().toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    y
  );
  y -= lineHeight;
  drawText("Average Rating:", `${document.avg_star_score.toFixed(1)}/5 (${document.ratings_count} ratings)`, y);
  y -= lineHeight;
  drawText("Downloads / Views:", `${document.downloads}`, y);
  y -= lineHeight;
  drawText("Pages:", `${document.number_of_pages}`, y);
  y -= lineHeight;

  if (typeof window === "undefined") {
    drawText("Document ID:", `${document.id}`, y);
  } else {
    drawText("Link:", `${window.location.origin}${window.location.pathname.replace(document.slug, "*")}`, y);
  }

  y -= lineHeight;

  drawLine(y);
  y -= 40;

  y = drawWrappedSection(titlePage, "Title", document.display_file_name, y, {
    margin,
    width,
    font: font,
    labelFont: font,
    fontSize,
    lineHeight,
  });

  y = drawWrappedSection(titlePage, "Description", document.description || "No description.", y, {
    margin,
    width,
    font: font,
    labelFont: font,
    fontSize: descFontSize,
    lineHeight,
  });

  // Add project link at the bottom
  const bottomY = margin;
  const projectLink = "https://github.com/phawdk/studydrive-download";

  titlePage.drawLine({
    start: { x: margin, y: bottomY + 20 },
    end: { x: width - margin, y: bottomY + 20 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  let text = "Downloaded and generated with: ";
  let offset = font.widthOfTextAtSize(text, 12);
  titlePage.drawText(text, {
    x: margin,
    y: bottomY,
    size: 12,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  titlePage.drawText(projectLink, {
    x: margin + offset + 5,
    y: bottomY,
    size: 12,
    font: font,
    color: rgb(0.1, 0.1, 0.8),
  });

  // Reorder the title page to the beginning
  const pages = pdfDoc.getPages();
  pdfDoc.removePage(pages.length - 1);
  pdfDoc.insertPage(0, titlePage);
}

const wrapText = (
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
  firstLineIndent: number
): string[] => {
  const lines: string[] = [];
  let line = "";
  const words = text.replace(/\n/g, " ").split(" ");

  for (const word of words) {
    let testLine = line + word + " ";
    let textWidth = font.widthOfTextAtSize(testLine, fontSize);

    // If the word itself is too long, split it character by character
    if (font.widthOfTextAtSize(word, fontSize) + firstLineIndent > maxWidth) {
      if (line.trim()) {
        lines.push(line.trim());
        line = "";
        firstLineIndent = 0;
      }
      let splitWord = "";
      for (const char of word) {
        splitWord += char;
        if (font.widthOfTextAtSize(splitWord, fontSize) + firstLineIndent > maxWidth) {
          lines.push(splitWord);
          splitWord = "";
          firstLineIndent = 0;
        }
      }
      if (splitWord) {
        line = splitWord + " ";
      }
    } else if (textWidth + firstLineIndent > maxWidth) {
      // Push current line and reset for new one
      lines.push(line.trim());
      firstLineIndent = 0;
      line = word + " ";
    } else {
      line = testLine;
    }
  }

  if (line.trim()) {
    lines.push(line.trim());
  }

  return lines;
};

const sanitizeTextAndUnescape = (text: string, font: PDFFont) => {
  return [...unescapeHTML(text)]
    .map((char) => {
      if (char === "\n") return " ";
      try {
        font.encodeText(char);
        return char;
      } catch (e) {
        return "_";
      }
    })
    .join("");
};

let UN_ESCAPE_NODE: null | HTMLDivElement = null;
const unescapeHTML = (html: string) => {
  if (typeof document === "undefined") return html; // When run in node for testing, the html escape is not of importance
  if (UN_ESCAPE_NODE === null) {
    UN_ESCAPE_NODE = document.createElement("div");
  }
  UN_ESCAPE_NODE.innerHTML = html;
  const ret = UN_ESCAPE_NODE.textContent || UN_ESCAPE_NODE.innerText || "";
  UN_ESCAPE_NODE.innerHTML = "";
  return ret;
};
