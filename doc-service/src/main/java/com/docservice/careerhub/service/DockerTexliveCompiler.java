package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.docservice.careerhub.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;


@Service
public class DockerTexliveCompiler implements LatexCompiler {

    private static final Logger LOGGER = LoggerFactory.getLogger(DockerTexliveCompiler.class);
    private static final String TEX_FILE = "main.tex";
    private static final String PDF_FILE = "main.pdf";
    private static final int LOG_TAIL_CHARS = 1500;

    @Autowired
    private AppProperties appProperties;

    @Override
    public byte[] compile(String latexCode) {
        Path workDir = createWorkDir();
        try {
            Files.writeString(workDir.resolve(TEX_FILE), latexCode, StandardCharsets.UTF_8);
            String output = runPdflatex(workDir);
            Path pdf = workDir.resolve(PDF_FILE);
            if (!Files.exists(pdf)) {
                throw ApiException.badData("LaTeX compilation produced no PDF.\n" + tail(output));
            }
            return Files.readAllBytes(pdf);
        } catch (IOException exception) {
            throw ApiException.badData("LaTeX compilation failed: " + exception.getMessage());
        } finally {
            deleteQuietly(workDir);
        }
    }

    private String runPdflatex(Path workDir) {
        List<String> command = List.of(
                "docker", "run", "--rm",
                "-v", workDir.toAbsolutePath() + ":/work",
                "-w", "/work",
                appProperties.getLatexDockerImage(),
                "pdflatex", "-interaction=nonstopmode", "-halt-on-error", TEX_FILE);
        try {
            ProcessBuilder builder = new ProcessBuilder(command).redirectErrorStream(true);
            Process process = builder.start();
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            boolean finished = process.waitFor(appProperties.getLatexCompileTimeoutSeconds(), TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw ApiException.badData("LaTeX compilation timed out after "
                        + appProperties.getLatexCompileTimeoutSeconds() + "s");
            }
            if (process.exitValue() != 0) {
                throw ApiException.badData("LaTeX compilation error.\n" + tail(output));
            }
            return output;
        } catch (IOException exception) {
            throw ApiException.badData("Could not start the LaTeX compiler (is Docker running?): "
                    + exception.getMessage());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw ApiException.badData("LaTeX compilation was interrupted");
        }
    }

    private Path createWorkDir() {
        try {
            return Files.createTempDirectory("latex-");
        } catch (IOException exception) {
            throw ApiException.badData("Could not create a workspace for compilation: " + exception.getMessage());
        }
    }

    private void deleteQuietly(Path dir) {
        try (var paths = Files.walk(dir)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                    LOGGER.debug("Could not delete temp file {}", path);
                }
            });
        } catch (IOException ignored) {
            LOGGER.debug("Could not clean temp dir {}", dir);
        }
    }

    private String tail(String output) {
        if (output == null || output.length() <= LOG_TAIL_CHARS) {
            return output == null ? "" : output;
        }
        return output.substring(output.length() - LOG_TAIL_CHARS);
    }
}
