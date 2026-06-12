package com.docservice.careerhub.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.state.PDExtendedGraphicsState;
import org.apache.pdfbox.util.Matrix;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;


@Service
public class WatermarkService {

    private static final Logger logger = LoggerFactory.getLogger(WatermarkService.class);
    private static final String WATERMARK_TEXT = "NextCV Preview";
    private static final float VISIBLE_FRACTION = 1f / 3f;

    public byte[] buildPreview(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            keepFirstPageOnly(document);
            PDPage page = document.getPage(0);
            PDRectangle visible = cropToTopThird(page);
            stampWatermark(document, page, visible);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to build preview PDF: {}", e.getMessage(), e);
            return pdfBytes;
        }
    }

    private void keepFirstPageOnly(PDDocument document) {
        while (document.getNumberOfPages() > 1) {
            document.removePage(document.getNumberOfPages() - 1);
        }
    }

    private PDRectangle cropToTopThird(PDPage page) {
        PDRectangle box = page.getMediaBox();
        float visibleHeight = box.getHeight() * VISIBLE_FRACTION;
        float lowerY = box.getUpperRightY() - visibleHeight;
        PDRectangle visible = new PDRectangle(box.getLowerLeftX(), lowerY, box.getWidth(), visibleHeight);
        page.setCropBox(visible);
        return visible;
    }

    private void stampWatermark(PDDocument document, PDPage page, PDRectangle visible) throws java.io.IOException {
        PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        float fontSize = Math.min(visible.getWidth(), visible.getHeight()) / 7f;
        float textWidth = font.getStringWidth(WATERMARK_TEXT) / 1000f * fontSize;
        float centerX = visible.getLowerLeftX() + visible.getWidth() / 2f;
        float centerY = visible.getLowerLeftY() + visible.getHeight() / 2f;

        try (PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true, true)) {
            PDExtendedGraphicsState graphicsState = new PDExtendedGraphicsState();
            graphicsState.setNonStrokingAlphaConstant(0.12f);
            content.setGraphicsStateParameters(graphicsState);
            content.setNonStrokingColor(0.35f, 0.35f, 0.35f);

            Matrix matrix = Matrix.getRotateInstance(Math.toRadians(20), centerX, centerY);
            matrix.translate(-textWidth / 2f, -fontSize / 2f);

            content.beginText();
            content.setFont(font, fontSize);
            content.setTextMatrix(matrix);
            content.showText(WATERMARK_TEXT);
            content.endText();
        }
    }
}
