
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-jammy

# Trimmed TeX Live (~1 GB) — covers the common templates (article, beamer, CV,
# letters, reports, fonts, math). Swap in texlive-full for exotic packages.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        texlive-latex-base \
        texlive-latex-recommended \
        texlive-latex-extra \
        texlive-fonts-recommended \
        texlive-fonts-extra \
        texlive-science \
        texlive-xetex \
        latexmk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar

ENV LATEX_COMPILER=native

EXPOSE 5001

ENTRYPOINT ["java", "-jar", "app.jar"]
