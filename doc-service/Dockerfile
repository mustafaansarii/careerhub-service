# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – Build the JAR
# ─────────────────────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – Runtime image with TeX Live installed
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy

# Install a trimmed TeX Live distribution (~600 MB). Use texlive-full (~4 GB)
# if you need exotic packages (beamer, tikzposter, moderncv etc.).
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        texlive-latex-base \
        texlive-latex-extra \
        texlive-fonts-recommended \
        texlive-fonts-extra \
        texlive-science \
        latexmk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar

# Use native pdflatex (no Docker daemon needed on Render/cloud)
ENV LATEX_COMPILER=native

EXPOSE 5001

ENTRYPOINT ["java", "-jar", "app.jar"]
