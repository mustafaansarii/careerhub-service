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

/**
 * Stamps a diagonal "NextCV Preview" watermark over every page of a compiled PDF. Used to gate the
 * free (un-unlocked) preview so the unmodified document is never exposed without payment.
 */
@Service
public class WatermarkService {

    private static final Logger logger = LoggerFactory.getLogger(WatermarkService.class);
    private static final String WATERMARK_TEXT = "NextCV Preview";

    public byte[] addPreviewWatermark(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

            for (PDPage page : document.getPages()) {
                PDRectangle box = page.getMediaBox();
                float fontSize = Math.min(box.getWidth(), box.getHeight()) / 9f;
                float textWidth = font.getStringWidth(WATERMARK_TEXT) / 1000f * fontSize;

                try (PDPageContentStream content = new PDPageContentStream(document, page, AppendMode.APPEND, true, true)) {
                    PDExtendedGraphicsState graphicsState = new PDExtendedGraphicsState();
                    graphicsState.setNonStrokingAlphaConstant(0.12f);
                    content.setGraphicsStateParameters(graphicsState);
                    content.setNonStrokingColor(0.35f, 0.35f, 0.35f);

                    Matrix matrix = Matrix.getRotateInstance(Math.toRadians(45), box.getWidth() / 2f, box.getHeight() / 2f);
                    matrix.translate(-textWidth / 2f, -fontSize / 2f);

                    content.beginText();
                    content.setFont(font, fontSize);
                    content.setTextMatrix(matrix);
                    content.showText(WATERMARK_TEXT);
                    content.endText();
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            document.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to watermark preview PDF: {}", e.getMessage(), e);
            return pdfBytes;
        }
    }
}
